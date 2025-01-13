'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { CompletionWithUser } from '@/components/admin/policies/PolicyCompletionsTable'
import { Button } from '@/components/ui/button'
import { resetPolicyCompletion } from '@/actions/policy'
import { format } from 'date-fns'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'columns.tsx'
})

async function handleReset(formData: FormData) {
  const policyId = formData.get('policyId')
  const userId = formData.get('userId')

  logger.info(
    'Resetting policy completion',
    { policyId, userId },
    'handleReset'
  )

  try {
    await resetPolicyCompletion(formData)
    logger.info(
      'Successfully reset policy completion',
      { policyId, userId },
      'handleReset'
    )
  } catch (error) {
    logger.error(
      'Failed to reset policy completion',
      logger.errorWithData(error),
      'handleReset'
    )
    throw error
  }
}

export const columns = (policyId: number): ColumnDef<CompletionWithUser>[] => {
  logger.info('Initializing completion columns', { policyId }, 'columns')

  return [
    {
      accessorFn: row => {
        const userName = row.user
          ? `${row.user.first_name} ${row.user.last_name}`
          : 'Unknown User'
        logger.debug(
          'Formatting user name',
          { userName, userId: row.user?.id },
          'accessorFn'
        )
        return userName
      },
      header: 'User'
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            size='tableColumn'
            onClick={() => {
              logger.debug(
                'Toggling completion date sort',
                { currentSort: column.getIsSorted() },
                'header'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Completion Date
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = format(new Date(row.getValue('created_at')), 'MM/dd/yyyy')
        logger.debug(
          'Formatting completion date',
          { date, rowId: row.id },
          'cell'
        )
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
