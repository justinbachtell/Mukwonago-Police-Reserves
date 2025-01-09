'use client'

import type { Policy } from '@/types/policy'
import { useState } from 'react'
import { getPolicyUrl } from '@/actions/policy'
import {
  ArrowUpDown,
  ClipboardList,
  EyeIcon,
  LoaderCircle,
  Trash
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { toISOString } from '@/lib/utils'
import { format } from 'date-fns'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'AdminPoliciesTable.tsx'
})

interface AdminPoliciesTableProps {
  data?: Policy[]
  onDelete: (id: number) => void
}

function PolicyCell({ policy }: { policy: Policy }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handlePolicyView = async () => {
    logger.info('Viewing policy', { policyId: policy.id }, 'PolicyCell')
    logger.time(`view-policy-${policy.id}`)

    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setPdfUrl(signedUrl)
      setIsOpen(true)
      logger.info(
        'Policy URL generated successfully',
        { policyId: policy.id },
        'PolicyCell'
      )
    } catch (error) {
      logger.error(
        'Error viewing policy',
        logger.errorWithData(error),
        'PolicyCell'
      )
      toast.error('Failed to load policy')
    } finally {
      logger.timeEnd(`view-policy-${policy.id}`)
    }
  }

  return (
    <div className='flex items-center justify-start gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={handlePolicyView}
        className='flex items-center gap-2'
      >
        <EyeIcon className='size-4' />
        View Policy
      </Button>
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

function getColumns(onDelete: (id: number) => void): ColumnDef<Policy>[] {
  logger.debug('Initializing policy table columns', undefined, 'getColumns')

  return [
    {
      accessorKey: 'policy_number',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => {
            logger.debug(
              'Toggling policy number sort',
              { currentSort: column.getIsSorted() },
              'getColumns'
            )
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          className='flex'
        >
          Policy Number
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => {
            logger.debug(
              'Toggling name sort',
              { currentSort: column.getIsSorted() },
              'getColumns'
            )
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          className='flex'
        >
          Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    {
      accessorKey: 'policy_type',
      cell: ({ row }) => {
        const type = row.getValue('policy_type') as string
        logger.debug(
          'Rendering policy type cell',
          { type, policyId: row.original.id },
          'getColumns'
        )
        return (
          <Badge variant='outline' className='px-4 py-1 capitalize'>
            {type === 'use_of_force' ? 'Use of Force' : type.replace('_', ' ')}
          </Badge>
        )
      },
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => {
            logger.debug(
              'Toggling policy type sort',
              { currentSort: column.getIsSorted() },
              'getColumns'
            )
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          className='flex'
        >
          Type
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    {
      accessorKey: 'effective_date',
      cell: ({ row }) => {
        const date = toISOString(new Date(row.getValue('effective_date')))
        logger.debug(
          'Rendering effective date cell',
          { date, policyId: row.original.id },
          'getColumns'
        )
        return format(date, 'PPP')
      },
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => {
            logger.debug(
              'Toggling effective date sort',
              { currentSort: column.getIsSorted() },
              'getColumns'
            )
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          className='flex'
        >
          Effective Date
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    {
      cell: ({ row }) => {
        const policy = row.original
        logger.debug(
          'Rendering policy view cell',
          { policyId: policy.id },
          'getColumns'
        )
        return <PolicyCell policy={policy} />
      },
      header: 'View',
      id: 'view'
    },
    {
      cell: ({ row }) => {
        const policy = row.original
        logger.debug(
          'Rendering policy actions cell',
          { policyId: policy.id },
          'getColumns'
        )
        return (
          <div className='flex items-center justify-start gap-2'>
            <Link
              href={`/admin/policies/${policy.id}/completions`}
              className='inline-flex'
            >
              <Button variant='outline' size='sm'>
                <ClipboardList className='size-4' />
                <span className='ml-2'>Completions</span>
              </Button>
            </Link>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                logger.info(
                  'Deleting policy',
                  { policyId: policy.id },
                  'getColumns'
                )
                onDelete(policy.id)
              }}
              className='text-destructive hover:text-destructive'
              aria-label='Delete policy'
              title='Delete policy'
            >
              <Trash className='size-4' />
              <span className='sr-only'>Delete</span>
            </Button>
          </div>
        )
      },
      header: 'Actions',
      id: 'actions'
    }
  ]
}

export function AdminPoliciesTable({
  data,
  onDelete
}: AdminPoliciesTableProps) {
  logger.info(
    'Rendering admin policies table',
    { policiesCount: data?.length ?? 0 },
    'AdminPoliciesTable'
  )
  logger.time('admin-policies-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'effective_date', desc: true }
    ])

    logger.debug(
      'Current table state',
      { sorting, policiesCount: data?.length ?? 0 },
      'AdminPoliciesTable'
    )

    if (!data) {
      logger.info('No policy data available', undefined, 'AdminPoliciesTable')
      return (
        <div className='flex h-1/3 w-full items-center justify-center rounded-lg border p-4'>
          <LoaderCircle className='size-12 animate-spin opacity-50' />
        </div>
      )
    }

    const columns = getColumns(onDelete)

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
      'Error rendering admin policies table',
      logger.errorWithData(error),
      'AdminPoliciesTable'
    )
    throw error
  } finally {
    logger.timeEnd('admin-policies-table-render')
  }
}
