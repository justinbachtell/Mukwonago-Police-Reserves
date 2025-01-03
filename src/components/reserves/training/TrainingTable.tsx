'use client'

import type { Training } from '@/types/training'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { TrainingSignUpButton } from './TrainingSignUpButton'

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
      header: 'Type'
    },
    {
      accessorKey: 'training_date',
      cell: ({ row }) => {
        const date = row.getValue('training_date') as Date
        return date.toLocaleDateString()
      },
      header: 'Date'
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
      header: 'Start Time'
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
      header: 'End Time'
    },
    {
      accessorKey: 'training_location',
      header: 'Location'
    },
    {
      accessorKey: 'training_instructor',
      header: 'Instructor',
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
