import type { Application } from '@/types/application';
import type { ColumnDef } from '@tanstack/react-table';
import { updateApplicationStatus } from '@/actions/application';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const columns: ColumnDef<Application>[] = [
  {
    accessorKey: 'first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'position',
    cell: ({ row }) => {
      const position = row.getValue('position') as string
      return (
        <Badge variant="outline" className="capitalize">
          {position.replace('_', ' ')}
        </Badge>
      )
    },
    header: 'Position',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={
            status === 'pending' ? 'outline' : status === 'approved' ? 'default' : 'destructive'
          }
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
    header: 'Status',
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('approved')}
            disabled={isDecided}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isDecided}
            className="text-destructive"
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
