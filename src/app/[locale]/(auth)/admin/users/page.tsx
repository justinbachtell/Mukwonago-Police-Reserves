import type { DBUser } from '@/types/user';
import { getAllApplications } from '@/actions/application';
import { getAllUsers } from '@/actions/user';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

type UserWithApplication = Omit<DBUser, 'created_at' | 'updated_at'> & {
  application_status: 'pending' | 'approved' | 'rejected' | null
  created_at: string
  updated_at: string
}

export default async function UserManagementPage() {
  const users = await getAllUsers();
  const applications = await getAllApplications();

  const usersWithApplications: UserWithApplication[] = users.map((user) => {
    const application = applications.find(application => application.user_id === user.id);
    return {
      ...user,
      application_status: application?.status ?? null,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage users, their roles, and equipment assignments.
        </p>
      </div>

      <div className="w-full space-y-4 overflow-x-auto">
        <DataTable columns={columns} data={usersWithApplications} />
      </div>
    </div>
  );
}
