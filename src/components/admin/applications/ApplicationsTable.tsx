'use client'

import type { Application } from '@/types/application'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/applications/columns'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'ApplicationsTable.tsx'
})

interface ApplicationsTableProps {
  data: Application[]
}

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  logger.info(
    'Rendering applications table',
    { applicationCount: data.length },
    'ApplicationsTable'
  )
  logger.time('applications-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'created_at', desc: true }
    ])

    logger.debug('Initializing table state', { sorting }, 'ApplicationsTable')

    const getRowClassName = (row: { status: Application['status'] }) => {
      logger.debug(
        'Determining row class',
        { status: row.status },
        'ApplicationsTable'
      )

      switch (row.status) {
        case 'approved':
          return 'bg-green-50 hover:bg-green-100'
        case 'rejected':
          return 'bg-red-50 hover:bg-red-100'
        default:
          return 'hover:bg-gray-50'
      }
    }

    logger.debug(
      'Rendering data table',
      { columns: columns.length },
      'ApplicationsTable'
    )

    return (
      <DataTable
        columns={columns}
        data={data}
        sorting={sorting}
        onSortingChange={setSorting}
        rowClassName={getRowClassName}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering applications table',
      logger.errorWithData(error),
      'ApplicationsTable'
    )
    throw error
  } finally {
    logger.timeEnd('applications-table-render')
  }
}
