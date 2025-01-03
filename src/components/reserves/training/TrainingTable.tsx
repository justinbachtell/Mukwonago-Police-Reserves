'use client'

import type { Training } from '@/types/training'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { TrainingSignUpButton } from './TrainingSignUpButton'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrainingTableProps {
  data: Training[]
}

export function TrainingTable({ data }: TrainingTableProps) {
  const columns: ColumnDef<Training>[] = [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'training_type',
      cell: ({ row }) => {
        const type = row.getValue('training_type') as string
        return (
          <Badge variant='outline' className='px-4 py-1 capitalize'>
            {type.replace('_', ' ')}
          </Badge>
        )
      },
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        const date = row.getValue('training_date') as Date
        return date.toLocaleDateString()
      },
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        const time = row.getValue('training_start_time') as Date
        return time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        const time = row.getValue('training_end_time') as Date
        return time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
      header: 'Location'
    },
    {
      accessorKey: 'training_instructor',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Instructor
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      cell: ({ row }) => {
        const training = row.original
        return training.instructor
          ? `${training.instructor.first_name} ${training.instructor.last_name}`
          : 'TBD'
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => <TrainingSignUpButton training={row.original} />,
      header: 'Actions'
    }
  ]

  return <DataTable columns={columns} data={data} />
}
