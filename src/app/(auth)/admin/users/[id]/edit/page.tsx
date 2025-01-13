import { getCurrentUser, getUserById } from '@/actions/user'
import { UserEditForm } from '@/components/admin/forms/userEditForm'
import { createLogger } from '@/lib/debug'
import { redirect } from 'next/navigation'

const logger = createLogger({
  module: 'admin',
  file: 'users/[id]/edit/page.tsx'
})

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = params

  logger.info('Initializing edit user page', { userId: id }, 'EditUserPage')
  logger.time('edit-user-page-load')

  try {
    // Get current user to check permissions
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.warn(
        'Unauthorized access attempt',
        { userId: currentUser?.id },
        'EditUserPage'
      )
      return redirect('/user/dashboard')
    }

    // Get user to edit
    const user = await getUserById(id)
    if (!user) {
      logger.error('User not found', { userId: id }, 'EditUserPage')
      return redirect('/admin/users')
    }

    return (
      <div className='container mx-auto py-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Edit User</h1>
          <p className='mt-2 text-muted-foreground'>
            Edit user information and permissions
          </p>
        </div>

        <UserEditForm user={user} />
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in edit user page',
      logger.errorWithData(error),
      'EditUserPage'
    )
    throw error
  } finally {
    logger.timeEnd('edit-user-page-load')
  }
}
