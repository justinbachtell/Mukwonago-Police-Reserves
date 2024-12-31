'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Boxes, Pencil } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  position: string
  created_at: string
  application_status: string | null
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'first_name',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">{row.getValue('first_name')}</span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        First Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'last_name',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">{row.getValue('last_name')}</span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Last Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">{row.getValue('email')}</span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Email
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'phone',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">{row.getValue('phone')}</span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Phone
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">
          {(row.getValue('position')?.toString() ?? '').charAt(0).toUpperCase()
          + (row.getValue('position')?.toString() ?? '').slice(1)}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Position
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'role',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">
          {(row.getValue('role')?.toString() ?? '').charAt(0).toUpperCase()
          + (row.getValue('role')?.toString() ?? '').slice(1)}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Role
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'application_status',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">
          {(row.getValue('application_status')?.toString() ?? '').charAt(0).toUpperCase()
          + (row.getValue('application_status')?.toString() ?? '').slice(1)}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Application Status
      </Button>
    ),
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">
          {new Date(row.getValue('created_at')).toLocaleDateString()}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Created On
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="icon" asChild className="size-8">
          <Link href={`/admin/users/${row.original.id}`}>
            <Pencil className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild className="size-8">
          <Link href={`/admin/users/${row.original.id}/equipment`}>
            <Boxes className="size-4" />
          </Link>
        </Button>
      </div>
    ),
    id: 'actions',
  },
];
