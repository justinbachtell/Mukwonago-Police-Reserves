import { UserManagementTable } from '@/components/admin/users/UserManagementTable'
import { getAllUsers } from '@/actions/user'
import { getAllApplications } from '@/actions/application'
import { createLogger } from '@/lib/debug'
import type { UserWithApplication } from './columns'

const logger = createLogger({
  module: 'admin',
  file: 'users/page.tsx'
})

export default async function UsersPage() {
  logger.info('Rendering users page', {}, 'UsersPage')
  logger.time('users-page-render')

  try {
    // Fetch users and applications in parallel
    const [users, applications] = await Promise.all([
      getAllUsers(),
      getAllApplications()
    ])

    logger.debug(
      'Fetched data',
      {
        userCount: users.length,
        applicationCount: applications.length
      },
      'UsersPage'
    )

    // Combine user data with application status
    const usersWithApplications: UserWithApplication[] = users.map(user => {
      const application = applications.find(app => app.user_id === user.id)
      return {
        ...user,
        application_status: application?.status ?? null
      }
    })

    return (
      <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
        <div className='flex flex-col gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              User Management
            </h1>
            <p className='text-muted-foreground'>
              Manage users, their roles, and equipment assignments.
            </p>
          </div>
          <UserManagementTable data={usersWithApplications} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error rendering users page',
      logger.errorWithData(error),
      'UsersPage'
    )
    throw error
  } finally {
    logger.timeEnd('users-page-render')
  }
}
