'use client'

import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/users/[id]/equipment/columns'
import type { AssignedEquipment } from '@/types/assignedEquipment'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/UserEquipmentTable.tsx'
})

interface UserEquipmentTableProps {
  data: AssignedEquipment[]
}

export function UserEquipmentTable({ data }: UserEquipmentTableProps) {
  logger.debug('Rendering UserEquipmentTable', {
    totalEquipment: data.length,
    activeEquipment: data.filter(item => !item.checked_in_at).length,
    returnedEquipment: data.filter(item => item.checked_in_at).length
  })

  try {
    return (
      <div className='rounded-md border'>
        <DataTable columns={columns} data={data} />
      </div>
    )
  } catch (error) {
    logger.error('Error rendering UserEquipmentTable', { error })
    return <div>Error loading equipment data</div>
  }
}
