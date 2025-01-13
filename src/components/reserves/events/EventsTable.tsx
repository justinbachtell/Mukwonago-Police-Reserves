'use client'

import type { Event } from '@/types/event'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
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
import { ArrowUpDown, Users } from 'lucide-react'
import { EventSignUpButton } from './EventSignUpButton'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'events',
  file: 'EventsTable.tsx'
})

interface EventsTableProps {
  data: Event[]
}

export function EventsTable({ data }: EventsTableProps) {
  logger.info(
    'Rendering events table',
    { eventCount: data.length },
    'EventsTable'
  )
  logger.time('events-table-render')

  try {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([])

    logger.debug('Initializing table state', { sorting }, 'EventsTable')

    const handleParticipantDialogOpen = (event: Event) => {
      logger.debug(
        'Opening participant dialog',
        { eventId: event.id, assignments: event.assignments?.length },
        'handleParticipantDialogOpen'
      )
      setSelectedEvent(event)
      setIsParticipantsOpen(true)
    }

    const handleParticipantDialogClose = () => {
      logger.debug(
        'Closing participant dialog',
        { eventId: selectedEvent?.id },
        'handleParticipantDialogClose'
      )
      setIsParticipantsOpen(false)
      setSelectedEvent(null)
    }

    const columns: ColumnDef<Event>[] = [
      {
        accessorKey: 'event_name',
        cell: ({ row }) => {
          return (
            <span className='block px-4'>{row.getValue('event_name')}</span>
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
              Event Name
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        }
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
        accessorKey: 'event_date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('event_date'))
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
        accessorKey: 'event_start_time',
        cell: ({ row }) => {
          const time = new Date(row.getValue('event_start_time'))
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
        accessorKey: 'event_end_time',
        cell: ({ row }) => {
          const time = new Date(row.getValue('event_end_time'))
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
        accessorKey: 'event_location',
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
        },
        cell: ({ row }) => {
          return (
            <span className='block px-4'>{row.getValue('event_location')}</span>
          )
        }
      },
      {
        accessorKey: 'assignments',
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
              Participants
              <ArrowUpDown className='ml-2 size-4' />
            </Button>
          )
        },
        cell: ({ row }) => {
          const event = row.original
          const assignments = event.assignments || []

          logger.debug(
            'Rendering participants cell',
            { eventId: event.id, participantCount: assignments.length },
            'EventsTable'
          )

          return (
            <Dialog
              open={isParticipantsOpen && selectedEvent?.id === event.id}
              onOpenChange={open => {
                if (!open) {
                  handleParticipantDialogClose()
                } else {
                  handleParticipantDialogOpen(event)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='tableColumn'
                  className='flex items-center gap-1 px-4 text-sm'
                  onClick={() => handleParticipantDialogOpen(event)}
                >
                  <Users className='size-4' />
                  <span>
                    {assignments.length !== 0
                      ? ` ${assignments.length} out of ${event.max_participants}`
                      : `Need at least ${event.min_participants}`}
                  </span>
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
        cell: ({ row }) => (
          <span className='px-0'>
            <EventSignUpButton event={row.original} />
          </span>
        ),
        header: 'Actions'
      }
    ]

    logger.debug(
      'Rendering data table',
      { columns: columns.length },
      'EventsTable'
    )

    // Custom sort function
    const sortEvents = (events: Event[]) => {
      const now = new Date()

      // First, separate future and past events
      const futureEvents = events.filter(
        event => new Date(event.event_date) >= now
      )
      const pastEvents = events.filter(
        event => new Date(event.event_date) < now
      )

      // Sort future events by closest date first
      const sortedFutureEvents = futureEvents.sort((a, b) => {
        return (
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
      })

      // Sort past events by most recent first
      const sortedPastEvents = pastEvents.sort((a, b) => {
        return (
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )
      })

      // Combine the arrays with future events first, then past events
      return [...sortedFutureEvents, ...sortedPastEvents]
    }

    // Sort the data
    const sortedData = sortEvents(data)

    logger.debug(
      'Sorted events data',
      {
        totalEvents: data.length,
        firstEvent: sortedData[0]?.event_date,
        lastEvent: sortedData[sortedData.length - 1]?.event_date
      },
      'EventsTable'
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
      'Error rendering events table',
      logger.errorWithData(error),
      'EventsTable'
    )
    throw error
  } finally {
    logger.timeEnd('events-table-render')
  }
}
