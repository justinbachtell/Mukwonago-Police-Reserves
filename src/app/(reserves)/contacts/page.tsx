import { getCurrentUser, getDepartmentContacts } from '@/actions/user'
import { ContactsTable } from '@/components/reserves/contacts/ContactsTable'
import { redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'

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
    const contacts = await getDepartmentContacts()

    if (!contacts) {
      logger.error('Failed to fetch contacts', undefined, 'ContactsPage')
      throw new Error('Failed to fetch contacts')
    }

    return (
      <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
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
