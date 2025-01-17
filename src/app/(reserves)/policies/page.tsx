import { getPoliciesWithCompletionStatus } from '@/actions/policy'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollText } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { PoliciesView } from '@/components/reserves/policies/PoliciesView'

const logger = createLogger({
  module: 'policies',
  file: 'policies/page.tsx'
})

export const metadata = {
  title: 'Policies - Mukwonago Police Reserves',
  description: 'View and acknowledge required department policies'
}

export default async function PoliciesPage() {
  logger.info('Initializing policies page', undefined, 'PoliciesPage')
  logger.time('policies-page-load')

  try {
    const user = await getCurrentUser()
    if (!user) {
      logger.warn('No authenticated user found', undefined, 'PoliciesPage')
      return redirect('/sign-in')
    }

    const policiesStatus = await getPoliciesWithCompletionStatus()
    if (!policiesStatus) {
      logger.error('Failed to fetch policies', undefined, 'PoliciesPage')
      throw new Error('Failed to fetch policies')
    }

    const completedPoliciesCount = Object.values(
      policiesStatus?.completedPolicies ?? {}
    ).filter(Boolean).length

    const policyCompletionRate = Math.round(
      (completedPoliciesCount / (policiesStatus?.policies?.length ?? 0)) * 100
    )

    logger.info(
      'Policies data loaded successfully',
      {
        userId: user.id,
        totalPolicies: policiesStatus?.policies?.length,
        completedPolicies: completedPoliciesCount
      },
      'PoliciesPage'
    )

    return (
      <div className='container mx-auto min-h-screen px-4 pt-4 md:px-6 lg:px-10'>
        {/* Stats Card */}
        <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ScrollText className='size-5 text-indigo-500' />
              Policy Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-3'>
            <div>
              <p className='text-sm text-muted-foreground'>Total Policies</p>
              <p className='mt-1 text-2xl font-bold'>
                {policiesStatus?.policies?.length ?? 0}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Completed</p>
              <p className='mt-1 text-2xl font-bold'>
                {completedPoliciesCount}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Completion Rate</p>
              <p className='mt-1 text-2xl font-bold'>{policyCompletionRate}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Policies View */}
        <PoliciesView
          policies={policiesStatus.policies}
          completedPolicies={policiesStatus.completedPolicies}
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
