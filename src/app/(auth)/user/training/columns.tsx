'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { TrainingAssignment } from '@/types/trainingAssignment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export const columns: ColumnDef<TrainingAssignment>[] = [
  {
    accessorKey: 'training.name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Training Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='block px-4'>{row.original.training?.name}</span>
    )
  },
  {
    accessorKey: 'training.training_type',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Type
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.original.training?.training_type
      return type ? (
        <Badge variant='outline' className='px-4 py-1 capitalize'>
          {type.replace('_', ' ')}
        </Badge>
      ) : null
    }
  },
  {
    accessorKey: 'training.training_date',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Date
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.original.training?.training_date
      return date ? (
        <span className='block px-4'>
          {new Date(date).toLocaleDateString()}
        </span>
      ) : null
    }
  },
  {
    accessorKey: 'training.training_start_time',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Time
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const startTime = row.original.training?.training_start_time
      const endTime = row.original.training?.training_end_time
      return startTime && endTime ? (
        <span className='block px-4'>
          {new Date(startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}{' '}
          -{' '}
          {new Date(endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ) : null
    }
  },
  {
    accessorKey: 'training.training_location',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Location
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='block px-4'>
        {row.original.training?.training_location}
      </span>
    )
  },
  {
    accessorKey: 'training.training_instructor',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Instructor
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const instructor = row.original.training?.instructor
      return (
        <span className='block px-4'>
          {instructor
            ? `${instructor.first_name} ${instructor.last_name}`
            : 'TBD'}
        </span>
      )
    }
  },
  {
    accessorKey: 'completion_status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.completion_status
      return status ? (
        <Badge
          variant={status === 'completed' ? 'default' : 'secondary'}
          className='capitalize'
        >
          {status}
        </Badge>
      ) : (
        <Badge variant='outline'>Pending</Badge>
      )
    }
  }
]

// Helper function to sort training assignments
export function sortTraining(assignments: TrainingAssignment[]) {
  const now = new Date()

  // First, separate future and past training
  const futureTraining = assignments.filter(
    assignment =>
      assignment.training && new Date(assignment.training.training_date) >= now
  )
  const pastTraining = assignments.filter(
    assignment =>
      assignment.training && new Date(assignment.training.training_date) < now
  )

  // Sort future training by closest date first
  const sortedFutureTraining = futureTraining.sort((a, b) => {
    if (!a.training || !b.training) {
      return 0
    }
    return (
      new Date(a.training.training_date).getTime() -
      new Date(b.training.training_date).getTime()
    )
  })

  // Sort past training by most recent first
  const sortedPastTraining = pastTraining.sort((a, b) => {
    if (!a.training || !b.training) {
      return 0
    }
    return (
      new Date(b.training.training_date).getTime() -
      new Date(a.training.training_date).getTime()
    )
  })

  // Combine the arrays with future training first, then past training
  return [...sortedFutureTraining, ...sortedPastTraining]
}
