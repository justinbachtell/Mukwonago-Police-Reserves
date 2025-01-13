import type { Metadata } from 'next'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { getPolicyById, getPolicyCompletionStatus } from '@/actions/policy'

const logger = createLogger({
  module: 'policies',
  file: '[id]/page.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export const metadata: Metadata = {
  title: 'View Policy - Mukwonago Police Reserves',
  description: 'View and acknowledge department policies'
}

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function PolicyPage({ params }: Props) {
  logger.info('Rendering policy page', undefined, 'PolicyPage')
  logger.time('policy-page-load')

  try {
    const { id } = await params
    logger.info('Processing request for policy', { id }, 'PolicyPage')

    // Validate and parse policy ID
    const policyId = Number.parseInt(id, 10)
    if (Number.isNaN(policyId)) {
      logger.error('Invalid policy ID', { id }, 'PolicyPage')
      return notFound()
    }

    // Ensure only authenticated members and admins can access policies
    const user = await getCurrentUser()
    if (
      !user ||
      !user.role ||
      (user.role !== 'admin' && user.role !== 'member')
    ) {
      logger.error('Unauthorized access to policy', { id }, 'PolicyPage')
      return redirect('/sign-in')
    }

    const policyData = await getPolicyById(policyId)
    if (!policyData || !policyData.policy) {
      logger.error('Policy not found', { id }, 'PolicyPage')
      return notFound()
    }

    const completionStatus = await getPolicyCompletionStatus(policyId)
    const { policy, url } = policyData

    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-bold'>{policy.name}</h1>
            <p className='text-muted-foreground'>
              Policy Number: {policy.policy_number}
            </p>
            <p className='text-muted-foreground'>Type: {policy.policy_type}</p>
            <p className='text-muted-foreground'>
              Effective Date:{' '}
              {format(new Date(policy.effective_date), 'MM/dd/yyyy')}
            </p>
            {policy.description && (
              <p className='text-muted-foreground'>{policy.description}</p>
            )}
            {completionStatus && (
              <p className='text-green-600 dark:text-green-400'>
                ✓ You have acknowledged this policy
              </p>
            )}
          </div>

          {url ? <PDFViewer url={url} /> : <p>PDF not available</p>}
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error fetching policy',
      logger.errorWithData(error),
      'PolicyPage'
    )
    throw error
  } finally {
    logger.timeEnd('policy-page-load')
  }
}
