'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { DBUser } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, Boxes, User } from 'lucide-react'
import Link from 'next/link'
import { AssignEquipmentToUserDialog } from '@/components/admin/dialogs/assignEquipmentToUserDialog'

// Define the type for users in the table including application status
export interface UserWithApplication extends DBUser {
  application_status: 'pending' | 'approved' | 'rejected' | null
}

// Custom sort function for status priority
const getStatusPriority = (status: string | null) => {
  switch (status) {
    case 'pending':
      return 0
    case 'approved':
      return 1
    case 'rejected':
      return 2
    default:
      return 3
  }
}

// Custom sort function for users
export const sortUsers = (users: UserWithApplication[]) => {
  return users.sort((a, b) => {
    // First sort by status priority
    const statusDiff =
      getStatusPriority(a.application_status) -
      getStatusPriority(b.application_status)
    if (statusDiff !== 0) {
      return statusDiff
    }

    // If status is the same, sort by application date (most recent first)
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })
}

export const columns: ColumnDef<UserWithApplication>[] = [
  {
    accessorKey: 'first_name',
    cell: ({ row }) => (
      <div className='flex flex-col px-4'>
        <span className='truncate font-medium'>
          {row.getValue('first_name')}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        First Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'last_name',
    cell: ({ row }) => (
      <div className='flex flex-col px-4'>
        <span className='truncate font-medium'>
          {row.getValue('last_name')}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Last Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => {
      const position = row.getValue('position') as string
      return (
        <div className='flex flex-col px-4'>
          <Badge variant='outline' className='w-fit capitalize'>
            {position.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Position
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <div className='flex flex-col px-4'>
          <Badge variant='outline' className='w-fit capitalize'>
            {role}
          </Badge>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Role
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'application_status',
    cell: ({ row }) => {
      const status = row.getValue('application_status') as string | null
      if (!status) {
        return null
      }
      return (
        <div className='flex flex-col px-4'>
          <Badge
            variant={
              status === 'pending'
                ? 'outline'
                : status === 'approved'
                  ? 'success'
                  : 'destructive'
            }
            className='w-fit capitalize'
          >
            {status}
          </Badge>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Application Status
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className='flex flex-col px-4'>
          <span>{date.toLocaleDateString()}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        size='tableColumn'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='flex'
      >
        Created On
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='flex items-center justify-end gap-2 px-4'>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='size-8'
          title='View Profile'
        >
          <Link href={`/admin/users/${row.original.id}`}>
            <User className='size-4' />
          </Link>
        </Button>
        <Button
          variant='ghost'
          size='icon'
          asChild
          className='size-8'
          title='View Equipment'
        >
          <Link href={`/admin/users/${row.original.id}/equipment`}>
            <Boxes className='size-4' />
          </Link>
        </Button>
        <AssignEquipmentToUserDialog user={row.original} />
      </div>
    ),
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
