'use client'

import type { Policy } from '@/types/policy'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import {
  columns,
  type PolicyWithCounts
} from '@/app/(auth)/admin/policies/columns'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'AdminPoliciesTable.tsx'
})

interface AdminPoliciesTableProps {
  data: Policy[]
  onDelete: (id: number) => Promise<void>
}

export function AdminPoliciesTable({
  data,
  onDelete
}: AdminPoliciesTableProps) {
  logger.info(
    'Rendering admin policies table',
    { policyCount: data.length },
    'AdminPoliciesTable'
  )
  logger.time('admin-policies-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'effective_date', desc: true }
    ])

    // Add completion counts to policies
    const policiesWithCounts: PolicyWithCounts[] = data.map(policy => {
      logger.debug(
        'Processing policy completions',
        {
          policyId: policy.id,
          policyName: policy.name,
          completionsCount: policy.completions?.length || 0
        },
        'AdminPoliciesTable'
      )

      return {
        ...policy,
        completionCount: policy.completions?.length || 0
      }
    })

    logger.debug(
      'Processed policies data',
      {
        totalPolicies: policiesWithCounts.length,
        firstPolicy: policiesWithCounts[0]?.name,
        lastPolicy: policiesWithCounts[policiesWithCounts.length - 1]?.name,
        policiesWithCompletions: policiesWithCounts.filter(
          p => p.completionCount > 0
        ).length
      },
      'AdminPoliciesTable'
    )

    const tableOptions = {
      columns,
      data: policiesWithCounts,
      sorting,
      onSortingChange: setSorting,
      meta: { onDelete }
    }

    return <DataTable {...tableOptions} />
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
