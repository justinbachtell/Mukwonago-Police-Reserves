'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { EventAssignment } from '@/types/eventAssignment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

export const columns: ColumnDef<EventAssignment>[] = [
  {
    accessorKey: 'event.event_name',
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
      <span className='block px-4'>{row.original.event?.event_name}</span>
    )
  },
  {
    accessorKey: 'event.event_type',
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
      const event = row.original.event
      if (!event) {
        return null
      }
      return (
        <Badge variant='secondary' className='font-medium'>
          {formatEnumValueWithMapping(event.event_type)}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'event.event_date',
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
      const date = row.original.event?.event_date
      return date ? (
        <span className='block px-4'>
          {new Date(date).toLocaleDateString()}
        </span>
      ) : null
    }
  },
  {
    accessorKey: 'event.event_start_time',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Time
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const startTime = row.original.event?.event_start_time
      const endTime = row.original.event?.event_end_time
      return startTime && endTime ? (
        <span className='block px-4'>
          {new Date(startTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}{' '}
          -{' '}
          {new Date(endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      ) : null
    }
  },
  {
    accessorKey: 'event.event_location',
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
      <span className='block px-4'>{row.original.event?.event_location}</span>
    )
  },
  {
    accessorKey: 'completion_status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('completion_status') as string
      return status ? (
        <Badge
          variant={status === 'completed' ? 'default' : 'secondary'}
          className='font-medium'
        >
          {formatEnumValueWithMapping(status)}
        </Badge>
      ) : (
        <Badge variant='secondary' className='font-medium'>
          Pending
        </Badge>
      )
    }
  }
]
