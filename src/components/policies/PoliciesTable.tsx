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
import { toast } from 'sonner'
import { ArrowUpDown, CheckCircle, EyeIcon } from 'lucide-react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { toISOString } from '@/lib/utils'
import { format } from 'date-fns'
import { createLogger } from '@/lib/debug'

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handlePolicyView = async () => {
    logger.info('Viewing policy', { policyId: policy.id }, 'handlePolicyView')
    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setPdfUrl(signedUrl)
      setIsOpen(true)
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
      toast.error('Failed to load policy')
    }
  }

  const handleMarkAsAcknowledged = async () => {
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
      toast.success('Policy marked as read')
    } catch (error) {
      logger.error(
        'Failed to mark policy as read',
        logger.errorWithData(error),
        'handleMarkAsAcknowledged'
      )
      toast.error('Failed to mark policy as read')
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
          className='flex items-center gap-2'
        >
          <CheckCircle className='size-4' />
          Acknowledge
        </Button>
      )}
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
    </div>
  )
}

function getColumns(
  completedPolicies: Record<number, boolean>,
  onPolicyAcknowledged?: (policyId: number) => void
): ColumnDef<Policy>[] {
  logger.debug(
    'Initializing columns',
    { completedPoliciesCount: Object.keys(completedPolicies).length },
    'getColumns'
  )

  return [
    {
      accessorKey: 'policy_number',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Policy Number
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('policy_number')}</div>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      )
    },
    {
      accessorKey: 'policy_type',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Type
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('policy_type') as string
        return (
          <Badge variant='outline' className='capitalize'>
            {type === 'use_of_force' ? 'Use of Force' : type.replace('_', ' ')}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'effective_date',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Effective Date
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      ),
      cell: ({ row }) => {
        const date = toISOString(new Date(row.getValue('effective_date')))
        return <div>{format(date, 'PPP')}</div>
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const policy = row.original
        return (
          <PolicyCell
            policy={policy}
            isCompleted={completedPolicies[policy.id] ?? false}
            onPolicyAcknowledged={onPolicyAcknowledged}
          />
        )
      }
    }
  ]
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
    const columns = getColumns(completedPolicies, onPolicyAcknowledged)

    logger.debug(
      'Table state initialized',
      {
        sorting,
        columnsCount: columns.length,
        completedPoliciesCount: Object.keys(completedPolicies).length
      },
      'PoliciesTable'
    )

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
