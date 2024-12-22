'use client';

import type { SaveResult } from '@/types/forms';
import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { updateUniformSizes } from '@/actions/uniformSizes';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { Textarea } from '../ui/textarea';

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

type UniformSizesFormProps = {
  user: DBUser;
  currentSizes: UniformSizes;
  saveRef: React.RefObject<(() => Promise<SaveResult>) | null>;
};

export function UniformSizesForm({ user: dbUser, currentSizes, saveRef }: UniformSizesFormProps) {
  const { user: clerkUser, isLoaded } = useUser();

  const [uniformData, setUniformData] = useState<UniformSizes>({
    id: currentSizes?.id || 0,
    user_id: dbUser.id,
    shirt_size: currentSizes?.shirt_size || '',
    pant_size: currentSizes?.pant_size || '',
    shoe_size: currentSizes?.shoe_size || '',
    notes: currentSizes?.notes || '',
    is_current: true,
    created_at: currentSizes?.created_at || new Date().toISOString(),
    updated_at: currentSizes?.updated_at || new Date().toISOString(),
    user: dbUser,
  });

  // Update state when props change
  useEffect(() => {
    if (currentSizes) {
      setUniformData({
        id: currentSizes.id,
        user_id: dbUser.id,
        shirt_size: currentSizes.shirt_size,
        pant_size: currentSizes.pant_size,
        shoe_size: currentSizes.shoe_size,
        notes: currentSizes.notes || '',
        is_current: true,
        created_at: currentSizes.created_at || new Date().toISOString(),
        updated_at: currentSizes.updated_at || new Date().toISOString(),
        user: dbUser,
      });
    }
  }, [currentSizes, dbUser]);

  const hasUniformSizesChanged = useCallback((): boolean => {
    return (
      uniformData.shirt_size !== (currentSizes?.shirt_size || '')
      || uniformData.pant_size !== (currentSizes?.pant_size || '')
      || uniformData.shoe_size !== (currentSizes?.shoe_size || '')
      || uniformData.notes !== (currentSizes?.notes || '')
    );
  }, [uniformData, currentSizes]);

  const handleUniformChange = (name: keyof UniformSizes, value: string) => {
    setUniformData(prev => ({ ...prev, [name]: value }));
  };

  const handleUniformSizesSaveChanges = useCallback(async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return { success: false, message: 'Not authenticated' };
      }

      if (!hasUniformSizesChanged()) {
        return { success: true, message: 'No changes detected' };
      }

      const updatedSizes = await updateUniformSizes(dbUser.id, uniformData);
      return { success: true, data: updatedSizes };
    } catch (error) {
      console.error('Error updating uniform sizes:', error);
      return { success: false, message: 'Failed to update uniform sizes' };
    }
  }, [uniformData, dbUser.id, isLoaded, clerkUser, hasUniformSizesChanged]);

  // Store the save function in the ref
  useEffect(() => {
    saveRef.current = handleUniformSizesSaveChanges;
  }, [handleUniformSizesSaveChanges, saveRef]);

  return (
    <Card className="flex flex-col p-6 shadow-md md:col-span-3">
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
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={uniformData.notes || ''}
            onChange={e => handleUniformChange('notes', e.target.value)}
            className="w-full"
            placeholder="Any special sizing requirements"
            rows={1}
          />
        </div>
      </div>
    </Card>
  );
}
