'use client'

import type { Event } from '@/types/event'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { CompletionStatus } from '@/types/eventAssignment'
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
import { Pencil, Trash, Users, ArrowUpDown } from 'lucide-react'
import { EventForm } from '../forms/EventForm'
import { deleteEvent } from '@/actions/event'
import {
  deleteEventAssignment,
  updateEventAssignmentCompletion
} from '@/actions/eventAssignment'
import { CompletionStatusDialog } from '../shared/CompletionStatusDialog'
import { toast } from 'sonner'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'EventsManagementTable.tsx'
})

interface EventsManagementTableProps {
  data: Event[]
}

export function EventsManagementTable({ data }: EventsManagementTableProps) {
  logger.info(
    'Rendering events management table',
    { eventCount: data.length },
    'EventsManagementTable'
  )
  logger.time('events-management-table-render')

  try {
    const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({})
    const [selectedAssignment, setSelectedAssignment] = useState<{
      eventId: number
      userId: string
      status?: CompletionStatus
      notes?: string | null
    } | null>(null)
    const [sorting, setSorting] = useState<SortingState>([
      { id: 'event_date', desc: true }
    ])

    const handleDelete = async (id: number) => {
      try {
        logger.info('Deleting event', { eventId: id }, 'handleDelete')
        await deleteEvent(id)
        toast.success('Event deleted successfully')
      } catch (error) {
        logger.error(
          'Error deleting event',
          logger.errorWithData(error),
          'handleDelete'
        )
        toast.error('Failed to delete event')
      }
    }

    const handleRemoveParticipant = async (eventId: number, userId: string) => {
      try {
        logger.info(
          'Removing participant',
          { eventId, userId },
          'handleRemoveParticipant'
        )
        await deleteEventAssignment(eventId, userId)
        toast.success('Participant removed successfully')
      } catch (error) {
        logger.error(
          'Error removing participant',
          logger.errorWithData(error),
          'handleRemoveParticipant'
        )
        toast.error('Failed to remove participant')
      }
    }

    const handleUpdateCompletion = async (data: {
      status: CompletionStatus
      notes?: string | null
    }) => {
      if (!selectedAssignment) {
        return
      }

      try {
        logger.info(
          'Updating completion status',
          { assignment: selectedAssignment, data },
          'handleUpdateCompletion'
        )
        await updateEventAssignmentCompletion(
          selectedAssignment.eventId,
          selectedAssignment.userId,
          {
            completion_status: data.status,
            completion_notes: data.notes
          }
        )
        setSelectedAssignment(null)
        toast.success('Status updated successfully')
      } catch (error) {
        logger.error(
          'Error updating completion status',
          logger.errorWithData(error),
          'handleUpdateCompletion'
        )
        toast.error('Failed to update status')
      }
    }

    const toggleDialog = (eventId: number, isOpen: boolean) => {
      logger.debug('Toggling dialog', { eventId, isOpen }, 'toggleDialog')
      setOpenDialogs(prev => ({ ...prev, [eventId]: isOpen }))
    }

    const isEventPast = (event: Event) => {
      const endTime = new Date(event.event_end_time)
      const isPast = endTime < new Date()
      logger.debug(
        'Checking if event is past',
        { eventId: event.id, endTime, isPast },
        'isEventPast'
      )
      return isPast
    }

    const columns: ColumnDef<Event>[] = [
      {
        accessorKey: 'event_name',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling event name sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Event Name
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      {
        accessorKey: 'event_type',
        cell: ({ row }) => {
          const type = row.getValue('event_type') as string
          return (
            <Badge variant='outline' className='px-4 py-1 capitalize'>
              {type.replace('_', ' ')}
            </Badge>
          )
        },
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling event type sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Type
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      {
        accessorKey: 'event_date',
        cell: ({ row }) => {
          const date = row.getValue('event_date') as Date
          return date.toLocaleDateString()
        },
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling event date sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Date
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
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
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling start time sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Start Time
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
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
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling end time sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            End Time
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      {
        accessorKey: 'event_location',
        header: ({ column }) => (
          <Button
            variant='ghost'
            onClick={() => {
              logger.debug(
                'Toggling location sort',
                { currentSort: column.getIsSorted() },
                'EventsManagementTable'
              )
              column.toggleSorting(column.getIsSorted() === 'asc')
            }}
            className='flex'
          >
            Location
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      },
      {
        accessorKey: 'assignments',
        header: 'Participants',
        cell: ({ row }) => {
          const event = row.original
          const assignments = event.assignments || []
          const isPast = isEventPast(event)

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
                          <div>
                            <span className='text-sm'>
                              {assignment.user?.first_name}{' '}
                              {assignment.user?.last_name}
                            </span>
                            {isPast && assignment.completion_status && (
                              <Badge
                                variant={
                                  assignment.completion_status === 'completed'
                                    ? 'default'
                                    : assignment.completion_status === 'excused'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                                className='ml-2'
                              >
                                {assignment.completion_status}
                              </Badge>
                            )}
                          </div>
                          <div className='flex gap-2'>
                            {isPast && (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  setSelectedAssignment({
                                    eventId: event.id,
                                    userId: assignment.user_id,
                                    status:
                                      assignment.completion_status || undefined,
                                    notes:
                                      assignment.completion_notes || undefined
                                  })
                                }
                              >
                                Update Status
                              </Button>
                            )}
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
                              <span className='sr-only'>
                                Remove participant
                              </span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='py-4 text-center text-sm text-muted-foreground'>
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

    logger.debug(
      'Current table state',
      {
        openDialogs,
        selectedAssignment,
        sorting
      },
      'EventsManagementTable'
    )

    return (
      <>
        <DataTable
          columns={columns}
          data={data}
          sorting={sorting}
          onSortingChange={setSorting}
        />
        {selectedAssignment && (
          <CompletionStatusDialog
            isOpen
            onClose={() => setSelectedAssignment(null)}
            onSubmit={data =>
              handleUpdateCompletion({
                status: data.completion_status,
                notes: data.completion_notes
              })
            }
            title='Update Completion Status'
            currentStatus={selectedAssignment.status}
            currentNotes={selectedAssignment.notes}
          />
        )}
      </>
    )
  } catch (error) {
    logger.error(
      'Error rendering events management table',
      logger.errorWithData(error),
      'EventsManagementTable'
    )
    throw error
  } finally {
    logger.timeEnd('events-management-table-render')
  }
}
