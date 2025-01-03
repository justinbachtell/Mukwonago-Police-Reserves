'use client'

import type { Application } from '@/types/application'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/[locale]/(auth)/admin/applications/columns'
import { useState } from 'react'

interface ApplicationsTableProps {
  data: Application[]
}

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ])

  return (
    <DataTable
      columns={columns}
      data={data}
      sorting={sorting}
      onSortingChange={setSorting}
      rowClassName={row => {
        switch (row.status) {
          case 'approved':
            return 'bg-green-50 hover:bg-green-100'
          case 'rejected':
            return 'bg-red-50 hover:bg-red-100'
          default:
            return 'hover:bg-gray-50'
        }
      }}
    />
  )
}
