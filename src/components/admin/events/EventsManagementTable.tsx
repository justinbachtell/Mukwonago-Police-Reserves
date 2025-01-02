'use client'

import type { Event } from '@/types/event'
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
import { EventForm } from './EventForm'
import { deleteEvent } from '@/actions/event'
import { deleteEventAssignment } from '@/actions/eventAssignment'
import { toast } from 'sonner'
import { useState } from 'react'

interface EventsManagementTableProps {
  data: Event[]
}

export function EventsManagementTable({ data }: EventsManagementTableProps) {
  const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({})

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id)
      toast.success('Event deleted successfully')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleRemoveParticipant = async (eventId: number, userId: number) => {
    try {
      await deleteEventAssignment(eventId, userId)
      const updatedEvent = data.find(e => e.id === eventId)
      if (updatedEvent && updatedEvent.assignments) {
        updatedEvent.assignments = updatedEvent.assignments.filter(
          a => a.user_id !== userId
        )
      }
      toast.success('Participant removed successfully')
    } catch (error) {
      console.error('Error removing participant:', error)
      toast.error('Failed to remove participant')
    }
  }

  const toggleDialog = (eventId: number, isOpen: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [eventId]: isOpen }))
  }

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: 'event_name',
      header: 'Event Name'
    },
    {
      accessorKey: 'event_type',
      cell: ({ row }) => {
        const type = row.getValue('event_type') as string
        return (
          <Badge variant='outline' className='capitalize px-4 py-1'>
            {type.replace('_', ' ')}
          </Badge>
        )
      },
      header: 'Type'
    },
    {
      accessorKey: 'event_date',
      cell: ({ row }) => {
        const date = row.getValue('event_date') as Date
        return date.toLocaleDateString()
      },
      header: 'Date'
    },
    {
      accessorKey: 'event_start_time',
      cell: ({ row }) => {
        const time = row.getValue('event_start_time') as Date
        return time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      header: 'Start Time'
    },
    {
      accessorKey: 'event_end_time',
      cell: ({ row }) => {
        const time = row.getValue('event_end_time') as Date
        return time.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      header: 'End Time'
    },
    {
      accessorKey: 'event_location',
      header: 'Location'
    },
    {
      accessorKey: 'assignments',
      header: 'Participants',
      cell: ({ row }) => {
        const event = row.original
        const assignments = event.assignments || []
        return (
          <Dialog
            open={openDialogs[event.id]}
            onOpenChange={isOpen => toggleDialog(event.id, isOpen)}
          >
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => toggleDialog(event.id, true)}
              >
                <Users className='size-4' />
                <span>{assignments.length}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Event Participants</DialogTitle>
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
                              event.id,
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
        const event = row.original
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
                  <DialogTitle>Edit Event</DialogTitle>
                </DialogHeader>
                <EventForm event={event} />
              </DialogContent>
            </Dialog>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => handleDelete(event.id)}
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
