'use client'

import type { Policy } from '@/types/policy'
import { useState } from 'react'
import { getPolicyUrl, markPolicyAsAcknowledged } from '@/actions/policy'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { useToast } from '@/hooks/use-toast'
import { ArrowUpDown, CheckCircle, EyeIcon, Loader2 } from 'lucide-react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { createLogger } from '@/lib/debug'
import { DataTable } from '@/components/ui/data-table'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'policies',
  file: 'PoliciesTable.tsx'
})

interface PoliciesTableProps {
  data: Policy[]
  completedPolicies: Record<number, boolean>
  onPolicyAcknowledged?: (policyId: number) => void
}

function PolicyCell({
  policy,
  isCompleted,
  onPolicyAcknowledged
}: {
  policy: Policy
  isCompleted: boolean
  onPolicyAcknowledged?: (policyId: number) => void
}) {
  const { toast } = useToast()
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    return extension === 'pdf' ? 'pdf' : 'doc'
  }

  const getWordViewerUrl = (fileUrl: string) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
  }

  const handlePolicyView = async () => {
    logger.info('Viewing policy', { policyId: policy.id }, 'handlePolicyView')
    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setFileUrl(signedUrl)
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
    <div className='flex items-center gap-2'>
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='max-h-[90vh] w-[90vw] max-w-[90vw] p-0'>
          <DialogHeader className='border-b px-6 py-4'>
            <DialogTitle>
              {policy.name} - {policy.policy_number}
            </DialogTitle>
          </DialogHeader>
          {fileUrl && (
            <div className='overflow-hidden'>
              {getFileType(policy.policy_url) === 'pdf' ? (
                <PDFViewer url={fileUrl} />
              ) : (
                <iframe
                  src={getWordViewerUrl(fileUrl)}
                  width='100%'
                  height='800px'
                  className='w-full border-0'
                  title={`${policy.name} - ${policy.policy_number}`}
                  allowFullScreen
                  // eslint-disable-next-line react-dom/no-unsafe-iframe-sandbox
                  sandbox='allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation'
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function PoliciesTable({
  data,
  completedPolicies,
  onPolicyAcknowledged
}: PoliciesTableProps) {
  logger.info(
    'Rendering policies table',
    { policiesCount: data.length },
    'PoliciesTable'
  )
  logger.time('policies-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([])

    const columns: ColumnDef<Policy>[] = [
      {
        accessorKey: 'policy_number',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Policy #
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className='block px-4'>{row.getValue('policy_number')}</span>
        )
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Policy Name
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => (
          <span className='block px-4'>{row.getValue('name')}</span>
        )
      },
      {
        accessorKey: 'policy_type',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Type
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          const type = row.getValue('policy_type') as string
          return (
            <Badge variant='outline' className='px-4 py-1 capitalize'>
              {formatEnumValueWithMapping(type)}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'effective_date',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Effective Date
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          const date = new Date(row.getValue('effective_date'))
          return <span className='block px-4'>{date.toLocaleDateString()}</span>
        }
      },
      {
        id: 'status',
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Status
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          const policy = row.original
          const isCompleted = completedPolicies[policy.id] ?? false
          return (
            <Badge
              variant={isCompleted ? 'default' : 'secondary'}
              className='px-4 py-1 capitalize'
            >
              {isCompleted ? 'Completed' : 'Pending'}
            </Badge>
          )
        },
        sortingFn: (rowA, rowB) => {
          const aCompleted = completedPolicies[rowA.original.id] ?? false
          const bCompleted = completedPolicies[rowB.original.id] ?? false
          return aCompleted === bCompleted ? 0 : aCompleted ? 1 : -1
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <PolicyCell
            policy={row.original}
            isCompleted={completedPolicies[row.original.id] ?? false}
            onPolicyAcknowledged={onPolicyAcknowledged}
          />
        )
      }
    ]

    return (
      <DataTable
        columns={columns}
        data={data}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering policies table',
      logger.errorWithData(error),
      'PoliciesTable'
    )
    throw error
  } finally {
    logger.timeEnd('policies-table-render')
  }
}
