'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  position: string;
  created_at: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'first_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        First Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'last_name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Last Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Email
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Role
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="capitalize">{row.getValue('role')}</span>,
  },
  {
    accessorKey: 'position',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Position
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="capitalize">{row.getValue('position')}</span>,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created At
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href={`/admin/users/${row.original.id}`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/admin/users/${row.original.id}/equipment`}>Equipment</Link>
        </Button>
      </div>
    ),
  },
];
