import { getAssignedEquipment, getCurrentAssignedEquipment } from '@/actions/assignedEquipment';
import { getAvailableEquipment } from '@/actions/equipment';
import { getCurrentUniformSizes } from '@/actions/uniformSizes';
import { getCurrentUser, getUserById } from '@/actions/user';
import { AssignEquipmentForm } from '@/components/admin/forms/assignEquipmentForm';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UserEquipmentPage({
  params,
  searchParams: _searchParams,
}: PageProps) {
  try {
    // Get current user with error handling
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/sign-in');
    }

    // Check admin role
    if (currentUser.role !== 'admin') {
      redirect('/user/dashboard');
    }

    // Validate and parse user ID
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return notFound();
    }

    const userId = Number.parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return notFound();
    }

    // Get user to edit with error handling
    const userToEdit = await getUserById(userId);
    if (!userToEdit) {
      return notFound();
    }

    // Get current assigned equipment, all assigned equipment history, available equipment, and uniform sizes
    const [currentAssignedEquipment, assignedEquipment, availableEquipment, currentUniformSizes] = await Promise.all([
      getCurrentAssignedEquipment(userId),
      getAssignedEquipment(userId),
      getAvailableEquipment(),
      getCurrentUniformSizes(userId),
    ]);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Equipment & Uniform Management:
            {' '}
            {userToEdit.first_name}
            {' '}
            {userToEdit.last_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage user's equipment assignments and uniform sizes.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1">
          <AssignEquipmentForm
            user={userToEdit}
            assignedEquipment={currentAssignedEquipment ? [currentAssignedEquipment] : null}
            assignedEquipmentHistory={assignedEquipment}
            availableEquipment={availableEquipment}
            currentUniformSizes={currentUniformSizes}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in UserEquipmentPage:', error);
    redirect('/error');
  }
}
