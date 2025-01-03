import { getAllEquipment } from '@/actions/equipment'
import { getAllUsers, getCurrentUser } from '@/actions/user'
import { EquipmentForm } from '@/components/admin/forms/equipmentForm'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { redirect } from 'next/navigation'

import type { EquipmentWithUser } from './columns'

import { columns } from './columns';

export default async function AdminEquipmentPage() {
  const [equipmentData, currentUser, users] = await Promise.all([
    getAllEquipment(),
    getCurrentUser(),
    getAllUsers(),
  ]);

  if (!currentUser) {
    redirect('/sign-in');
  }

  if (currentUser.role !== 'admin') {
    redirect('/user/dashboard')
  }

  const equipment: EquipmentWithUser[] = equipmentData.map((item) => {
    const assignedUser = users.find(u => u.id === item.assigned_to);
    return {
      ...item,
      assignedUserName: assignedUser
        ? `${assignedUser.first_name} ${assignedUser.last_name}`
        : null,
      condition: 'good',
      created_at: new Date(item.created_at),
      purchase_date: item.purchase_date ? new Date(item.purchase_date) : null,
      updated_at: new Date(item.updated_at),
    };
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Equipment Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create and manage equipment for the department.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-3">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Create New Equipment
          </h2>
          <EquipmentForm />
        </Card>

        <Card className="p-6 lg:col-span-9">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
            Equipment List
          </h2>
          <DataTable columns={columns} data={equipment} />
        </Card>
      </div>
    </div>
  );
}
