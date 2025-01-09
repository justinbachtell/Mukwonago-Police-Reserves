'use client';

import type { DBUser } from '@/types/user';
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ArrowUpDown, Pencil } from 'lucide-react'
import Link from 'next/link'

interface ContactsTableProps {
  data: DBUser[]
  isAdmin: boolean
}

export function ContactsTable({ data, isAdmin }: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'last_name', desc: false }
  ])

  const columns: ColumnDef<DBUser>[] = [
    {
      accessorKey: 'first_name',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('first_name')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            First Name
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'last_name',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('last_name')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Last Name
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'phone',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('phone')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Phone
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('email')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Email
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'position',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>
            {(row.getValue('position') as string).charAt(0).toUpperCase()}
            {(row.getValue('position') as string).slice(1)}
          </span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Position
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'callsign',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('callsign')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Callsign
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      accessorKey: 'radio_number',
      cell: ({ row }) => (
        <div className='flex flex-col px-4'>
          <span className='truncate'>{row.getValue('radio_number')}</span>
        </div>
      ),
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className='flex'
          >
            Radio Number
            <ArrowUpDown className='ml-2 size-4' />
          </Button>
        )
      }
    },
    {
      cell: ({ row }) => {
        if (!isAdmin) {
          return null
        }

        return (
          <div className='flex items-center justify-end gap-2'>
            <Button variant='outline' size='icon' asChild>
              <Link href={`/admin/users/${row.original.id}`} className='size-8'>
                <Pencil className='size-4' />
              </Link>
            </Button>
          </div>
        )
      },
      header: 'Actions',
      id: 'actions'
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
