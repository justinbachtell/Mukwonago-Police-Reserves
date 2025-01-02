import { getCurrentUser } from '@/actions/user';
import { ContactsTable } from '@/components/reserves/ContactsTable';
import { db } from '@/libs/DB';
import { user } from '@/models/Schema';
import { eq, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function ContactsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/sign-in');
  }

  // Get all users who are members or admins
  const users = await db
    .select()
    .from(user)
    .where(or(eq(user.role, 'member'), eq(user.role, 'admin')))
    .orderBy(user.last_name, user.first_name);

  const contacts = users.map(u => ({
    ...u,
    created_at: new Date(u.created_at),
    updated_at: new Date(u.updated_at),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Department Contacts
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Contact information for all department members.
        </p>
      </div>
      <ContactsTable
        data={contacts}
        isAdmin={currentUser.role === "admin"}
      />
    </div>
  );
}
