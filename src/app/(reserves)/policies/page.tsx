import { PoliciesView } from '@/components/reserves/policies/PoliciesView'
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

export const metadata = {
  title: 'Policies - Mukwonago Police Reserves',
  description: 'View and acknowledge required department policies'
}

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
      <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
        <PoliciesView
          policies={policies}
          completedPolicies={completedPolicies}
        />
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
