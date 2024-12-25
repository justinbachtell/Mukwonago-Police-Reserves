'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { Equipment } from '@/types/equipment';
import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { returnEquipment, updateAssignedEquipment } from '@/actions/assignedEquipment';
import { updateUniformSizes } from '@/actions/uniformSizes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { equipmentConditionEnum } from '@/models/Schema';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

// Standard shirt sizes including all common variations
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

// Pant sizes combining waist (28-44) and inseam (30-34) measurements
const PANT_SIZES = [
  '28x30',
  '30x30',
  '32x30',
  '34x30',
  '36x30',
  '38x30',
  '40x30',
  '28x32',
  '30x32',
  '32x32',
  '34x32',
  '36x32',
  '38x32',
  '40x32',
  '30x34',
  '32x34',
  '34x34',
  '36x34',
  '38x34',
  '40x34',
];

// Shoe sizes from 6 to 15, including half sizes
const SHOE_SIZES = [
  '6',
  '6.5',
  '7',
  '7.5',
  '8',
  '8.5',
  '9',
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12',
  '13',
  '14',
  '15',
];

type EquipmentFormProps = {
  user: DBUser;
  assignedEquipment?: AssignedEquipment[] | null;
  assignedEquipmentHistory: AssignedEquipment[];
  availableEquipment: Equipment[];
  currentUniformSizes: UniformSizes;
};

export function AssignEquipmentForm({
  user: dbUser,
  assignedEquipment,
  assignedEquipmentHistory,
  availableEquipment,
  currentUniformSizes,
}: EquipmentFormProps) {
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

  const [editingAssignment, setEditingAssignment] = useState<AssignedEquipment | null>(null);
  const [editData, setEditData] = useState({
    condition: '',
    expected_return_date: '',
    checked_in_at: '',
    notes: '',
  });

  const [uniformData, setUniformData] = useState<UniformSizes>({
    id: currentUniformSizes?.id || 0,
    user_id: dbUser.id,
    shirt_size: currentUniformSizes?.shirt_size || '',
    pant_size: currentUniformSizes?.pant_size || '',
    shoe_size: currentUniformSizes?.shoe_size || '',
    notes: currentUniformSizes?.notes || '',
    is_current: true,
    created_at: currentUniformSizes?.created_at || new Date().toISOString(),
    updated_at: currentUniformSizes?.updated_at || new Date().toISOString(),
    user: dbUser,
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

  // Update uniform state when props change
  useEffect(() => {
    if (currentUniformSizes) {
      setUniformData({
        id: currentUniformSizes.id,
        user_id: dbUser.id,
        shirt_size: currentUniformSizes.shirt_size,
        pant_size: currentUniformSizes.pant_size,
        shoe_size: currentUniformSizes.shoe_size,
        notes: currentUniformSizes.notes || '',
        is_current: true,
        created_at: currentUniformSizes.created_at,
        updated_at: currentUniformSizes.updated_at,
        user: dbUser,
      });
    }
  }, [currentUniformSizes, dbUser]);

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

  const handleReturnEquipment = async (assignmentId: number) => {
    try {
      if (!isLoaded || !clerkUser) {
        return;
      }

      // Ensure we have a valid condition
      const condition = equipmentConditionEnum.enumValues.includes(equipmentData.condition as any)
        ? equipmentData.condition as typeof equipmentConditionEnum.enumValues[number]
        : 'fair'; // Default to 'fair' if no valid condition is set

      await returnEquipment(
        assignmentId,
        condition,
        equipmentData.notes,
      );

      toast({
        title: 'Equipment returned successfully',
        description: 'The equipment has been marked as returned.',
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to return equipment',
        description: 'There was an error returning the equipment.',
        variant: 'destructive',
      });
      console.error('Error returning equipment:', error);
    }
  };

  const handleEditClick = (assignment: AssignedEquipment) => {
    const expected_return_date = assignment.expected_return_date
      ? new Date(assignment.expected_return_date).toISOString().split('T')[0]
      : '';
    const checked_in_at = assignment.checked_in_at
      ? new Date(assignment.checked_in_at).toISOString().split('T')[0]
      : '';

    setEditingAssignment(assignment);
    setEditData({
      condition: assignment.condition || '',
      expected_return_date: expected_return_date || '',
      checked_in_at: checked_in_at || '',
      notes: assignment.notes || '',
    });
  };

  const handleEditCancel = () => {
    setEditingAssignment(null);
    setEditData({
      condition: '',
      expected_return_date: '',
      checked_in_at: '',
      notes: '',
    });
  };

  const handleEditSave = async () => {
    try {
      if (!editingAssignment || !isLoaded || !clerkUser) {
        return;
      }

      // Ensure we have a valid condition
      const condition = equipmentConditionEnum.enumValues.includes(editData.condition as any)
        ? editData.condition as typeof equipmentConditionEnum.enumValues[number]
        : 'fair';

      // If checked_in_at is set, use returnEquipment action
      if (editData.checked_in_at) {
        await returnEquipment(
          editingAssignment.id,
          condition,
          editData.notes || '',
        );
      } else {
        // Otherwise update the equipment details
        await updateAssignedEquipment(editingAssignment.id, {
          condition,
          expected_return_date: editData.expected_return_date
            ? new Date(editData.expected_return_date).toISOString()
            : undefined,
          notes: editData.notes || '',
        });
      }

      toast({
        title: 'Assignment updated successfully',
        description: 'The equipment assignment has been updated.',
      });

      handleEditCancel();
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to update assignment',
        description: 'There was an error updating the equipment assignment.',
        variant: 'destructive',
      });
      console.error('Error updating assignment:', error);
    }
  };

  const handleUniformChange = (name: keyof UniformSizes, value: string) => {
    setUniformData(prev => ({ ...prev, [name]: value }));
  };

  const hasUniformSizesChanged = () => {
    return (
      uniformData.shirt_size !== (currentUniformSizes?.shirt_size || '')
      || uniformData.pant_size !== (currentUniformSizes?.pant_size || '')
      || uniformData.shoe_size !== (currentUniformSizes?.shoe_size || '')
      || uniformData.notes !== (currentUniformSizes?.notes || '')
    );
  };

  const handleUniformSizesSave = async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return;
      }

      if (!hasUniformSizesChanged()) {
        toast({
          title: 'No changes detected',
          description: 'Please make some changes before saving.',
        });
        return;
      }

      await updateUniformSizes(dbUser.id, uniformData);

      toast({
        title: 'Uniform sizes updated successfully',
        description: 'The uniform sizes have been updated.',
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to update uniform sizes',
        description: 'There was an error updating the uniform sizes.',
        variant: 'destructive',
      });
      console.error('Error updating uniform sizes:', error);
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

  // Combine current equipment with available equipment for the select options
  const equipmentOptions = [
    ...(currentEquipment?.equipment ? [currentEquipment.equipment] : []),
    ...availableEquipment,
  ];

  return (
    <div className="space-y-8">
      {/* Equipment Assignment Form */}
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
                        {equipmentOptions.find(e => e.id.toString() === equipmentData.equipment_id)?.name}
                        {equipmentOptions.find(e => e.id.toString() === equipmentData.equipment_id)?.serial_number
                          ? ` (${equipmentOptions.find(e => e.id.toString() === equipmentData.equipment_id)?.serial_number})`
                          : ''}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentOptions.map(equipment => (
                        <SelectItem key={equipment.id} value={equipment.id.toString()}>
                          {equipment.name}
                          {equipment.serial_number ? ` (${equipment.serial_number})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              : (
                  <div className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background">
                    {currentEquipment?.equipment?.name}
                    {currentEquipment?.equipment?.serial_number ? ` (${currentEquipment?.equipment?.serial_number})` : ''}
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
                          {condition.charAt(0).toUpperCase() + condition.slice(1)}
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

      {/* Equipment History Table */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Equipment History
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Checked Out</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Returned</TableHead>
              <TableHead>Notes</TableHead>
              {isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedEquipmentHistory.map((assignment) => {
              const isReturned = !!assignment.checked_in_at;
              return (
                <TableRow
                  key={assignment.id}
                  className={isReturned ? 'opacity-60' : undefined}
                >
                  <TableCell>
                    {assignment.equipment?.name}
                    {assignment.equipment?.serial_number && (
                      <span className="text-sm text-gray-500">
                        {' '}
                        (
                        {assignment.equipment.serial_number}
                        )
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAdmin && editingAssignment?.id === assignment.id
                      ? (
                          <Select
                            value={editData.condition}
                            onValueChange={value => setEditData({ ...editData, condition: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition">
                                {editData.condition.charAt(0).toUpperCase() + editData.condition.slice(1) || 'Select condition'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {equipmentConditionEnum.enumValues.map(condition => (
                                <SelectItem key={condition} value={condition}>
                                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      : (
                          assignment.condition.charAt(0).toUpperCase() + assignment.condition.slice(1)
                        )}
                  </TableCell>
                  <TableCell>{new Date(assignment.checked_out_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {isAdmin && editingAssignment?.id === assignment.id
                      ? (
                          <Input
                            type="date"
                            value={editData.expected_return_date}
                            onChange={e => setEditData({ ...editData, expected_return_date: e.target.value })}
                            min={assignment.checked_out_at.split('T')[0]}
                          />
                        )
                      : (
                          assignment.expected_return_date
                            ? new Date(assignment.expected_return_date).toLocaleDateString()
                            : 'N/A'
                        )}
                  </TableCell>
                  <TableCell>
                    {isAdmin && editingAssignment?.id === assignment.id
                      ? (
                          <Input
                            type="date"
                            value={editData.checked_in_at}
                            onChange={e => setEditData({ ...editData, checked_in_at: e.target.value })}
                            min={assignment.checked_out_at.split('T')[0]}
                          />
                        )
                      : (
                          assignment.checked_in_at
                            ? new Date(assignment.checked_in_at).toLocaleDateString()
                            : 'Not returned'
                        )}
                  </TableCell>
                  <TableCell>
                    {isAdmin && editingAssignment?.id === assignment.id
                      ? (
                          <Input
                            value={editData.notes}
                            onChange={e => setEditData({ ...editData, notes: e.target.value })}
                            placeholder="Add notes"
                          />
                        )
                      : (
                          assignment.notes || 'N/A'
                        )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {editingAssignment?.id === assignment.id
                        ? (
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleEditSave}
                                variant="default"
                                size="sm"
                              >
                                Save
                              </Button>
                              <Button
                                onClick={handleEditCancel}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          )
                        : (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleEditClick(assignment)}
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                              {!assignment.checked_in_at && (
                                <Button
                                  onClick={() => handleReturnEquipment(assignment.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Return
                                </Button>
                              )}
                            </div>
                          )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Uniform Sizes Form */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Uniform Sizes
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shirt_size">Shirt Size</Label>
            <Select
              value={uniformData.shirt_size}
              onValueChange={value => handleUniformChange('shirt_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shirt size">
                  {uniformData.shirt_size || 'Select shirt size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SHIRT_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pant_size">Pant Size</Label>
            <Select
              value={uniformData.pant_size}
              onValueChange={value => handleUniformChange('pant_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pant size">
                  {uniformData.pant_size || 'Select pant size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PANT_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shoe_size">Shoe Size</Label>
            <Select
              value={uniformData.shoe_size}
              onValueChange={value => handleUniformChange('shoe_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shoe size">
                  {uniformData.shoe_size || 'Select shoe size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SHOE_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="uniform_notes">Notes</Label>
            <Textarea
              id="uniform_notes"
              value={uniformData.notes || ''}
              onChange={e => handleUniformChange('notes', e.target.value)}
              className="w-full"
              placeholder="Any special sizing requirements"
              rows={2}
            />
          </div>

          {isAdmin && (
            <Button
              type="button"
              onClick={handleUniformSizesSave}
              className="w-full rounded-lg bg-blue-700 px-8 py-2 text-white hover:bg-blue-800"
            >
              Save Uniform Sizes
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
