'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { Event } from '@/types/event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Pencil, Trash, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { EventForm } from '@/components/admin/events/EventForm'
import { EventParticipantsDialog } from '@/components/admin/events/EventParticipantsDialog'
import { toast } from 'sonner'
import { deleteEvent } from '@/actions/event'
import { createLogger } from '@/lib/debug'
import { useState } from 'react'

const logger = createLogger({
  module: 'admin',
  file: 'events/management/columns.tsx'
})

// Action cell component
const ActionCell = ({
  event,
  onDataChange
}: {
  event: Event
  onDataChange?: () => void
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      logger.info('Deleting event', { eventId: event.id }, 'handleDelete')
      await deleteEvent(event.id)
      toast.success('Event deleted successfully')
      onDataChange?.()
    } catch (error) {
      logger.error(
        'Error deleting event',
        logger.errorWithData(error),
        'handleDelete'
      )
      toast.error('Failed to delete event')
    }
  }

  return (
    <div className='flex items-center justify-end gap-2'>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            title='Edit Event'
          >
            <Pencil className='size-4' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm
            event={event}
            onSuccess={() => {
              setIsEditDialogOpen(false)
              onDataChange?.()
            }}
          />
        </DialogContent>
      </Dialog>

      <Button
        variant='ghost'
        size='icon'
        className='size-8'
        onClick={handleDelete}
        title='Delete Event'
      >
        <Trash className='size-4' />
      </Button>
    </div>
  )
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'event_name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Event Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='block px-4'>{row.getValue('event_name')}</span>
    )
  },
  {
    accessorKey: 'event_type',
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
      const type = row.getValue('event_type') as string
      return (
        <Badge variant='outline' className='px-4 py-1 capitalize'>
          {type.replace('_', ' ')}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'event_date',
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
      const date = new Date(row.getValue('event_date'))
      return <span className='block px-4'>{date.toLocaleDateString()}</span>
    }
  },
  {
    accessorKey: 'event_start_time',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Start Time
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
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
    }
  },
  {
    accessorKey: 'event_end_time',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          End Time
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
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
    }
  },
  {
    accessorKey: 'event_location',
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
      <span className='block px-4'>{row.getValue('event_location')}</span>
    )
  },
  {
    accessorKey: 'assignments',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-1 px-4 text-sm'
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
            <EventParticipantsDialog event={event} />
          </DialogContent>
        </Dialog>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell event={row.original} />
  }
]
