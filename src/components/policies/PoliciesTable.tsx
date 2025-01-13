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
import { ArrowUpDown, CheckCircle, EyeIcon, Loader2 } from 'lucide-react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { createLogger } from '@/lib/debug'
import {
  flexRender,
  useReactTable,
  getCoreRowModel
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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
  const [isLoading, setIsLoading] = useState(false)

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
    if (isLoading) {
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
      toast.success('Policy marked as read')
    } catch (error) {
      logger.error(
        'Failed to mark policy as read',
        logger.errorWithData(error),
        'handleMarkAsAcknowledged'
      )
      toast.error('Failed to mark policy as read')
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
          disabled={isLoading}
          className='flex items-center gap-2'
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
        cell: ({ row }) => {
          return (
            <span className='block px-4'>{row.getValue('policy_number')}</span>
          )
        },
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
        }
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => {
          return <span className='block px-4'>{row.getValue('name')}</span>
        },
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
        }
      },
      {
        accessorKey: 'policy_type',
        cell: ({ row }) => {
          const type = row.getValue('policy_type') as string
          return (
            <Badge variant='outline' className='px-4 py-1 capitalize'>
              {type === 'use_of_force'
                ? 'Use of Force'
                : type.replace('_', ' ')}
            </Badge>
          )
        },
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
        }
      },
      {
        accessorKey: 'effective_date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('effective_date'))
          return <span className='block px-4'>{date.toLocaleDateString()}</span>
        },
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
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <span className='px-0'>
            <PolicyCell
              policy={row.original}
              isCompleted={completedPolicies[row.original.id] ?? false}
              onPolicyAcknowledged={onPolicyAcknowledged}
            />
          </span>
        ),
        header: 'Actions'
      }
    ]

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: {
        sorting
      },
      onSortingChange: setSorting
    })

    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={
                    completedPolicies[row.original.id] ? 'selected' : undefined
                  }
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
