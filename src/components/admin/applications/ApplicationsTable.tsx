'use client';

import type { Application } from '@/types/application';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { updateApplicationStatus } from '@/actions/application';

const columns: ColumnDef<Application>[] = [
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
    cell: ({ row }) => {
      const position = row.getValue('position') as string
      return (
        <div className="flex flex-col px-4">
          <Badge variant="outline" className="w-fit capitalize">
            {position.replace('_', ' ')}
          </Badge>
        </div>
      )
    },
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
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className="flex flex-col px-4">
          <Badge
            variant={
              status === 'pending' ? 'outline' : status === 'approved' ? 'default' : 'destructive'
            }
            className="w-fit capitalize"
          >
            {status}
          </Badge>
        </div>
      )
    },
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Status
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'created_at',
    cell: ({ row }) => (
      <div className="flex flex-col px-4">
        <span className="truncate">
          {(row.getValue('created_at') as Date).toLocaleDateString()}
        </span>
      </div>
    ),
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex"
      >
        Applied On
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    cell: ({ row }) => {
      const application = row.original
      const isDecided = application.status !== 'pending'

      const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
        try {
          await updateApplicationStatus(application.id, status)
          toast.success(`Application ${status} successfully`)
        } catch {
          toast.error('Failed to update application status')
        }
      }

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('approved')}
            disabled={isDecided}
            className="h-8 w-20"
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isDecided}
            className="h-8 w-20 text-destructive"
          >
            Reject
          </Button>
        </div>
      )
    },
    header: 'Actions',
    id: 'actions',
  },
];

interface ApplicationsTableProps {
  data: Application[]
}

export function ApplicationsTable({ data }: ApplicationsTableProps) {
  return <DataTable columns={columns} data={data} />;
}
