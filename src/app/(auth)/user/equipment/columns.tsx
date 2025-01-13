'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { AssignedEquipment } from '@/types/assignedEquipment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { format } from 'date-fns'

export const columns: ColumnDef<AssignedEquipment>[] = [
  {
    accessorKey: 'equipment.name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Equipment Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='block px-4'>{row.original.equipment?.name}</span>
    )
  },
  {
    accessorKey: 'equipment.serial_number',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Serial Number
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='block px-4'>
        {row.original.equipment?.serial_number}
      </span>
    )
  },
  {
    accessorKey: 'condition',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Condition
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {row.getValue('condition')}
      </Badge>
    )
  },
  {
    accessorKey: 'checked_out_at',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Checked Out
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('checked_out_at') as string
      if (!date) {
        return null
      }
      return (
        <span className='block px-4'>
          {format(new Date(date), 'MMM d, yyyy')}
        </span>
      )
    }
  },
  {
    accessorKey: 'checked_in_at',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex'
        >
          Checked In
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('checked_in_at') as string | null
      if (!date) {
        return <span className='block px-4'>Not returned</span>
      }
      return (
        <span className='block px-4'>
          {format(new Date(date), 'MMM d, yyyy')}
        </span>
      )
    }
  },
  {
    accessorKey: 'status',
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
      const isCheckedIn = row.original.checked_in_at
      return (
        <Badge
          variant={isCheckedIn ? 'secondary' : 'default'}
          className='capitalize'
        >
          {isCheckedIn ? 'Returned' : 'Active'}
        </Badge>
      )
    }
  }
]

// Helper function to sort equipment assignments
export function sortEquipment(assignments: AssignedEquipment[]) {
  // First, separate active and returned equipment
  const activeEquipment = assignments.filter(item => !item.checked_in_at)
  const returnedEquipment = assignments.filter(item => item.checked_in_at)

  // Sort active equipment by most recently checked out
  const sortedActiveEquipment = activeEquipment.sort(
    (a, b) =>
      new Date(b.checked_out_at).getTime() -
      new Date(a.checked_out_at).getTime()
  )

  // Sort returned equipment by most recently checked in
  const sortedReturnedEquipment = returnedEquipment.sort((a, b) => {
    if (!a.checked_in_at || !b.checked_in_at) {
      return 0
    }
    return (
      new Date(b.checked_in_at).getTime() - new Date(a.checked_in_at).getTime()
    )
  })

  // Combine the arrays with active equipment first, then returned equipment
  return [...sortedActiveEquipment, ...sortedReturnedEquipment]
}
