import { getAssignedEquipment } from '@/actions/assignedEquipment';
import { getAvailableEquipment } from '@/actions/equipment';
import { getCurrentUser, getUserById } from '@/actions/user';
import { AssignEquipmentForm } from '@/components/admin/forms/assignEquipmentForm';
import { ReturnEquipmentForm } from '@/components/admin/forms/returnEquipmentForm';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserEquipmentPage({ params }: Props) {
  // Await the params first
  const { id } = await params;
  const userId = Number.parseInt(id, 10);

  const [currentUser, targetUser, availableEquipmentData, assignedEquipmentData] = await Promise.all([
    getCurrentUser(),
    getUserById(userId),
    getAvailableEquipment(),
    getAssignedEquipment(userId),
  ]);

  if (!currentUser) {
    redirect('/sign-in');
  }

  if (currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  if (!targetUser) {
    redirect('/admin/users');
  }

  const availableEquipment = availableEquipmentData.map(item => ({
    ...item,
    purchase_date: item.purchase_date ? new Date(item.purchase_date) : null,
    created_at: new Date(item.created_at),
    updated_at: new Date(item.updated_at),
  }));

  const assignedEquipment = assignedEquipmentData
    .map(item => ({
      ...item,
      checked_out_at: new Date(item.checked_out_at),
      checked_in_at: item.checked_in_at ? new Date(item.checked_in_at) : null,
      expected_return_date: item.expected_return_date ? new Date(item.expected_return_date) : null,
      created_at: new Date(item.created_at),
      updated_at: new Date(item.updated_at),
      equipment: item.equipment
        ? {
            ...item.equipment,
            purchase_date: item.equipment.purchase_date ? new Date(item.equipment.purchase_date) : null,
            created_at: new Date(item.equipment.created_at),
            updated_at: new Date(item.equipment.updated_at),
          }
        : null,
    }))
    .sort((a, b) => {
      if (!a.checked_in_at && b.checked_in_at) {
        return -1;
      }
      if (a.checked_in_at && !b.checked_in_at) {
        return 1;
      }

      const checkOutDiff = b.checked_out_at.getTime() - a.checked_out_at.getTime();
      if (checkOutDiff !== 0) {
        return checkOutDiff;
      }

      if (a.checked_in_at && b.checked_in_at) {
        return b.checked_in_at.getTime() - a.checked_in_at.getTime();
      }
      return 0;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Assign Equipment to
          {' '}
          {targetUser.first_name}
          {' '}
          {targetUser.last_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage equipment assignments for this user.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-3 p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Assign New Equipment
          </h2>
          <AssignEquipmentForm user={targetUser} availableEquipment={availableEquipment} />
        </Card>

        <Card className="col-span-9 p-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Assigned Equipment
          </h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Checked Out</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Returned On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedEquipment.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No equipment assigned
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      assignedEquipment.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.equipment?.name}
                            {item.equipment?.serial_number && (
                              <span className="ml-1 text-sm text-muted-foreground">
                                (
                                {item.equipment.serial_number}
                                )
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{item.condition}</TableCell>
                          <TableCell>{item.checked_out_at.toLocaleDateString()}</TableCell>
                          <TableCell>
                            {item.expected_return_date?.toLocaleDateString() || 'Not specified'}
                          </TableCell>
                          <TableCell>
                            {item.checked_in_at ? item.checked_in_at.toLocaleDateString() : 'Not returned'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.checked_in_at ? 'secondary' : 'default'}>
                              {item.checked_in_at ? 'Returned' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.notes || 'No notes'}</TableCell>
                          <TableCell>
                            {!item.checked_in_at
                              ? (
                                  <ReturnEquipmentForm
                                    assignmentId={item.id}
                                    currentCondition={item.condition}
                                  />
                                )
                              : (
                                  <p>
                                    Returned
                                    {' '}
                                    {item.checked_in_at.toLocaleDateString()}
                                  </p>
                                )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
