'use client';

import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { updateUniformSizes } from '@/actions/uniformSizes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const PANT_SIZES = ['28x30', '30x30', '32x30', '34x30', '36x30', '28x32', '30x32', '32x32', '34x32', '36x32'];
const SHOE_SIZES = Array.from({ length: 15 }, (_, i) => (i + 6).toString()); // sizes 6-20
const HAT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '6 7/8', '7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4'];

type UniformSizesFormProps = {
  user: DBUser;
  currentSizes: UniformSizes | null;
};

export function UniformSizesForm({ user: dbUser, currentSizes }: UniformSizesFormProps) {
  const { user: clerkUser, isLoaded } = useUser();

  const [uniformData, setUniformData] = useState<UniformSizes>({
    id: currentSizes?.id || 0,
    user_id: dbUser.id,
    shirt_size: currentSizes?.shirt_size || '',
    pant_size: currentSizes?.pant_size || '',
    shoe_size: currentSizes?.shoe_size || '',
    hat_size: currentSizes?.hat_size || '',
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
        hat_size: currentSizes.hat_size || '',
        notes: currentSizes.notes || '',
        is_current: true,
        created_at: currentSizes.created_at || new Date().toISOString(),
        updated_at: currentSizes.updated_at || new Date().toISOString(),
        user: dbUser,
      });
    }
  }, [currentSizes, dbUser]);

  const hasUniformSizesChanged = (): boolean => {
    return (
      uniformData.shirt_size !== (currentSizes?.shirt_size || '')
      || uniformData.pant_size !== (currentSizes?.pant_size || '')
      || uniformData.shoe_size !== (currentSizes?.shoe_size || '')
      || uniformData.hat_size !== (currentSizes?.hat_size || '')
      || uniformData.notes !== (currentSizes?.notes || '')
    );
  };

  const handleUniformChange = (name: keyof UniformSizes, value: string) => {
    setUniformData(prev => ({ ...prev, [name]: value }));
  };

  const handleUniformSizesSaveChanges = async () => {
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
        description: 'Your uniform sizes have been updated.',
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Failed to update uniform sizes',
        description: 'There was an error updating your uniform sizes.',
        variant: 'destructive',
      });
      console.error('Error updating uniform sizes:', error);
    }
  };

  return (
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
          <Label htmlFor="hat_size">Hat Size</Label>
          <Select
            value={uniformData.hat_size || ''}
            onValueChange={value => handleUniformChange('hat_size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hat size">
                {uniformData.hat_size || 'Select hat size'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {HAT_SIZES.map(size => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={uniformData.notes || ''}
            onChange={e => handleUniformChange('notes', e.target.value)}
            className="w-full"
            placeholder="Any special sizing requirements"
          />
        </div>

        <Button
          type="button"
          onClick={handleUniformSizesSaveChanges}
          className="w-full rounded-lg bg-blue-700 px-8 py-2 text-white hover:bg-blue-800"
        >
          Save Uniform Sizes
        </Button>
      </div>
    </Card>
  );
}
