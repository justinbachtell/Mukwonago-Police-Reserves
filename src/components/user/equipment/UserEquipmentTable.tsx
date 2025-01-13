'use client'

import type { AssignedEquipment } from '@/types/assignedEquipment'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { createLogger } from '@/lib/debug'
import { columns, sortEquipment } from '@/app/(auth)/user/equipment/columns'
import { useState } from 'react'

const logger = createLogger({
  module: 'user',
  file: 'equipment/UserEquipmentTable.tsx'
})

interface UserEquipmentTableProps {
  data: AssignedEquipment[]
}

export function UserEquipmentTable({ data }: UserEquipmentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  logger.debug('Rendering UserEquipmentTable', {
    totalEquipment: data.length,
    activeEquipment: data.filter(item => !item.checked_in_at).length,
    returnedEquipment: data.filter(item => item.checked_in_at).length
  })

  try {
    return (
      <DataTable
        columns={columns}
        data={sortEquipment(data)}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error('Error rendering UserEquipmentTable', { error })
    return <div>Error loading equipment data</div>
  }
}
