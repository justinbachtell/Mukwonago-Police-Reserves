'use client';

import { createEquipment } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EquipmentForm() {
  const router = useRouter();
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    description: '',
    serial_number: '',
    purchase_date: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEquipment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEquipment(newEquipment);
      toast({
        title: 'Equipment created successfully',
        description: 'The new equipment has been added to the database.',
      });
      setNewEquipment({
        name: '',
        description: '',
        serial_number: '',
        purchase_date: '',
        notes: '',
      });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Failed to create equipment',
        description: 'There was an error creating the equipment.',
        variant: 'destructive',
      });
      console.error('Error creating equipment:', error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Create New Equipment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Equipment Name</Label>
          <Input
            id="name"
            name="name"
            value={newEquipment.name}
            onChange={handleInputChange}
            required
            placeholder="Enter equipment name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={newEquipment.description}
            onChange={handleInputChange}
            placeholder="Enter equipment description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serial_number">Serial Number</Label>
          <Input
            id="serial_number"
            name="serial_number"
            value={newEquipment.serial_number}
            onChange={handleInputChange}
            placeholder="Enter serial number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            type="date"
            id="purchase_date"
            name="purchase_date"
            value={newEquipment.purchase_date}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            name="notes"
            value={newEquipment.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes"
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-lg bg-blue-700 px-8 py-2 text-white hover:bg-blue-800"
        >
          Create Equipment
        </Button>
      </form>
    </Card>
  );
}
