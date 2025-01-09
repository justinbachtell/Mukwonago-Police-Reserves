'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { markAsObsolete } from '@/actions/equipment'
import { ReturnEquipmentForm } from '@/components/admin/forms/returnEquipmentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ArrowUpDown, Trash } from 'lucide-react'
import type { EquipmentCondition } from '@/types/assignedEquipment'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'equipment/columns.tsx'
})

export interface EquipmentWithUser {
  id: number
  name: string
  description: string | null
  serial_number: string | null
  purchase_date: string | null
  notes: string | null
  is_assigned: boolean
  assigned_to: string | null
  created_at: string
  updated_at: string
  assignedUserName: string | null
  condition: EquipmentCondition
  is_obsolete: boolean
}

export const columns: ColumnDef<EquipmentWithUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      logger.debug('Rendering name header', undefined, 'columns')
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      logger.debug(
        'Rendering name cell',
        { id: row.original.id, name: row.getValue('name') },
        'columns'
      )
      return (
        <div
          className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
        >
          <span className='truncate'>{row.getValue('name')}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'description',
    cell: ({ row }) => (
      <div
        className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}
      >
        <span className='truncate'>
          {row.getValue('description') || 'No description'}
        </span>
      </div>
    ),
    header: 'Description'
  },
  {
    accessorKey: 'serial_number',
    cell: ({ row }) => (
      <div
        className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}
      >
        <span className='truncate'>
          {row.getValue('serial_number') || 'N/A'}
        </span>
      </div>
    ),
    header: 'Serial Number'
  },
  {
    accessorKey: 'purchase_date',
    cell: ({ row }) => {
      const date = row.getValue('purchase_date')
      return date ? (
        <div
          className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
        >
          <span className='truncate'>
            {new Date(date as string).toLocaleDateString()}
          </span>
        </div>
      ) : (
        <div
          className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
        >
          <span className='truncate'>Not specified</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Purchase Date
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'is_assigned',
    header: ({ column }) => {
      logger.debug('Rendering status header', undefined, 'columns')
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isAssigned = row.getValue('is_assigned')
      const isObsolete = row.original.is_obsolete

      logger.debug(
        'Rendering status cell',
        {
          id: row.original.id,
          isAssigned,
          isObsolete
        },
        'columns'
      )

      if (isObsolete) {
        return (
          <div className='flex flex-col px-4'>
            <Badge variant='destructive'>Obsolete</Badge>
          </div>
        )
      }

      return (
        <div className='flex flex-col px-4'>
          <Badge variant={isAssigned ? 'secondary' : 'default'}>
            {isAssigned ? 'Assigned' : 'Available'}
          </Badge>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const aObsolete = rowA.original.is_obsolete
      const bObsolete = rowB.original.is_obsolete
      const aAssigned = rowA.getValue('is_assigned') as boolean
      const bAssigned = rowB.getValue('is_assigned') as boolean

      logger.debug(
        'Sorting status',
        {
          aId: rowA.original.id,
          bId: rowB.original.id,
          aObsolete,
          bObsolete,
          aAssigned,
          bAssigned
        },
        'columns'
      )

      if (aObsolete !== bObsolete) {
        return aObsolete ? 1 : -1
      }
      if (aAssigned !== bAssigned) {
        return aAssigned ? 1 : -1
      }
      return (rowA.getValue('name') as string).localeCompare(
        rowB.getValue('name') as string
      )
    }
  },
  {
    accessorKey: 'assignedUserName',
    cell: ({ row }) => {
      const assignedUserName = row.original.assignedUserName
      return (
        <div
          className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}
        >
          <span className='truncate'>{assignedUserName || 'Unassigned'}</span>
        </div>
      )
    },
    header: 'Assigned To'
  },
  {
    accessorKey: 'notes',
    cell: ({ row }) => (
      <div
        className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}
      >
        <span className='truncate'>{row.getValue('notes') || 'No notes'}</span>
      </div>
    ),
    header: 'Notes'
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const equipment = row.original

      logger.debug(
        'Rendering actions',
        {
          id: equipment.id,
          isAssigned: equipment.is_assigned,
          isObsolete: equipment.is_obsolete
        },
        'columns'
      )

      const handleMarkObsolete = async () => {
        try {
          logger.info(
            'Marking equipment as obsolete',
            { id: equipment.id },
            'handleMarkObsolete'
          )
          await markAsObsolete(equipment.id)
          toast({
            title: 'Equipment marked as obsolete',
            description: 'The equipment has been marked as obsolete.'
          })
          window.location.reload()
        } catch (error) {
          logger.error(
            'Error marking equipment as obsolete',
            logger.errorWithData(error),
            'handleMarkObsolete'
          )
          toast({
            title: 'Failed to mark as obsolete',
            description:
              'There was an error marking the equipment as obsolete.',
            variant: 'destructive'
          })
        }
      }

      return (
        <div className='flex gap-2'>
          {equipment.is_assigned && (
            <ReturnEquipmentForm
              assignmentId={equipment.id}
              currentCondition={equipment.condition}
            />
          )}
          {!equipment.is_obsolete && (
            <Button
              variant='destructive'
              size='sm'
              onClick={handleMarkObsolete}
              disabled={equipment.is_obsolete}
            >
              <Trash className='size-4' />
            </Button>
          )}
        </div>
      )
    }
  }
]
