'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { markAsObsolete } from '@/actions/equipment'
import { ReturnEquipmentForm } from '@/components/admin/equipment/returnEquipmentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ArrowUpDown, Plus, Trash } from 'lucide-react'
import type { EquipmentCondition } from '@/types/assignedEquipment'
import { createLogger } from '@/lib/debug'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { AssignEquipmentForm } from '@/components/admin/equipment/assignEquipmentForm'
import { getAllUsers } from '@/actions/user'
import { useState } from 'react'
import type { DBUser } from '@/types/user'

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

function AssignDialog({ equipment }: { equipment: EquipmentWithUser }) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<DBUser[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen) {
      try {
        setIsLoading(true)
        logger.info('Fetching users for dialog', { equipmentId: equipment.id })
        const allUsers = await getAllUsers()
        if (allUsers) {
          const eligibleUsers = allUsers.filter(
            user => user.role === 'member' || user.role === 'admin'
          )
          setUsers(eligibleUsers)
        }
      } catch (error) {
        logger.error(
          'Error fetching users',
          logger.errorWithData(error),
          'handleOpen'
        )
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    setOpen(isOpen)
  }

  const handleSuccess = () => {
    setOpen(false)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-2'
          title='Assign to User'
        >
          <Plus className='size-4' />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Assign Equipment</DialogTitle>
          <DialogDescription>
            Assign {equipment.name} to a user
          </DialogDescription>
        </DialogHeader>
        <div className='mt-4'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-center'>
                <div className='mb-2 size-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500'></div>
                <p className='text-sm text-muted-foreground'>
                  Loading users...
                </p>
              </div>
            </div>
          ) : (
            <AssignEquipmentForm
              availableEquipment={[
                {
                  ...equipment,
                  assignments: [],
                  assignedTo: undefined
                }
              ]}
              users={users}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const columns: ColumnDef<EquipmentWithUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      logger.debug('Rendering name header', undefined, 'columns')
      return (
        <Button
          variant='ghost'
          size='tableColumn'
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
        className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
      >
        <span className='truncate'>
          {row.getValue('description') || 'No description'}
        </span>
      </div>
    ),
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
  },
  {
    accessorKey: 'serial_number',
    cell: ({ row }) => (
      <div
        className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
      >
        <span className='truncate'>
          {row.getValue('serial_number') || 'N/A'}
        </span>
      </div>
    ),
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          size='tableColumn'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Serial Number
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    }
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
        size='tableColumn'
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
          size='tableColumn'
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
          className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
        >
          <span className='truncate'>{assignedUserName || 'Unassigned'}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Assigned To
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'notes',
    cell: ({ row }) => (
      <div
        className={`flex flex-col pr-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}
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
          {!equipment.is_assigned && !equipment.is_obsolete && (
            <AssignDialog equipment={equipment} />
          )}
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
