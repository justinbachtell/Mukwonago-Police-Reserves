import { getAllPolicies } from '@/actions/policy'
import { PoliciesClient } from '@/components/admin/policies/PoliciesClient'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'policies/page.tsx'
})

export default async function AdminPoliciesPage() {
  logger.info('Rendering policies page', undefined, 'AdminPoliciesPage')
  logger.time('policies-page-load')

  try {
    const [currentUser, policies] = await Promise.all([
      getCurrentUser(),
      getAllPolicies()
    ])

    if (!currentUser) {
      logger.warn(
        'No user found, redirecting to sign-in',
        undefined,
        'AdminPoliciesPage'
      )
      redirect('/sign-in')
    }

    if (currentUser.role !== 'admin') {
      logger.warn(
        'Non-admin user access attempt',
        { userId: currentUser.id },
        'AdminPoliciesPage'
      )
      redirect('/user/dashboard')
    }

    logger.info(
      'Policies loaded successfully',
      { count: policies?.length },
      'AdminPoliciesPage'
    )

    return (
      <div className='container mx-auto py-6'>
        <div className='mb-4'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Policy Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage policies for reserve officers.
          </p>
        </div>

        <div className='w-full space-y-4 overflow-x-auto'>
          <PoliciesClient data={policies ?? []} />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in policies page',
      logger.errorWithData(error),
      'AdminPoliciesPage'
    )
    throw error
  } finally {
    logger.timeEnd('policies-page-load')
  }
}
