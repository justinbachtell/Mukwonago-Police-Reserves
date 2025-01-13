import { PoliciesTable } from '@/components/policies/PoliciesTable'
import { getPoliciesWithCompletionStatus } from '@/actions/policy'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'

const logger = createLogger({
  module: 'policies',
  file: 'page.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export default async function PoliciesPage() {
  logger.info('Rendering policies page', undefined, 'PoliciesPage')
  logger.time('policies-page-load')

  try {
    // Ensure only authenticated members and admins can access policies
    const user = await getCurrentUser()
    if (
      !user ||
      !user.role ||
      (user.role !== 'admin' && user.role !== 'member')
    ) {
      logger.error('Unauthorized access to policies', undefined, 'PoliciesPage')
      return redirect('/sign-in')
    }

    const data = await getPoliciesWithCompletionStatus()
    if (!data) {
      logger.error('Failed to fetch policies', undefined, 'PoliciesPage')
      throw new Error('Failed to fetch policies')
    }

    const { policies, completedPolicies } = data

    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <h1 className='mb-6 text-2xl font-bold'>Policies</h1>
        <div className='flex flex-col gap-6'>
          <PoliciesTable
            data={policies}
            completedPolicies={completedPolicies}
          />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in policies page',
      logger.errorWithData(error),
      'PoliciesPage'
    )
    throw error
  } finally {
    logger.timeEnd('policies-page-load')
  }
}
