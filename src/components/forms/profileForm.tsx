'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { EmergencyContact } from '@/types/emergencyContact';
import type { SaveResult } from '@/types/forms';
import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { updateUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { STATES } from '@/libs/States';
import { useUser } from '@clerk/nextjs';
import { useCallback, useRef, useState } from 'react';
import { AssignedEquipmentForm } from './assignedEquipmentForm';
import { EmergencyContactForm } from './emergencyContactForm';
import { UniformSizesForm } from './uniformSizesForm';

type ProfileFormProps = {
  user: DBUser;
  currentSizes: UniformSizes;
  currentEmergencyContact: EmergencyContact;
  currentEquipment: AssignedEquipment | null;
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

export function ProfileForm({
  user: initialUser,
  currentSizes: initialSizes,
  currentEmergencyContact,
  currentEquipment,
}: ProfileFormProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [currentSizes, setCurrentSizes] = useState(initialSizes);
  const [assignedEquipment, setAssignedEquipment] = useState(currentEquipment);

  // Create refs for child form save functions
  const uniformSizesSaveRef = useRef<(() => Promise<SaveResult>) | null>(null);
  const emergencyContactSaveRef = useRef<(() => Promise<SaveResult>) | null>(null);
  const assignedEquipmentSaveRef = useRef<(() => Promise<SaveResult>) | null>(null);

  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    street_address: user.street_address || '',
    city: user.city || '',
    state: user.state || '',
    zip_code: user.zip_code || '',
    driver_license: user.driver_license || '',
    driver_license_state: user.driver_license_state || '',
  });

  const hasFormChanged = useCallback((): boolean => {
    return (
      formData.first_name !== (user.first_name || '')
      || formData.last_name !== (user.last_name || '')
      || formData.phone !== (user.phone || '')
      || formData.street_address !== (user.street_address || '')
      || formData.city !== (user.city || '')
      || formData.state !== (user.state || '')
      || formData.zip_code !== (user.zip_code || '')
      || formData.driver_license !== (user.driver_license || '')
      || formData.driver_license_state !== (user.driver_license_state || '')
    );
  }, [formData, user]);

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
      case 'driver_license_state':
        setFormData(prev => ({
          ...prev,
          [name]: formatState(value),
        }));
        break;
      default:
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMainFormSave = async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return { success: false, message: 'Not authenticated' };
      }

      if (!hasFormChanged()) {
        return { success: true, message: 'No changes detected' };
      }

      if (formData.phone && !isValidPhoneNumber(formData.phone)) {
        return { success: false, message: 'Please enter a complete phone number' };
      }

      if (formData.zip_code && !isValidZipCode(formData.zip_code)) {
        return { success: false, message: 'Please enter a valid 5-digit ZIP code' };
      }

      const [updatedUser] = await Promise.all([
        updateUser(user.id, formData),
        clerkUser.update({
          firstName: formData.first_name,
          lastName: formData.last_name,
        }),
      ]);

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);

      const results = await Promise.all([
        handleMainFormSave(),
        uniformSizesSaveRef.current?.() ?? Promise.resolve({ success: true, message: 'No changes' }),
        emergencyContactSaveRef.current?.() ?? Promise.resolve({ success: true, message: 'No changes' }),
        assignedEquipmentSaveRef.current?.() ?? Promise.resolve({ success: true, message: 'No changes' }),
      ]);

      const [mainResult, uniformResult, emergencyResult, equipmentResult] = results as SaveResult[];

      if (!mainResult?.success || !uniformResult?.success || !emergencyResult?.success || !equipmentResult?.success) {
        toast({
          title: 'Failed to save changes',
          description: mainResult?.message || uniformResult?.message || emergencyResult?.message || equipmentResult?.message || 'An error occurred while saving.',
          variant: 'destructive',
        });
        return;
      }

      // Update local state with new data
      if ('data' in mainResult && mainResult.data) {
        setUser(mainResult.data);
      }
      if ('data' in uniformResult && uniformResult.data) {
        setCurrentSizes(uniformResult.data);
      }
      if ('data' in equipmentResult && equipmentResult.data) {
        setAssignedEquipment(equipmentResult.data);
      }

      // Success toast if at least one form had changes
      toast({
        title: 'Changes saved successfully',
        description: 'Your profile has been updated.',
      });
    } catch (err) {
      console.error('Error saving changes:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:grid md:grid-cols-12">
      {/* Personal Information */}
      <Card className="flex flex-col p-6 shadow-md md:col-span-8">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-6">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-6">
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

          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-6">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                className="w-full"
                disabled
              />
            </div>

            <div className="flex flex-col space-y-2 md:col-span-6">
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

          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-8">
              <Label htmlFor="driver_license">Driver's License Number</Label>
              <Input
                id="driver_license"
                name="driver_license"
                value={formData.driver_license}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-4">
              <Label htmlFor="driver_license_state">Driver's License State</Label>
              <Select
                value={formData.driver_license_state}
                onValueChange={value => setFormData(prev => ({ ...prev, driver_license_state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state.abbreviation} value={state.abbreviation}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="flex flex-col p-6 shadow-md md:col-span-4">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Address Information
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2 md:col-span-12">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-12">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-6">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={value => setFormData(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem key={state.abbreviation} value={state.abbreviation}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2 md:col-span-6">
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
        </div>
      </Card>

      {/* Uniform Sizes */}
      <UniformSizesForm
        user={user}
        currentSizes={currentSizes}
        saveRef={uniformSizesSaveRef}
      />

      {/* Emergency Contact */}
      <EmergencyContactForm
        user={user}
        currentContact={currentEmergencyContact}
        saveRef={emergencyContactSaveRef}
      />

      {/* Assigned Equipment */}
      {assignedEquipment && (
        <AssignedEquipmentForm
          user={user}
          currentEquipment={assignedEquipment}
          saveRef={assignedEquipmentSaveRef}
        />
      )}

      {/* Save Button */}
      <div className="flex flex-col items-end justify-center md:col-span-12">
        <Button
          type="button"
          className="rounded-lg bg-blue-700 px-8 py-2 text-white shadow-md hover:bg-blue-800 md:max-w-fit"
          onClick={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
