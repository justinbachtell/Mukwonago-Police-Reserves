import { getCurrentUniformSizes } from '@/actions/uniformSizes';
import { getUserById } from '@/actions/user';
import { UniformSizesForm } from '@/components/forms/uniformSizesForm';
import { notFound } from 'next/navigation';

type UserEquipmentPageProps = {
  params: {
    id: string;
  };
};

export default async function UserEquipmentPage({ params }: UserEquipmentPageProps) {
  const user = await getUserById(Number(params.id));

  if (!user) {
    notFound();
  }

  const currentSizes = await getCurrentUniformSizes(user.id);
  // const currentAssignedEquipment = await getAssignedEquipment(user.id) || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Equipment Management:
          {' '}
          {user.first_name}
          {' '}
          {user.last_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage user's uniform sizes and equipment assignments.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <UniformSizesForm user={user} currentSizes={currentSizes} />
        {/* <EquipmentForm user={user} assignedEquipment={currentAssignedEquipment} /> */}
      </div>
    </div>
  );
}
