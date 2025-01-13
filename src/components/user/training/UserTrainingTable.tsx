'use client'

import type { TrainingAssignment } from '@/types/trainingAssignment'
import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns, sortTraining } from '@/app/(auth)/user/training/columns'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'user',
  file: 'UserTrainingTable.tsx'
})

interface UserTrainingTableProps {
  data: TrainingAssignment[]
}

export function UserTrainingTable({ data }: UserTrainingTableProps) {
  logger.info(
    'Rendering user training table',
    { trainingCount: data.length },
    'UserTrainingTable'
  )
  logger.time('user-training-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([])
    const searchParams = useSearchParams()
    const view = searchParams.get('view') ?? 'table'

    if (view !== 'table') {
      return null
    }

    logger.debug(
      'Sorted training data',
      {
        totalTraining: data.length,
        firstTraining: data[0]?.training?.training_date,
        lastTraining: data[data.length - 1]?.training?.training_date
      },
      'UserTrainingTable'
    )

    return (
      <DataTable
        columns={columns}
        data={sortTraining(data)}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering user training table',
      logger.errorWithData(error),
      'UserTrainingTable'
    )
    throw error
  } finally {
    logger.timeEnd('user-training-table-render')
  }
}
