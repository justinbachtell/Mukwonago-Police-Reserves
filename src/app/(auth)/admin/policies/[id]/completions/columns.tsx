'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { CompletionWithUser } from '@/components/admin/policies/PolicyCompletionsTable'
import { Button } from '@/components/ui/button'
import { resetPolicyCompletion } from '@/actions/policy'
import { format } from 'date-fns'

const DEBUG = process.env.NODE_ENV === 'development'

async function handleReset(formData: FormData) {
  DEBUG &&
    console.log('[PolicyCompletionsColumns] Resetting completion:', {
      policyId: formData.get('policyId'),
      userId: formData.get('userId')
    })
  await resetPolicyCompletion(formData)
}

export const columns = (policyId: number): ColumnDef<CompletionWithUser>[] => {
  DEBUG &&
    console.log(
      '[PolicyCompletionsColumns] Initializing columns for policy:',
      policyId
    )

  return [
    {
      accessorFn: row => {
        const userName = row.user
          ? `${row.user.first_name} ${row.user.last_name}`
          : 'Unknown User'
        DEBUG &&
          console.log(
            '[PolicyCompletionsColumns] Formatting user name:',
            userName
          )
        return userName
      },
      header: 'User'
    },
    {
      accessorKey: 'created_at',
      header: 'Completion Date',
      cell: ({ row }) => {
        const date = format(new Date(row.getValue('created_at')), 'MM/dd/yyyy')
        DEBUG &&
          console.log('[PolicyCompletionsColumns] Formatting date:', date)
        return date
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <form action={handleReset}>
          <input type='hidden' name='policyId' value={policyId} />
          <input type='hidden' name='userId' value={row.original.user_id} />
          <Button variant='destructive' size='sm' type='submit'>
            Reset
          </Button>
        </form>
      )
    }
  ]
}
