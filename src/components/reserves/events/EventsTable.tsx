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
import { Users } from 'lucide-react'
import { EventSignUpButton } from './EventSignUpButton'
import { useState } from 'react'

interface EventsTableProps {
  data: Event[]
}

export function EventsTable({ data }: EventsTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'event_date', desc: false }
  ])

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
          <Badge variant='outline' className='px-4 py-1 capitalize'>
            {type.replace('_', ' ')}
          </Badge>
        )
      },
      header: 'Type'
    },
    {
      accessorKey: 'event_date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('event_date') as string)
        return date.toLocaleDateString()
      },
      header: 'Date'
    },
    {
      accessorKey: 'event_start_time',
      cell: ({ row }) => {
        const time = new Date(row.getValue('event_start_time') as string)
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
        const time = new Date(row.getValue('event_end_time') as string)
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
            open={isParticipantsOpen && selectedEvent?.id === event.id}
            onOpenChange={setIsParticipantsOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  setSelectedEvent(event)
                  setIsParticipantsOpen(true)
                }}
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
      cell: ({ row }) => <EventSignUpButton event={row.original} />,
      header: 'Actions'
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  )
}
