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

interface PoliciesTableProps {
  data: Policy[]
  completedPolicies: Record<number, boolean>
  onPolicyAcknowledged?: (policyId: number) => void
}

function PolicyCell({
  policy,
  isCompleted
}: {
  policy: Policy
  isCompleted: boolean
}) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handlePolicyView = async () => {
    try {
      const signedUrl = await getPolicyUrl(policy.policy_url)
      setPdfUrl(signedUrl)
      setIsOpen(true)
    } catch (error) {
      console.error('Error viewing policy:', error)
      toast.error('Failed to load policy')
    }
  }

  const handleMarkAsAcknowledged = async () => {
    try {
      await markPolicyAsAcknowledged(policy.id)
      toast.success('Policy marked as read')
    } catch (error) {
      console.error('Error marking policy as read:', error)
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
  completedPolicies: Record<number, boolean>
): ColumnDef<Policy>[] {
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
        const date = new Date(row.getValue('effective_date'))
        return <div className='font-medium'>{date.toLocaleDateString()}</div>
      }
    },
    {
      id: 'status',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      ),
      cell: ({ row }) => {
        const isCompleted = completedPolicies[row.original.id]
        return isCompleted ? (
          <Badge variant='success'>Acknowledged</Badge>
        ) : (
          <Badge variant='warning' className='flex text-center'>
            Not Acknowledged
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <PolicyCell
          policy={row.original}
          isCompleted={!!completedPolicies[row.original.id]}
        />
      )
    }
  ]
}

export function PoliciesTable({ data, completedPolicies }: PoliciesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'policy_number', desc: false }
  ])

  const columns = getColumns(completedPolicies)

  return (
    <div className='space-y-4'>
      <DataTable
        columns={columns}
        data={data}
        sorting={sorting}
        onSortingChange={setSorting}
        rowClassName={row => {
          return completedPolicies[row.id]
            ? 'bg-green-50 hover:bg-green-100'
            : ''
        }}
      />
    </div>
  )
}
