'use client'

import type { Training } from '@/types/training'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Users, Pencil, Trash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { ParticipantsDialog } from '@/components/admin/training/ParticipantsDialog'
import { TrainingForm } from '@/components/admin/forms/TrainingForm'
import { deleteTraining } from '@/actions/training'
import { toast } from 'sonner'

type TrainingWithCounts = Training & {
  participants: number
  total_participants: number
}

export const columns: ColumnDef<TrainingWithCounts>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'training_type',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {row.original.training_type.charAt(0).toUpperCase() +
              row.original.training_type.slice(1)}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'training_date',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {format(new Date(row.getValue('training_date')), 'PPP')}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'training_location',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Location
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.original.training_location}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'participants',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Participants
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const training = row.original
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' className='flex items-center gap-2'>
              <Users className='size-4' />
              <span>{training.assignments?.length || 0}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Training Participants</DialogTitle>
              <DialogDescription>
                View and manage training participants
              </DialogDescription>
            </DialogHeader>
            <ParticipantsDialog training={training} />
          </DialogContent>
        </Dialog>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const training = row.original

      const handleDelete = async () => {
        try {
          await deleteTraining(training.id)
          toast.success('Training deleted successfully')
          // Note: You'll need to refresh the data after deletion
        } catch (error) {
          console.error('Error deleting training:', error)
          toast.error('Failed to delete training')
        }
      }

      return (
        <div className='flex items-center gap-2'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon'>
                <Pencil className='size-4' />
                <span className='sr-only'>Edit training</span>
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
              <DialogHeader>
                <DialogTitle>Edit Training</DialogTitle>
              </DialogHeader>
              <TrainingForm
                training={training}
                onSuccess={() => {
                  toast.success('Training updated successfully')
                  // Note: You'll need to refresh the data after update
                }}
              />
            </DialogContent>
          </Dialog>

          <Button variant='ghost' size='icon' onClick={handleDelete}>
            <Trash className='size-4' />
            <span className='sr-only'>Delete training</span>
          </Button>
        </div>
      )
    }
  }
]
