'use client'

import { DataTable } from '@/components/ui/data-table'
import type { Policy, PolicyCompletion } from '@/types/policy'
import type { DBUser } from '@/types/user'
import { columns } from '@/app/(auth)/admin/policies/[id]/completions/columns'

const DEBUG = process.env.NODE_ENV === 'development'

// Define the CompletionWithUser type here since it's used by both table and columns
export interface CompletionWithUser extends Omit<PolicyCompletion, 'user'> {
  user: DBUser | null
  policy: Policy
}

interface CompletionsTableProps {
  data: CompletionWithUser[]
  policyId: number
}

export function CompletionsTable({ data, policyId }: CompletionsTableProps) {
  DEBUG &&
    console.log('[PolicyCompletionsTable] Rendering with data:', {
      completionsCount: data.length,
      policyId
    })

  return (
    <div className='w-full'>
      <DataTable columns={columns(policyId)} data={data} />
    </div>
  )
}
