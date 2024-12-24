import { getAllUsers } from '@/actions/user';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export default async function UserManagementPage() {
  const users = await getAllUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage users, their roles, and equipment assignments.
        </p>
      </div>

      <div className="w-full space-y-4 overflow-x-auto">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
}
