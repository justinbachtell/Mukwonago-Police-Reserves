'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { resetPolicyCompletion } from '@/actions/policy'
import { format } from 'date-fns'

export type CompletionWithUser = {
  id: number
  user_id: number
  created_at: string
  user: {
    first_name: string
    last_name: string
  } | null
  policy_id: number
}

export const columns = (policyId: number): ColumnDef<CompletionWithUser>[] => [
  {
    accessorFn: row =>
      row.user
        ? `${row.user.first_name} ${row.user.last_name}`
        : 'Unknown User',
    header: 'User'
  },
  {
    accessorKey: 'created_at',
    header: 'Completion Date',
    cell: ({ row }) =>
      format(new Date(row.getValue('created_at')), 'MM/dd/yyyy')
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <form action={resetPolicyCompletion}>
        <input type='hidden' name='policyId' value={policyId} />
        <input type='hidden' name='userId' value={row.original.user_id} />
        <Button variant='destructive' size='sm' type='submit'>
          Reset
        </Button>
      </form>
    )
  }
]
