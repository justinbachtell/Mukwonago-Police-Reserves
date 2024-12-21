'use client';

import type { Equipment } from '@/types/equipment';
import type { ColumnDef } from '@tanstack/react-table';
import { deleteEquipment } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'serial_number',
    header: 'Serial Number',
  },
  {
    accessorKey: 'purchase_date',
    header: 'Purchase Date',
    cell: ({ row }) => {
      const date = row.getValue('purchase_date') as string;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const equipment = row.original;

      const handleDelete = async () => {
        try {
          await deleteEquipment(equipment.id);
          toast({
            title: 'Equipment deleted',
            description: 'The equipment has been removed from the database.',
          });
          window.location.reload();
        } catch (error) {
          toast({
            title: 'Failed to delete equipment',
            description: 'There was an error deleting the equipment.',
            variant: 'destructive',
          });
          console.error('Error deleting equipment:', error);
        }
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];
