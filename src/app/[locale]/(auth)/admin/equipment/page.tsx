import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';

export default async function EquipmentManagementPage() {
  // const equipment = await getAllEquipment();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // const assignedEquipment = await getAssignedEquipment(user.id);

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

      <div className="grid gap-8 md:grid-cols-2">
        {/* {assignedEquipment.length > 0
          ? (
              <EquipmentForm />
            )
          : (
              <div>
                <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
                  Equipment List
                </h2>
                <DataTable columns={columns} data={equipment} />
              </div>
            )} */}
      </div>
    </div>
  );
}
