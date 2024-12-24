'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { DBUser } from '@/types/user';
import { updateAssignedEquipment } from '@/actions/assignedEquipment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { equipmentConditionEnum } from '@/models/Schema';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type EquipmentFormProps = {
  user: DBUser;
  assignedEquipment?: AssignedEquipment[] | null;
};

export function EquipmentForm({ user: dbUser, assignedEquipment }: EquipmentFormProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const isAdmin = dbUser.role === 'admin';

  const currentEquipment = assignedEquipment?.[0];

  const [equipmentData, setEquipmentData] = useState({
    equipment_id: currentEquipment?.equipment_id?.toString() || '',
    condition: currentEquipment?.condition || '',
    checked_out_at: currentEquipment?.checked_out_at
      ? new Date(currentEquipment.checked_out_at).toISOString().split('T')[0]
      : '',
    expected_return_date: currentEquipment?.expected_return_date
      ? new Date(currentEquipment.expected_return_date).toISOString().split('T')[0]
      : '',
    notes: currentEquipment?.notes || '',
    user_id: dbUser.id,
  });

  useEffect(() => {
    if (assignedEquipment) {
      setEquipmentData({
        equipment_id: Number(currentEquipment?.equipment_id).toString(),
        condition: currentEquipment?.condition || '',
        checked_out_at: currentEquipment?.checked_out_at
          ? new Date(currentEquipment.checked_out_at).toISOString().split('T')[0]
          : '',
        expected_return_date: currentEquipment?.expected_return_date
          ? new Date(currentEquipment.expected_return_date).toISOString().split('T')[0]
          : '',
        notes: currentEquipment?.notes || '',
        user_id: dbUser.id,
      });
    }
  }, [assignedEquipment, currentEquipment?.checked_out_at, currentEquipment?.condition, currentEquipment?.equipment_id, currentEquipment?.expected_return_date, currentEquipment?.notes, dbUser]);

  const hasEquipmentChanged = (): boolean => {
    if (!currentEquipment) {
      return false;
    }
    return (
      equipmentData.equipment_id !== currentEquipment?.equipment_id.toString()
      || equipmentData.condition !== currentEquipment?.condition
      || equipmentData.checked_out_at !== currentEquipment?.checked_out_at.split('T')[0]
      || equipmentData.expected_return_date !== (currentEquipment?.expected_return_date?.split('T')[0] || '')
      || equipmentData.notes !== (currentEquipment?.notes || '')
    );
  };

  const handleEquipmentChange = (name: keyof typeof equipmentData, value: string) => {
    setEquipmentData(prev => ({
      ...prev,
      [name]: name === 'condition'
        ? value as typeof equipmentConditionEnum.enumValues[number]
        : value,
    }));
  };

  const handleEquipmentSaveChanges = async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return;
      }

      if (!hasEquipmentChanged()) {
        toast({
          title: 'No changes detected',
          description: 'Please make some changes before saving.',
        });
        return;
      }

      // For non-admin users, only allow condition and notes updates
      const updateData = isAdmin
        ? {
            equipment_id: Number(equipmentData.equipment_id),
            condition: equipmentData.condition as typeof equipmentConditionEnum.enumValues[number],
            checked_out_at: equipmentData.checked_out_at
              ? new Date(equipmentData.checked_out_at).toISOString()
              : undefined,
            expected_return_date: equipmentData.expected_return_date
              ? new Date(equipmentData.expected_return_date).toISOString()
              : undefined,
            notes: equipmentData.notes,
          }
        : {
            condition: equipmentData.condition as typeof equipmentConditionEnum.enumValues[number],
            notes: equipmentData.notes,
          };

      await updateAssignedEquipment(dbUser.id, updateData);

      toast({
        title: 'Equipment updated successfully',
        description: 'Your equipment has been updated.',
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to update equipment',
        description: 'There was an error updating your equipment.',
        variant: 'destructive',
      });
      console.error('Error updating equipment:', error);
    }
  };

  if (!assignedEquipment && (!isAdmin || (isAdmin && !assignedEquipment))) {
    return (
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Equipment Status
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No equipment has been assigned to you yet. Please wait for an administrator to assign you equipment.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Equipment
        {' '}
        {isAdmin ? 'Management' : 'Status'}
      </h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipment</Label>
          {isAdmin
            ? (
                <Select
                  value={equipmentData.equipment_id}
                  onValueChange={value => handleEquipmentChange('equipment_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment">
                      {currentEquipment?.equipment?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currentEquipment?.equipment?.name}
                  </SelectContent>
                </Select>
              )
            : (
                <div className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                  {currentEquipment?.equipment?.name}
                </div>
              )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          {isAdmin
            ? (
                <Select
                  value={equipmentData.condition}
                  onValueChange={value => handleEquipmentChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition">
                      {equipmentData.condition || 'Select condition'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentConditionEnum.enumValues.map(condition => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            : (
                <div className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                  {currentEquipment?.condition || 'Not specified'}
                </div>
              )}
        </div>

        {isAdmin && (
          <>
            <div className="space-y-2">
              <Label htmlFor="checked_out_at">Checkout Date</Label>
              <Input
                type="date"
                value={equipmentData.checked_out_at}
                onChange={e => handleEquipmentChange('checked_out_at', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_return_date">Expected Return Date</Label>
              <Input
                type="date"
                value={equipmentData.expected_return_date}
                onChange={e => handleEquipmentChange('expected_return_date', e.target.value)}
                min={equipmentData.checked_out_at}
                className="w-full"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          {isAdmin
            ? (
                <Input
                  id="notes"
                  value={equipmentData.notes}
                  onChange={e => handleEquipmentChange('notes', e.target.value)}
                  className="w-full"
                  placeholder="Any notes about the equipment"
                />
              )
            : (
                <div className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                  {currentEquipment?.notes || 'No notes'}
                </div>
              )}
        </div>

        {isAdmin && (
          <Button
            type="button"
            onClick={handleEquipmentSaveChanges}
            className="w-full rounded-lg bg-blue-700 px-8 py-2 text-white hover:bg-blue-800"
          >
            Save Equipment Changes
          </Button>
        )}
      </div>
    </Card>
  );
}
