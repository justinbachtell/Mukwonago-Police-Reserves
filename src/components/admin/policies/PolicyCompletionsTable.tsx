'use client'

import { DataTable } from '@/components/ui/data-table'
import {
  columns,
  type CompletionWithUser
} from '../../../app/[locale]/(auth)/admin/policies/[id]/completions/columns'

interface CompletionsTableProps {
  data: CompletionWithUser[]
  policyId: number
}

export function CompletionsTable({ data, policyId }: CompletionsTableProps) {
  return <DataTable columns={columns(policyId)} data={data} />
}
