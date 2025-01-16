import { getPoliciesWithCompletionStatus } from '@/actions/policy'
import { getCurrentUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollText, ListPlus } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'policies',
  file: 'user/policies/page.tsx'
})

export const metadata = {
  title: 'My Policies - Mukwonago Police Reserves',
  description: 'View and complete required policies'
}

export default async function UserPoliciesPage() {
  logger.info('Initializing policies page', undefined, 'UserPoliciesPage')
  logger.time('policies-page-load')

  try {
    const user = await getCurrentUser()
    if (!user) {
      logger.warn('No authenticated user found', undefined, 'UserPoliciesPage')
      return redirect('/sign-in')
    }

    const policiesStatus = await getPoliciesWithCompletionStatus()
    if (!policiesStatus) {
      logger.error('Failed to fetch policies', undefined, 'UserPoliciesPage')
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
      'UserPoliciesPage'
    )

    return (
      <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>My Policies</h1>
            <p className='mt-2 text-muted-foreground'>
              View and complete required policies
            </p>
          </div>
          <div className='flex items-center gap-4'>
            <Link href='/policies'>
              <Button variant='outline' className='gap-2'>
                <ListPlus className='size-4' />
                View All Policies
              </Button>
            </Link>
          </div>
        </div>

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

        {/* Policies List */}
        <div className='space-y-4'>
          {policiesStatus?.policies?.map(policy => (
            <Card
              key={policy.id}
              className='flex flex-col bg-white/80 shadow-md transition-all hover:shadow-lg dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='p-6'>
                <h3 className='text-xl font-semibold'>{policy.name}</h3>
                {policy.description && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {policy.description}
                  </p>
                )}
              </div>
              <div className='border-t p-6 sm:border-l sm:border-t-0'>
                <Badge
                  variant={
                    policiesStatus.completedPolicies[policy.id]
                      ? 'default'
                      : 'secondary'
                  }
                  className='px-4 py-1'
                >
                  {policiesStatus.completedPolicies[policy.id]
                    ? 'Completed'
                    : 'Pending'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in policies page',
      logger.errorWithData(error),
      'UserPoliciesPage'
    )
    throw error
  } finally {
    logger.timeEnd('policies-page-load')
  }
}
