'use client';

import type { DBUser } from '@/types/user';
import { updateUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

type ProfileFormProps = {
  user: DBUser;
};

function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');

  // Limit to 10 digits
  const trimmed = cleaned.slice(0, 10);

  // Format the number
  if (trimmed.length > 6) {
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
  } else if (trimmed.length > 3) {
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  } else if (trimmed.length > 0) {
    return `(${trimmed}`;
  }

  return trimmed;
}

function isValidPhoneNumber(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 10;
}

function formatState(value: string): string {
  return value.toUpperCase().slice(0, 2);
}

function formatZipCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 5);
}

function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode);
}

export function ProfileForm({ user: dbUser }: ProfileFormProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    first_name: dbUser.first_name || '',
    last_name: dbUser.last_name || '',
    phone: dbUser.phone || '',
    street_address: dbUser.street_address || '',
    city: dbUser.city || '',
    state: dbUser.state || '',
    zip_code: dbUser.zip_code || '',
    driver_license: dbUser.driver_license || '',
  });

  const hasFormChanged = (): boolean => {
    return (
      formData.first_name !== (dbUser.first_name || '')
      || formData.last_name !== (dbUser.last_name || '')
      || formData.phone !== (dbUser.phone || '')
      || formData.street_address !== (dbUser.street_address || '')
      || formData.city !== (dbUser.city || '')
      || formData.state !== (dbUser.state || '')
      || formData.zip_code !== (dbUser.zip_code || '')
      || formData.driver_license !== (dbUser.driver_license || '')
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case 'phone':
        setFormData(prev => ({
          ...prev,
          [name]: formatPhoneNumber(value),
        }));
        break;
      case 'state':
        setFormData(prev => ({
          ...prev,
          [name]: formatState(value),
        }));
        break;
      case 'zip_code':
        setFormData(prev => ({
          ...prev,
          [name]: formatZipCode(value),
        }));
        break;
      default:
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return;
      }

      if (!hasFormChanged()) {
        toast({
          title: 'No changes detected',
          description: 'Please make some changes before saving.',
          variant: 'default',
        });
        return;
      }

      if (formData.phone && !isValidPhoneNumber(formData.phone)) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a complete phone number.',
          variant: 'destructive',
        });
        return;
      }

      if (formData.zip_code && !isValidZipCode(formData.zip_code)) {
        toast({
          title: 'Invalid ZIP code',
          description: 'Please enter a valid 5-digit ZIP code.',
          variant: 'destructive',
        });
        return;
      }

      // Update both DB and Clerk
      await Promise.all([
        // Update your database
        updateUser(dbUser.id, formData),
        // Update Clerk user
        clerkUser.update({
          firstName: formData.first_name,
          lastName: formData.last_name,
        }),
      ]);

      toast({
        title: 'Profile updated successfully',
        description: 'Your profile has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: 'There was an error updating your profile.',
        variant: 'destructive',
      });
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Personal Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={dbUser.email}
              className="w-full"
              disabled
            />
            <p className="text-sm text-gray-500">
              Email can only be changed through your account settings.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full"
              placeholder="(123) 456-7890"
              maxLength={14}
            />
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Address Information
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full"
                maxLength={2}
                placeholder="CA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code</Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              className="w-full"
              maxLength={5}
              placeholder="12345"
            />
          </div>
        </div>
      </Card>

      {/* Driver's License */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Driver's License Information
        </h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver_license">Driver's License Number</Label>
            <Input
              id="driver_license"
              name="driver_license"
              value={formData.driver_license}
              onChange={handleChange}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Save Changes */}
      <div className="flex justify-end md:col-span-2">
        <Button
          type="button"
          className="rounded-lg bg-blue-700 px-8 py-2 text-white hover:bg-blue-800"
          onClick={handleSaveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
