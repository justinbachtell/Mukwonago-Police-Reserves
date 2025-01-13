import { getCurrentUser } from '@/actions/user';
import { ContactsTable } from '@/components/reserves/contacts/ContactsTable'
import { db } from '@/libs/DB'
import { eq, or } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type { DBUser } from '@/types/user'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { user } from '@/models/Schema'

const logger = createLogger({
  module: 'contacts',
  file: 'page.tsx'
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Department Contacts - Mukwonago Police Reserves',
  description: 'Contact information for all department members'
}

export default async function ContactsPage() {
  logger.info('Rendering contacts page', undefined, 'ContactsPage')
  logger.time('contacts-page-load')

  try {
    // Ensure only authenticated members and admins can access contacts
    const authUser = await getCurrentUser()
    if (
      !authUser ||
      !authUser.role ||
      (authUser.role !== 'admin' && authUser.role !== 'member')
    ) {
      logger.error('Unauthorized access to contacts', undefined, 'ContactsPage')
      return redirect('/sign-in')
    }

    logger.info('Fetching department contacts', undefined, 'ContactsPage')
    const users = await db
      .select()
      .from(user)
      .where(or(eq(user.role, 'member'), eq(user.role, 'admin')))
      .orderBy(user.first_name, user.last_name)

    if (!users) {
      logger.error('Failed to fetch contacts', undefined, 'ContactsPage')
      throw new Error('Failed to fetch contacts')
    }

    const contacts = users.map(u => ({
      ...u,
      first_name: u.first_name,
      last_name: u.last_name,
      created_at: toISOString(u.created_at),
      updated_at: toISOString(u.updated_at)
    })) satisfies DBUser[]

    logger.info(
      'Contacts processed successfully',
      { count: contacts.length },
      'ContactsPage'
    )

    return (
      <div className='container mx-auto'>
        <div className='mb-6 space-y-1'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl'>
            Department Contacts
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-300 sm:text-base'>
            Contact information for all department members.
          </p>
        </div>

        <div className='relative w-full overflow-x-auto'>
          <ContactsTable data={contacts} isAdmin={authUser.role === 'admin'} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in contacts page',
      logger.errorWithData(error),
      'ContactsPage'
    )
    throw error
  } finally {
    logger.timeEnd('contacts-page-load')
  }
}
