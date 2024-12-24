'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import { updateAssignedEquipment } from '@/actions/assignedEquipment';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

type AssignedEquipmentFormProps = {
  user: DBUser;
  currentEquipment: AssignedEquipment;
  saveRef: React.RefObject<(() => Promise<SaveResult>) | null>;
};

type Condition = 'new' | 'good' | 'fair' | 'poor' | 'damaged/broken';

export function AssignedEquipmentForm({
  currentEquipment,
  saveRef,
}: AssignedEquipmentFormProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [formData, setFormData] = useState<AssignedEquipment>(currentEquipment);

  const hasFormChanged = useCallback((): boolean => {
    return formData.condition !== currentEquipment.condition;
  }, [formData.condition, currentEquipment.condition]);

  const handleSaveChanges = useCallback(async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return { success: false, message: 'Not authenticated' };
      }

      if (!hasFormChanged()) {
        return { success: true, message: 'No changes detected' };
      }

      const dataToUpdate = {
        id: currentEquipment.id,
        condition: formData.condition,
        notes: formData.notes || undefined,
      };

      const updatedEquipment = await updateAssignedEquipment(currentEquipment.id, dataToUpdate);
      if (!updatedEquipment) {
        return { success: false, message: 'Failed to update equipment' };
      }

      setFormData(updatedEquipment);
      return { success: true, data: updatedEquipment };
    } catch (error) {
      console.error('Error updating equipment condition:', error);
      return { success: false, message: 'Failed to update equipment condition' };
    }
  }, [formData, currentEquipment.id, isLoaded, clerkUser, hasFormChanged]);

  // Store the save function in the ref
  useEffect(() => {
    saveRef.current = handleSaveChanges;
  }, [handleSaveChanges, saveRef]);

  const handleSelectChange = (value: Condition) => {
    setFormData((prev: AssignedEquipment) => ({
      ...prev,
      condition: value,
      notes: prev.notes,
    }));
  };

  const CONDITIONS: Condition[] = ['new', 'good', 'fair', 'poor', 'damaged/broken'];

  return (
    <Card className="p-6 shadow-md md:col-span-12">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Assigned Equipment
      </h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Equipment</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Assigned On</TableHead>
            <TableHead>Expected Return</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>{formData.equipment?.name}</TableCell>
            <TableCell>
              <Select
                value={formData.condition}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {new Date(formData.checked_out_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {formData.expected_return_date
                ? new Date(formData.expected_return_date).toLocaleDateString()
                : 'N/A'}
            </TableCell>
            <TableCell>
              {formData.notes || 'N/A'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
