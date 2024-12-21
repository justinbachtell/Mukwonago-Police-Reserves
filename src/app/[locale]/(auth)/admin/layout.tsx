import { getCurrentUser } from '@/actions/user';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <nav className="flex space-x-4">
          <Link
            href="/admin/users"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            User Management
          </Link>
          <Link
            href="/admin/equipment"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Equipment Management
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
