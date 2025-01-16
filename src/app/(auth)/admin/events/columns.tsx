'use client'

import type { Event } from '@/types/event'
import type { ColumnDef } from '@tanstack/react-table'
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
import { EventForm } from '@/components/admin/forms/EventForm'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: 'event_name',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Event Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='flex flex-col px-4'>
        <span className='truncate font-medium'>
          {row.getValue('event_name')}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'event_type',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Type
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue('event_type') as string
      return (
        <div className='flex flex-col px-4'>
          <Badge variant='secondary' className='font-medium'>
            {formatEnumValueWithMapping(type)}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'event_date',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Date
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('event_date'))
      return (
        <div className='flex flex-col px-4'>
          <span>{date.toLocaleDateString()}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'event_start_time',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Start Time
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const time = new Date(row.getValue('event_start_time'))
      return (
        <div className='flex flex-col px-4'>
          <span>
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'event_end_time',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        End Time
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const time = new Date(row.getValue('event_end_time'))
      return (
        <div className='flex flex-col px-4'>
          <span>
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )
    }
  },
  {
    accessorKey: 'event_location',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Location
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div className='flex flex-col px-4'>
        <span className='truncate'>{row.getValue('event_location')}</span>
      </div>
    )
  },
  {
    accessorKey: 'assignments',
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Participants
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const event = row.original
      const assignments = event.assignments || []
      return (
        <div className='flex flex-col px-4'>
          <Button variant='ghost' size='sm' className='w-full'>
            <Users className='size-4' />
            <span>{assignments.length}</span>
          </Button>
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original
      return (
        <div className='flex items-center justify-end gap-2 px-4'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon' className='size-8'>
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
          <Button variant='ghost' size='icon' className='size-8'>
            <Trash className='size-4' />
          </Button>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex justify-end px-4'
      >
        Actions
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  }
]
