'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Training } from '@/types/training'
import type { DBUser } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTraining } from '@/actions/training'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger
} from '@/components/ui/dialog'
import { TrainingForm } from '@/components/admin/training/TrainingForm'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'admin',
  file: 'columns.tsx'
})

function TrainingActions({
  training,
  availableUsers
}: {
  training: Training
  availableUsers: DBUser[]
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const result = await deleteTraining(training.id)
      if (result) {
        toast.success('Training deleted successfully')
        router.refresh()
      } else {
        toast.error('Failed to delete training')
      }
    } catch (error) {
      logger.error(
        'Error deleting training',
        logger.errorWithData(error),
        'columns'
      )
      toast.error('Failed to delete training')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='size-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>
              <Pencil className='mr-2 size-4' />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={handleDelete}>
            <Trash className='mr-2 size-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Training</DialogTitle>
        </DialogHeader>
        <TrainingForm
          training={training}
          availableUsers={availableUsers}
          onSuccess={() => {
            setOpen(false)
            router.refresh()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function createColumns(availableUsers: DBUser[]): ColumnDef<Training>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'training_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('training_type') as string
        return (
          <Badge variant='secondary' className='font-medium'>
            {formatEnumValueWithMapping(type)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'training_date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('training_date') as string
        return new Date(date).toLocaleDateString()
      }
    },
    {
      accessorKey: 'training_start_time',
      header: 'Start Time',
      cell: ({ row }) => {
        const time = row.getValue('training_start_time') as string
        return new Date(time).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit'
        })
      }
    },
    {
      accessorKey: 'training_end_time',
      header: 'End Time',
      cell: ({ row }) => {
        const time = row.getValue('training_end_time') as string
        return new Date(time).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit'
        })
      }
    },
    {
      accessorKey: 'instructor',
      header: 'Instructor',
      cell: ({ row }) => {
        const instructor = row.original.instructor
        return instructor ? (
          <Badge variant='outline'>
            {instructor.first_name} {instructor.last_name}
          </Badge>
        ) : (
          <Badge variant='outline' className='opacity-50'>
            No instructor
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <TrainingActions
          training={row.original}
          availableUsers={availableUsers}
        />
      )
    }
  ]
}
