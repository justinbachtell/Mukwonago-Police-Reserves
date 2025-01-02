'use client'

import type { Training } from '@/types/training'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Pencil, Trash, Users } from 'lucide-react'
import { TrainingForm } from './TrainingForm'
import { deleteTraining } from '@/actions/training'
import { deleteTrainingAssignment } from '@/actions/trainingAssignment'
import { toast } from 'sonner'
import { useState } from 'react'

interface TrainingManagementTableProps {
  data: Training[]
}

export function TrainingManagementTable({
  data
}: TrainingManagementTableProps) {
  const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({})

  const handleDelete = async (id: number) => {
    try {
      await deleteTraining(id)
      toast.success('Training deleted successfully')
    } catch (error) {
      console.error('Error deleting training:', error)
      toast.error('Failed to delete training')
    }
  }

  const handleRemoveParticipant = async (
    trainingId: number,
    userId: number
  ) => {
    try {
      await deleteTrainingAssignment(trainingId, userId)
      const updatedTraining = data.find(t => t.id === trainingId)
      if (updatedTraining && updatedTraining.assignments) {
        updatedTraining.assignments = updatedTraining.assignments.filter(
          a => a.user_id !== userId
        )
      }
      toast.success('Participant removed successfully')
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error('Failed to remove participant')
    }
  }

  const toggleDialog = (trainingId: number, isOpen: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [trainingId]: isOpen }))
  }

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
          <Badge variant='outline' className='capitalize px-4 py-1'>
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
      accessorKey: 'instructor',
      header: 'Instructor',
      cell: ({ row }) => {
        const training = row.original
        return training.instructor
          ? `${training.instructor.first_name} ${training.instructor.last_name}`
          : 'TBD'
      }
    },
    {
      accessorKey: 'assignments',
      header: 'Participants',
      cell: ({ row }) => {
        const training = row.original
        const assignments = training.assignments || []
        return (
          <Dialog
            open={openDialogs[training.id]}
            onOpenChange={isOpen => toggleDialog(training.id, isOpen)}
          >
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => toggleDialog(training.id, true)}
              >
                <Users className='size-4' />
                <span>{assignments.length}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Training Participants</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                {assignments.length > 0 ? (
                  <div className='divide-y'>
                    {assignments.map(assignment => (
                      <div
                        key={assignment.id}
                        className='flex items-center justify-between py-2'
                      >
                        <span className='text-sm'>
                          {assignment.user?.first_name}{' '}
                          {assignment.user?.last_name}
                        </span>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() =>
                            handleRemoveParticipant(
                              training.id,
                              assignment.user_id
                            )
                          }
                        >
                          <Trash className='size-4' />
                          <span className='sr-only'>Remove participant</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    No participants yet
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const training = row.original
        return (
          <div className='flex gap-2'>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' size='icon'>
                  <Pencil className='size-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
                <DialogHeader>
                  <DialogTitle>Edit Training</DialogTitle>
                </DialogHeader>
                <TrainingForm training={training} />
              </DialogContent>
            </Dialog>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => handleDelete(training.id)}
            >
              <Trash className='size-4' />
            </Button>
          </div>
        )
      },
      header: 'Actions'
    }
  ]

  return <DataTable columns={columns} data={data} />
}
