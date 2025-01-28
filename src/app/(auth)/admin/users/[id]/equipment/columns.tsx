'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ReturnEquipmentForm } from '@/components/admin/equipment/returnEquipmentForm'
import type { AssignedEquipment } from '@/types/assignedEquipment'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

export const columns: ColumnDef<AssignedEquipment>[] = [
  {
    accessorKey: 'equipment.name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Equipment
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const equipment = row.original.equipment
      return (
        <span>
          {equipment?.name}
          {equipment?.serial_number && (
            <span className='ml-1 px-4 text-sm text-muted-foreground'>
              ({equipment.serial_number})
            </span>
          )}
        </span>
      )
    }
  },
  {
    accessorKey: 'condition',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Condition
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => <span className='px-4'>{row.original.condition}</span>
  },
  {
    accessorKey: 'checked_out_at',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Checked Out
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='px-4'>
        {new Date(row.original.checked_out_at).toLocaleDateString()}
      </span>
    )
  },
  {
    accessorKey: 'expected_return_date',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expected Return
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='px-4'>
        {row.original.expected_return_date
          ? new Date(row.original.expected_return_date).toLocaleDateString()
          : 'Not specified'}
      </span>
    )
  },
  {
    accessorKey: 'checked_in_at',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Returned On
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className='px-4'>
        {row.original.checked_in_at
          ? new Date(row.original.checked_in_at).toLocaleDateString()
          : 'Not returned'}
      </span>
    )
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant={row.original.checked_in_at ? 'secondary' : 'default'}>
        {row.original.checked_in_at ? 'Returned' : 'Active'}
      </Badge>
    )
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Notes
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => <span>{row.original.notes || 'No notes'}</span>
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const item = row.original
      return !item.checked_in_at ? (
        <ReturnEquipmentForm
          assignmentId={item.id}
          currentCondition={
            item.condition as
              | 'new'
              | 'good'
              | 'fair'
              | 'poor'
              | 'damaged/broken'
          }
        />
      ) : (
        <p>Returned {new Date(item.checked_in_at).toLocaleDateString()}</p>
      )
    }
  }
]
