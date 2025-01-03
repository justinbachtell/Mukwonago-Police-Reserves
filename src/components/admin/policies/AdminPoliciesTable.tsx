'use client'

import type { Policy } from '@/types/policy'

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
import { useState } from 'react'
import { getPolicyUrl } from '@/actions/policy'
import { toast } from 'sonner'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { PDFViewer } from '@/components/ui/pdf-viewer'

interface AdminPoliciesTableProps {
  data?: Policy[]
  onDelete: (id: number) => void
}

type PolicyWithActions = Policy & {
  onDelete: (id: number) => void
}

function PolicyCell({ policy }: { policy: Policy }) {
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

const columns: ColumnDef<PolicyWithActions>[] = [
  {
    accessorKey: 'policy_number',
    header: 'Policy Number'
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'policy_type',
    cell: ({ row }) => {
      const type = row.getValue('policy_type') as string
      return (
        <Badge variant='outline' className='px-4 py-1 capitalize'>
          {type.replace('_', ' ')}
        </Badge>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
      const date = new Date(row.getValue('effective_date'))
      return date.toLocaleDateString()
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
      return <PolicyCell policy={policy} />
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        View
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    id: 'view'
  },
  {
    cell: ({ row }) => {
      const policy = row.original
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
            onClick={() => policy.onDelete(policy.id)}
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

export function AdminPoliciesTable({
  data,
  onDelete
}: AdminPoliciesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'effective_date', desc: true }
  ])

  if (!data) {
    return (
      <div className='flex h-1/3 w-full items-center justify-center rounded-lg border p-4'>
        <LoaderCircle className='size-12 animate-spin opacity-50' />
      </div>
    )
  }

  const policies = data.map(policy => ({
    ...policy,
    onDelete
  }))

  return (
    <DataTable
      columns={columns}
      data={policies}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
