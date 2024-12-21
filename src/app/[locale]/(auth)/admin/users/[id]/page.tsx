import { getUserById } from '@/actions/user';
import { UserEditForm } from '@/components/admin/forms/userEditForm';
import { notFound } from 'next/navigation';

type UserEditPageProps = {
  params: {
    id: string;
  };
};

export default async function UserEditPage({ params }: UserEditPageProps) {
  const user = await getUserById(Number(params.id));

  if (!user) {
    notFound();
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
        <UserEditForm user={user} />
      </div>
    </div>
  );
}
