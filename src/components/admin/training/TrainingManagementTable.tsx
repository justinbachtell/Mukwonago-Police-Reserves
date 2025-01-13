'use client'

import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { createColumns } from '@/app/(auth)/admin/training/columns'
import { useState, useMemo } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'TrainingManagementTable.tsx'
})

interface TrainingManagementTableProps {
  data: Training[]
  availableUsers: DBUser[]
}

export function TrainingManagementTable({
  data,
  availableUsers
}: TrainingManagementTableProps) {
  const columns = useMemo(() => createColumns(availableUsers), [availableUsers])
  logger.info(
    'Rendering training management table',
    { trainingCount: data.length },
    'TrainingManagementTable'
  )
  logger.time('training-management-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'training_date', desc: true }
    ])

    // Custom sort function
    const sortTrainings = (trainings: Training[]) => {
      const now = new Date()

      // First, separate future and past trainings
      const futureTrainings = trainings.filter(
        training => new Date(training.training_date) >= now
      )
      const pastTrainings = trainings.filter(
        training => new Date(training.training_date) < now
      )

      // Sort future trainings by closest date first
      const sortedFutureTrainings = futureTrainings.sort(
        (a, b) =>
          new Date(a.training_date).getTime() -
          new Date(b.training_date).getTime()
      )

      // Sort past trainings by most recent first
      const sortedPastTrainings = pastTrainings.sort(
        (a, b) =>
          new Date(b.training_date).getTime() -
          new Date(a.training_date).getTime()
      )

      // Combine the arrays with future trainings first, then past trainings
      return [...sortedFutureTrainings, ...sortedPastTrainings]
    }

    logger.debug(
      'Sorted trainings data',
      {
        totalTrainings: data.length,
        firstTraining: data[0]?.training_date,
        lastTraining: data[data.length - 1]?.training_date
      },
      'TrainingManagementTable'
    )

    return (
      <DataTable
        columns={columns}
        data={sortTrainings(data)}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering training management table',
      logger.errorWithData(error),
      'TrainingManagementTable'
    )
    throw error
  } finally {
    logger.timeEnd('training-management-table-render')
  }
}
