'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';
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
import { getAssignedEquipment } from '@/actions/assignedEquipment';
import { formatDate } from '@/lib/utils';

interface AssignedEquipmentFormProps {
  user: DBUser
  saveRef: React.MutableRefObject<(() => Promise<SaveResult>) | null>
}

type AssignedEquipmentWithDates = Omit<
  AssignedEquipment,
  | 'checked_out_at'
  | 'checked_in_at'
  | 'expected_return_date'
  | 'created_at'
  | 'updated_at'
  | 'equipment'
> & {
  checked_out_at: Date
  checked_in_at: Date | null
  expected_return_date: Date | null
  created_at: Date
  updated_at: Date
  equipment: {
    id: number
    name: string
    description: string | null
    serial_number: string | null
    purchase_date: Date | null
    notes: string | null
    is_assigned: boolean
    assigned_to: number | null
    created_at: Date
    updated_at: Date
    is_obsolete: boolean
  } | null
}

export function AssignedEquipmentForm({ saveRef, user }: AssignedEquipmentFormProps) {
  const [assignedEquipment, setAssignedEquipment] = useState<AssignedEquipmentWithDates[]>([]);

  useEffect(() => {
    const loadEquipment = async () => {
      const equipment = await getAssignedEquipment(user.id);
      const sortedEquipment = equipment
        .map(item => ({
          ...item,
          checked_in_at: item.checked_in_at ? new Date(item.checked_in_at) : null,
          checked_out_at: new Date(item.checked_out_at),
          created_at: new Date(item.created_at),
          equipment: item.equipment
            ? {
              ...item.equipment,
              purchase_date: item.equipment.purchase_date
                ? new Date(item.equipment.purchase_date)
                : null,
              created_at: new Date(item.equipment.created_at),
              updated_at: new Date(item.equipment.updated_at),
              is_obsolete: item.equipment.is_obsolete ?? false,
            }
            : null,
          expected_return_date: item.expected_return_date
            ? new Date(item.expected_return_date)
            : null,
          updated_at: new Date(item.updated_at),
        }))
        .sort((a, b) => {
          if (!a.checked_in_at && b.checked_in_at) {
            return -1;
          }
          if (a.checked_in_at && !b.checked_in_at) {
            return 1;
          }
          return b.checked_out_at.getTime() - a.checked_out_at.getTime();
        })
      setAssignedEquipment(sortedEquipment);
    }
    loadEquipment();
  }, [user.id]);

  const handleSaveChanges = useCallback(async () => {
    return { message: 'No changes needed', success: true };
  }, []);

  useEffect(() => {
    saveRef.current = handleSaveChanges;
  }, [handleSaveChanges, saveRef]);

  return (
    <Card className="p-6 shadow-md md:col-span-12">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Assigned Equipment
      </h2>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignedEquipment.length === 0
            ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No equipment assigned
                </TableCell>
              </TableRow>
            )
            : (
              assignedEquipment.map(item => (
                <TableRow key={item.id} className={item.checked_in_at ? 'opacity-40' : ''}>
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
                  <TableCell>{formatDate(item.checked_out_at.toISOString())}</TableCell>
                  <TableCell>
                    {item.expected_return_date
                      ? formatDate(item.expected_return_date.toISOString())
                      : 'Not specified'}
                  </TableCell>
                  <TableCell>
                    {item.checked_in_at
                      ? formatDate(item.checked_in_at.toISOString())
                      : 'Not returned'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.checked_in_at ? 'secondary' : 'default'}>
                      {item.checked_in_at ? 'Returned' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.notes || 'No notes'}</TableCell>
                </TableRow>
              ))
            )}
        </TableBody>
      </Table>
    </Card>
  );
}
