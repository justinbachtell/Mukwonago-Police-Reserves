'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { markAsObsolete } from '@/actions/equipment';
import { ReturnEquipmentForm } from '@/components/admin/forms/returnEquipmentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowUpDown, Trash } from 'lucide-react';

export type EquipmentWithUser = {
  id: number;
  name: string;
  description: string | null;
  serial_number: string | null;
  purchase_date: Date | null;
  notes: string | null;
  is_assigned: boolean;
  assigned_to: number | null;
  created_at: Date;
  updated_at: Date;
  assignedUserName: string | null;
  condition: string;
  is_obsolete: boolean;
};

export const columns: ColumnDef<EquipmentWithUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
        <span className="truncate">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
        <span className="truncate">{row.getValue('description') || 'No description'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'serial_number',
    header: 'Serial Number',
    cell: ({ row }) => (
      <div className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
        <span className="truncate">{row.getValue('serial_number') || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'purchase_date',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Purchase Date
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('purchase_date');
      return date
        ? (
            <div className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
              <span className="truncate">{new Date(date as string).toLocaleDateString()}</span>
            </div>
          )
        : (
            <div className={`flex flex-col px-4 ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
              <span className="truncate">Not specified</span>
            </div>
          );
    },
  },
  {
    accessorKey: 'is_assigned',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const isAssigned = row.getValue('is_assigned');
      const isObsolete = row.original.is_obsolete;

      if (isObsolete) {
        return (
          <div className="flex flex-col px-4">
            <Badge variant="destructive">Obsolete</Badge>
          </div>
        );
      }
      return isAssigned
        ? (
            <div className="flex flex-col px-4">
              <Badge variant="secondary">Assigned</Badge>
            </div>
          )
        : (
            <div className="flex flex-col px-4">
              <Badge variant="default">Available</Badge>
            </div>
          );
    },
    sortingFn: (rowA, rowB) => {
      const aObsolete = rowA.original.is_obsolete;
      const bObsolete = rowB.original.is_obsolete;
      const aAssigned = rowA.getValue('is_assigned') as boolean;
      const bAssigned = rowB.getValue('is_assigned') as boolean;

      if (aObsolete !== bObsolete) {
        return aObsolete ? 1 : -1;
      }
      if (aAssigned !== bAssigned) {
        return aAssigned ? 1 : -1;
      }
      const aName = rowA.getValue('name') as string;
      const bName = rowB.getValue('name') as string;
      return aName.localeCompare(bName);
    },
  },
  {
    accessorKey: 'assignedUserName',
    header: 'Assigned To',
    cell: ({ row }) => {
      const assignedUserName = row.original.assignedUserName;
      return (
        <div className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
          <span className="truncate">{assignedUserName || 'Unassigned'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => (
      <div className={`flex flex-col ${row.original.is_obsolete ? 'opacity-40' : ''}`}>
        <span className="truncate">{row.getValue('notes') || 'No notes'}</span>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const equipment = row.original;

      const handleMarkObsolete = async () => {
        try {
          await markAsObsolete(equipment.id);
          toast({
            title: 'Equipment marked as obsolete',
            description: 'The equipment has been marked as obsolete.',
          });
          window.location.reload();
        } catch (error) {
          toast({
            title: 'Failed to mark as obsolete',
            description: 'There was an error marking the equipment as obsolete.',
            variant: 'destructive',
          });
          console.error('Error marking equipment as obsolete:', error);
        }
      };

      return (
        <div className="flex gap-2">
          {equipment.is_assigned && (
            <ReturnEquipmentForm
              assignmentId={equipment.id}
              currentCondition={equipment.condition}
            />
          )}
          {!equipment.is_obsolete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMarkObsolete}
              disabled={equipment.is_obsolete}
            >
              <Trash className="size-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
