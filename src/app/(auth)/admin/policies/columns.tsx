'use client'

import type { ColumnDef, Column, Row, Table } from '@tanstack/react-table'
import type { Policy, PolicyCompletion } from '@/types/policy'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Pencil, Trash, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  CompletionsTable,
  type CompletionWithUser
} from '@/components/admin/policies/PolicyCompletionsTable'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { PolicyForm } from '@/components/admin/forms/PolicyForm'
import { toast } from 'sonner'
import { createLogger } from '@/lib/debug'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const logger = createLogger({ module: 'admin', file: 'policies/columns.tsx' })

export type PolicyWithCounts = Policy & {
  completionCount: number
}

interface PolicyTableMeta {
  onDelete: (id: number) => Promise<void>
}

function PolicyActions({
  policy,
  onDelete
}: {
  policy: Policy
  onDelete: (id: number) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await onDelete(policy.id)
      router.refresh()
    } catch (error) {
      logger.error(
        'Error deleting policy',
        logger.errorWithData(error),
        'columns'
      )
      toast.error('Failed to delete policy')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Pencil className='mr-2 size-4' />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className='mr-2 size-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>
        <PolicyForm
          policy={policy}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export const columns: ColumnDef<PolicyWithCounts>[] = [
  {
    accessorKey: 'policy_number',
    header: ({ column }: { column: Column<PolicyWithCounts> }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Policy #
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }: { row: Row<PolicyWithCounts> }) => (
      <span className='px-4'>{row.original.policy_number}</span>
    )
  },
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<PolicyWithCounts> }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Policy Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }: { row: Row<PolicyWithCounts> }) => (
      <span className='block px-4'>{row.original.name}</span>
    )
  },
  {
    accessorKey: 'policy_type',
    header: ({ column }: { column: Column<PolicyWithCounts> }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Type
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }: { row: Row<PolicyWithCounts> }) => (
      <Badge variant='outline' className='px-4'>
        {row.original.policy_type}
      </Badge>
    )
  },
  {
    accessorKey: 'completionCount',
    header: ({ column }: { column: Column<PolicyWithCounts> }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Acknowledged
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }: { row: Row<PolicyWithCounts> }) => {
      const policy = row.original
      const completions = policy.completions || []

      // Transform completions to include required user and policy data
      const completionsWithUser: CompletionWithUser[] = completions.map(
        (completion: PolicyCompletion) => ({
          ...completion,
          user: completion.user || null,
          policy: {
            ...policy,
            completions: undefined // Remove circular reference
          }
        })
      )

      // Log completion data for debugging
      logger.debug(
        'Policy completion data',
        {
          policyId: policy.id,
          policyName: policy.name,
          completionsCount: completionsWithUser.length
        },
        'PolicyCompletionsCell'
      )

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button size='sm' variant='ghost' className='w-full'>
              {completionsWithUser.length} Users
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-3xl'>
            <DialogHeader>
              <DialogTitle>Policy Acknowledgments</DialogTitle>
              <p className='text-sm text-muted-foreground'>
                Users who have acknowledged this policy
              </p>
            </DialogHeader>
            <CompletionsTable data={completionsWithUser} policyId={policy.id} />
          </DialogContent>
        </Dialog>
      )
    }
  },
  {
    id: 'actions',
    cell: ({
      row,
      table
    }: {
      row: Row<PolicyWithCounts>
      table: Table<PolicyWithCounts>
    }) => (
      <PolicyActions
        policy={row.original}
        onDelete={(table.options.meta as PolicyTableMeta).onDelete}
      />
    )
  }
]
