'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { DBUser } from '@/types/user'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Boxes, Pencil } from 'lucide-react'
import Link from 'next/link'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/columns.tsx'
})

// Define the type for users in the table including application status
interface UserWithApplication extends DBUser {
  application_status: 'pending' | 'approved' | 'rejected' | null
}

export const columns: ColumnDef<UserWithApplication>[] = [
  {
    accessorKey: 'first_name',
    cell: ({ row }) => {
      logger.debug(
        'Rendering first name cell',
        { firstName: row.getValue('first_name') },
        'columns'
      )
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('first_name')}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling first name sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        First Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'last_name',
    cell: ({ row }) => {
      logger.debug(
        'Rendering last name cell',
        { lastName: row.getValue('last_name') },
        'columns'
      )
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('last_name')}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling last name sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        Last Name
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'email',
    cell: ({ row }) => {
      logger.debug(
        'Rendering email cell',
        { email: row.getValue('email') },
        'columns'
      )
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('email')}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling email sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        Email
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'phone',
    cell: ({ row }) => {
      logger.debug(
        'Rendering phone cell',
        { phone: row.getValue('phone') },
        'columns'
      )
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('phone')}</span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling phone sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        Phone
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => {
      const position = row.getValue('position')
      logger.debug('Rendering position cell', { position }, 'columns')
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {(position?.toString() ?? '').charAt(0).toUpperCase() +
              (position?.toString() ?? '').slice(1)}
          </span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling position sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
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
      const role = row.getValue('role')
      logger.debug('Rendering role cell', { role }, 'columns')
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {(role?.toString() ?? '').charAt(0).toUpperCase() +
              (role?.toString() ?? '').slice(1)}
          </span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling role sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
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
      const status = row.getValue('application_status')
      logger.debug('Rendering application status cell', { status }, 'columns')
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {(status?.toString() ?? '').charAt(0).toUpperCase() +
              (status?.toString() ?? '').slice(1)}
          </span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling application status sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        Application Status
      </Button>
    )
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => {
      const date = row.getValue('created_at')
      logger.debug('Rendering created at cell', { date }, 'columns')
      return (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {new Date(date as string).toLocaleDateString()}
          </span>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => {
          logger.debug(
            'Toggling created at sort',
            { currentSort: column.getIsSorted() },
            'columns'
          )
          column.toggleSorting(column.getIsSorted() === 'asc')
        }}
        className='flex'
      >
        Created On
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    )
  },
  {
    cell: ({ row }) => {
      logger.debug(
        'Rendering action buttons',
        { userId: row.original.id },
        'columns'
      )
      return (
        <div className='flex items-center justify-end gap-2'>
          <Button variant='outline' size='icon' asChild className='size-8'>
            <Link href={`/admin/users/${row.original.id}`}>
              <Pencil className='size-4' />
            </Link>
          </Button>
          <Button variant='outline' size='icon' asChild className='size-8'>
            <Link href={`/admin/users/${row.original.id}/equipment`}>
              <Boxes className='size-4' />
            </Link>
          </Button>
        </div>
      )
    },
    id: 'actions'
  }
]
