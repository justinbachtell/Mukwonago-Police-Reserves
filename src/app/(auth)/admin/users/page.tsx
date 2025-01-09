import type { DBUser } from '@/types/user'
import { getAllApplications } from '@/actions/application'
import { getAllUsers } from '@/actions/user'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/page.tsx'
})

type UserWithApplication = DBUser & {
  application_status: 'pending' | 'approved' | 'rejected' | null
}

export default async function UserManagementPage() {
  logger.info('Rendering user management page', undefined, 'UserManagementPage')
  logger.time('users-page-load')

  try {
    logger.info(
      'Fetching users and applications',
      undefined,
      'UserManagementPage'
    )
    const [users, applications] = await Promise.all([
      getAllUsers(),
      getAllApplications()
    ])

    logger.info(
      'Processing user data',
      {
        userCount: users?.length,
        applicationCount: applications?.length
      },
      'UserManagementPage'
    )

    const usersWithApplications: UserWithApplication[] = (users ?? []).map(
      user => {
        const application = (applications ?? []).find(
          app => app.user_id === user.id
        )
        logger.debug(
          'Processing user application status',
          {
            userId: user.id,
            applicationStatus: application?.status ?? null
          },
          'UserManagementPage'
        )

        return {
          ...user,
          application_status: application?.status ?? null,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    )

    logger.info(
      'User data processed successfully',
      { totalUsers: usersWithApplications.length },
      'UserManagementPage'
    )

    return (
      <div className='container mx-auto py-6'>
        <div className='mb-4'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            User Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Manage users, their roles, and equipment assignments.
          </p>
        </div>

        <div className='w-full space-y-4 overflow-x-auto'>
          <DataTable columns={columns} data={usersWithApplications} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in user management page',
      logger.errorWithData(error),
      'UserManagementPage'
    )
    throw error
  } finally {
    logger.timeEnd('users-page-load')
  }
}
