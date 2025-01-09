'use client'

import type { Training } from '@/types/training'
import { DataTable } from '@/components/ui/data-table'
import { columns } from '@/app/(auth)/admin/training/columns'
import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { LoaderCircle } from 'lucide-react'

interface TrainingManagementTableProps {
  data?: Training[]
  onDelete?: (id: number) => void
  onUpdate?: (training: Training) => void
}

export function TrainingManagementTable({
  data,
  onDelete,
  onUpdate
}: TrainingManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'training_date', desc: true }
  ])

  if (!data) {
    return (
      <div className='flex h-1/3 w-full items-center justify-center rounded-lg border p-4'>
        <LoaderCircle className='size-12 animate-spin opacity-50' />
      </div>
    )
  }

  const trainings = data.map(training => ({
    ...training,
    participants: training.assignments?.length || 0,
    total_participants:
      training.assignments?.reduce((acc, assignment) => {
        if (assignment.completion_status === 'completed') {
          return acc + 1
        }
        return acc
      }, 0) || 0,
    onDelete,
    onUpdate
  }))

  return (
    <DataTable
      columns={columns}
      data={trainings}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
