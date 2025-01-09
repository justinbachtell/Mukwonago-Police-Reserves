import { getCurrentUser, getUserById } from '@/actions/user'
import { UserEditForm } from '@/components/admin/forms/userEditForm'
import { notFound, redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/[id]/page.tsx'
})

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UserEditPage({
  params,
  searchParams: _searchParams
}: PageProps) {
  logger.info('Initializing user edit page', undefined, 'UserEditPage')
  logger.time('user-edit-page-load')

  try {
    // Get current user with error handling
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('No authenticated user found', undefined, 'UserEditPage')
      return redirect('/sign-in')
    }

    // Check admin role
    if (currentUser.role !== 'admin') {
      logger.warn(
        'Non-admin user attempted to access edit page',
        { userId: currentUser.id },
        'UserEditPage'
      )
      return redirect('/user/dashboard')
    }

    // Validate and parse user ID
    const { id } = await params
    if (!id || typeof id !== 'string') {
      logger.error('Invalid user ID', { id }, 'UserEditPage')
      return notFound()
    }

    // Get user to edit with error handling
    const userToEdit = await getUserById(id)
    if (!userToEdit) {
      logger.error('User not found', { id }, 'UserEditPage')
      return notFound()
    }

    logger.info(
      'User data retrieved successfully',
      {
        userId: userToEdit.id,
        email: userToEdit.email,
        role: userToEdit.role
      },
      'UserEditPage'
    )

    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='mb-8'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Edit User: {userToEdit.first_name} {userToEdit.last_name}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Update user information and manage their role.
          </p>
        </div>

        <div className='space-y-8'>
          <UserEditForm user={userToEdit} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in user edit page',
      logger.errorWithData(error),
      'UserEditPage'
    )
    return redirect('/error')
  } finally {
    logger.timeEnd('user-edit-page-load')
  }
}
