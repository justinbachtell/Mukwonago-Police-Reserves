'use client'

import type { Training } from '@/types/training'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ArrowUpDown } from 'lucide-react'
import { TrainingSignUpButton } from './TrainingSignUpButton'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'
import Link from 'next/link'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'training',
  file: 'TrainingTable.tsx'
})

interface TrainingTableProps {
  data: Training[]
}

export function TrainingTable({ data }: TrainingTableProps) {
  logger.info(
    'Rendering training table',
    { trainingCount: data.length },
    'TrainingTable'
  )
  logger.time('training-table-render')

  try {
    const [sorting, setSorting] = useState<SortingState>([])

    logger.debug('Initializing table state', { sorting }, 'TrainingTable')

    const columns: ColumnDef<Training>[] = [
      {
        accessorKey: 'name',
        cell: ({ row }) => {
          return (
            <Link
              href={`/user/training/${row.original.id}`}
              className='block px-4 hover:underline'
            >
              {row.getValue('name')}
            </Link>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Training Name
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_type',
        cell: ({ row }) => {
          const type = row.getValue('training_type') as string
          return (
            <Badge variant='secondary' className='font-medium'>
              {formatEnumValueWithMapping(type)}
            </Badge>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Type
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('training_date'))
          return <span className='block px-4'>{date.toLocaleDateString()}</span>
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Date
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_start_time',
        cell: ({ row }) => {
          const time = new Date(row.getValue('training_start_time'))
          return (
            <span className='block px-4'>
              {time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Start Time
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_end_time',
        cell: ({ row }) => {
          const time = new Date(row.getValue('training_end_time'))
          return (
            <span className='block px-4'>
              {time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              End Time
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_location',
        cell: ({ row }) => {
          return (
            <span className='block px-4'>
              {row.getValue('training_location')}
            </span>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Location
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        accessorKey: 'training_instructor',
        cell: ({ row }) => {
          const training = row.original
          return (
            <span className='block px-4'>
              {training.instructor
                ? `${training.instructor.first_name} ${training.instructor.last_name}`
                : training.training_instructor || 'TBD'}
            </span>
          )
        },
        header: ({ column }) => {
          return (
            <Button
              variant='ghost'
              size='tableColumn'
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
              className='flex'
            >
              Instructor
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <span className='px-0'>
            <TrainingSignUpButton training={row.original} />
          </span>
        ),
        header: 'Actions'
      }
    ]

    // Custom sort function
    const sortTraining = (trainings: Training[]) => {
      const now = new Date()

      // First, separate future and past trainings
      const futureTrainings = trainings.filter(
        training => new Date(training.training_date) >= now
      )
      const pastTrainings = trainings.filter(
        training => new Date(training.training_date) < now
      )

      // Sort future trainings by closest date first
      const sortedFutureTrainings = futureTrainings.sort((a, b) => {
        return (
          new Date(a.training_date).getTime() -
          new Date(b.training_date).getTime()
        )
      })

      // Sort past trainings by most recent first
      const sortedPastTrainings = pastTrainings.sort((a, b) => {
        return (
          new Date(b.training_date).getTime() -
          new Date(a.training_date).getTime()
        )
      })

      // Combine the arrays with future trainings first, then past trainings
      return [...sortedFutureTrainings, ...sortedPastTrainings]
    }

    // Sort the data
    const sortedData = sortTraining(data)

    logger.debug(
      'Sorted training data',
      {
        totalTrainings: data.length,
        firstTraining: sortedData[0]?.training_date,
        lastTraining: sortedData[sortedData.length - 1]?.training_date
      },
      'TrainingTable'
    )

    return (
      <DataTable
        columns={columns}
        data={sortedData}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error(
      'Error rendering training table',
      logger.errorWithData(error),
      'TrainingTable'
    )
    throw error
  } finally {
    logger.timeEnd('training-table-render')
  }
}
