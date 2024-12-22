import { getCurrentUser } from '@/actions/user';
import { redirect } from 'next/navigation';

export default async function UserEditPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Edit User:
          {' '}
          {user.first_name}
          {' '}
          {user.last_name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Update user information and manage their role.
        </p>
      </div>

      <div className="space-y-8">
        {/* <UserEditForm user={user} /> */}
      </div>
    </div>
  );
}
