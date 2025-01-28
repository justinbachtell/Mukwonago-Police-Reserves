'use client'

import type { Policy } from '@/types/policy'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import {
  CalendarDays,
  ScrollText,
  CheckCircle,
  EyeIcon,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { getPolicyUrl, markPolicyAsAcknowledged } from '@/actions/policy'
import { useToast } from '@/hooks/use-toast'
import { createLogger } from '@/lib/debug'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'policies',
  file: 'PoliciesGrid.tsx'
})

interface PoliciesGridProps {
  data: Policy[]
  completedPolicies: Record<number, boolean>
  onPolicyAcknowledged?: (policyId: number) => void
}

export function PoliciesGrid({
  data,
  completedPolicies,
  onPolicyAcknowledged
}: PoliciesGridProps) {
  // Sort policies: unread first, then by effective date
  const sortedPolicies = [...data].sort((a, b) => {
    const aCompleted = completedPolicies[a.id] ?? false
    const bCompleted = completedPolicies[b.id] ?? false

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }

    return (
      new Date(b.effective_date).getTime() -
      new Date(a.effective_date).getTime()
    )
  })

  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {sortedPolicies.map(policy => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          isCompleted={completedPolicies[policy.id] ?? false}
          onPolicyAcknowledged={onPolicyAcknowledged}
        />
      ))}
    </div>
  )
}

interface PolicyCardProps {
  policy: Policy
  isCompleted: boolean
  onPolicyAcknowledged?: (policyId: number) => void
}

function PolicyCard({
  policy,
  isCompleted,
  onPolicyAcknowledged
}: PolicyCardProps) {
  const { toast } = useToast()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)

  const handlePolicyView = async () => {
    logger.info('Viewing policy', { policyId: policy.id }, 'handlePolicyView')
    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setPdfUrl(signedUrl)
      setIsOpen(true)
      setHasBeenViewed(true)
      logger.info(
        'Policy URL generated',
        { policyId: policy.id },
        'handlePolicyView'
      )
    } catch (error) {
      logger.error(
        'Failed to load policy',
        logger.errorWithData(error),
        'handlePolicyView'
      )
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load policy'
      })
    }
  }

  const handleMarkAsAcknowledged = async () => {
    if (isLoading || !hasBeenViewed) {
      return
    }

    setIsLoading(true)
    logger.info(
      'Marking policy as acknowledged',
      { policyId: policy.id },
      'handleMarkAsAcknowledged'
    )

    try {
      await markPolicyAsAcknowledged(policy.id)
      onPolicyAcknowledged?.(policy.id)
      logger.info(
        'Policy marked as read',
        { policyId: policy.id },
        'handleMarkAsAcknowledged'
      )
      toast({
        title: 'Success',
        description: 'Policy marked as read'
      })
    } catch (error) {
      logger.error(
        'Failed to mark policy as read',
        logger.errorWithData(error),
        'handleMarkAsAcknowledged'
      )
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark policy as read'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='flex flex-col bg-white/80 shadow-md transition-all hover:shadow-lg dark:bg-white/5'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              {policy.name}
            </h3>
            <div className='mt-2 flex flex-wrap gap-2'>
              <Badge variant='outline' className='capitalize'>
                {formatEnumValueWithMapping(policy.policy_type)}
              </Badge>
              <Badge
                variant={isCompleted ? 'default' : 'secondary'}
                className='capitalize'
              >
                {isCompleted ? 'Completed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex grow flex-col space-y-4'>
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
          <ScrollText className='size-4' />
          <span>Policy #{policy.policy_number}</span>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
          <CalendarDays className='size-4' />
          <span>
            Effective {format(new Date(policy.effective_date), 'MMMM d, yyyy')}
          </span>
        </div>
        {policy.description && (
          <p className='text-sm text-gray-600 dark:text-gray-300'>
            {policy.description}
          </p>
        )}
        <div className='mt-auto flex flex-col gap-2 pt-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handlePolicyView}
            className='flex items-center gap-2'
          >
            <EyeIcon className='size-4' />
            View Policy
          </Button>
          {!isCompleted && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleMarkAsAcknowledged}
              disabled={isLoading || !hasBeenViewed}
              className='flex items-center gap-2'
              title={
                !hasBeenViewed
                  ? 'You must view the policy before acknowledging it'
                  : ''
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-1 size-4 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className='size-4' />
                  Acknowledge
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] w-[90vw] max-w-[90vw] p-0'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {policy.name} - {policy.policy_number}
            </DialogTitle>
          </DialogHeader>
          {pdfUrl && (
            <div className='overflow-hidden'>
              <PDFViewer url={pdfUrl} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
