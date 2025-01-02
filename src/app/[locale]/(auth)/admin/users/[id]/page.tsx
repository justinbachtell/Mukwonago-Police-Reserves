import { getCurrentUser, getUserById } from '@/actions/user';
import { UserEditForm } from '@/components/admin/forms/userEditForm';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserEditPage({ params, searchParams: _searchParams }: PageProps) {
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

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Edit User:
            {' '}
            {userToEdit.first_name}
            {' '}
            {userToEdit.last_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Update user information and manage their role.
          </p>
        </div>

        <div className="space-y-8">
          <UserEditForm user={userToEdit} />
        </div>
      </div>
    );
  }
  catch (error) {
    console.error('Error in UserEditPage:', error);
    redirect('/error'); // Create this page or redirect to appropriate error page
  }
}
