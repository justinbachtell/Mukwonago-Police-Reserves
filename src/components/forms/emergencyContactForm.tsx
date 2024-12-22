'use client';

import type { EmergencyContact } from '@/types/emergencyContact';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import { updateEmergencyContact } from '@/actions/emergencyContact';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATES } from '@/libs/States';
import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

type EmergencyContactFormProps = {
  user: DBUser;
  currentContact: EmergencyContact;
  saveRef: React.RefObject<(() => Promise<SaveResult>) | null>;
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

export function EmergencyContactForm({
  user: dbUser,
  currentContact,
  saveRef,
}: EmergencyContactFormProps) {
  const { user: clerkUser, isLoaded } = useUser();
  const [formData, setFormData] = useState<EmergencyContact>({
    id: currentContact?.id || 0,
    user_id: dbUser.id,
    first_name: currentContact?.first_name || '',
    last_name: currentContact?.last_name || '',
    phone: currentContact?.phone || '',
    email: currentContact?.email || null,
    relationship: currentContact?.relationship || '',
    is_current: true,
    street_address: currentContact?.street_address || null,
    city: currentContact?.city || null,
    state: currentContact?.state || null,
    zip_code: currentContact?.zip_code || null,
    created_at: currentContact?.created_at || new Date().toISOString(),
    updated_at: currentContact?.updated_at || new Date().toISOString(),
    user: dbUser,
  });

  const hasFormChanged = useCallback((): boolean => {
    return (
      formData.first_name !== (currentContact?.first_name || '')
      || formData.last_name !== (currentContact?.last_name || '')
      || formData.phone !== (currentContact?.phone || '')
      || formData.email !== (currentContact?.email || null)
      || formData.relationship !== (currentContact?.relationship || '')
      || formData.street_address !== (currentContact?.street_address || null)
      || formData.city !== (currentContact?.city || null)
      || formData.state !== (currentContact?.state || null)
      || formData.zip_code !== (currentContact?.zip_code || null)
    );
  }, [formData, currentContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    switch (name) {
      case 'email':
        setFormData(prev => ({
          ...prev,
          [name]: value || null,
        }));
        break;
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

  const handleSaveChanges = useCallback(async () => {
    try {
      if (!isLoaded || !clerkUser) {
        return { success: false, message: 'Not authenticated' };
      }

      if (!hasFormChanged()) {
        return { success: true, message: 'No changes detected' };
      }

      if (!formData.first_name || !formData.last_name) {
        return { success: false, message: 'Please fill in all required fields' };
      }

      if (!isValidPhoneNumber(formData.phone)) {
        return { success: false, message: 'Please enter a valid phone number' };
      }

      const updatedContact = await updateEmergencyContact(dbUser.id, formData);
      return { success: true, data: updatedContact };
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      return { success: false, message: 'Failed to update emergency contact' };
    }
  }, [formData, dbUser.id, isLoaded, clerkUser, hasFormChanged]);

  // Store the save function in the ref
  useEffect(() => {
    saveRef.current = handleSaveChanges;
  }, [handleSaveChanges, saveRef]);

  const RELATIONSHIP_TYPES = [
    // Immediate Family
    'Spouse',
    'Husband',
    'Wife',
    'Mother',
    'Father',
    'Son',
    'Daughter',

    // Extended Family
    'Brother',
    'Sister',
    'Grandmother',
    'Grandfather',
    'Aunt',
    'Uncle',
    'Niece',
    'Nephew',
    'Cousin',

    // Step Family
    'Stepfather',
    'Stepmother',
    'Stepson',
    'Stepdaughter',
    'Stepbrother',
    'Stepsister',

    // In-Laws
    'Mother in Law',
    'Father in Law',
    'Brother in Law',
    'Sister in Law',

    // Partners
    'Partner',
    'Significant Other',
    'Former Spouse',

    // Other Relations
    'Legal Guardian',
    'Friend',
    'Neighbor',
    'Employer',
    'Doctor',
    'Primary Physician',
    'Other',
  ];

  // Add this new handler for Select components
  const handleSelectChange = (name: keyof EmergencyContact) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Personal Information */}
      <Card className="flex flex-col p-6 shadow-md md:col-span-9">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Emergency Contact
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-4">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-4">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="flex flex-col space-y-2 md:col-span-4">
              <Label htmlFor="relationship">Relationship</Label>
              <Select
                value={formData.relationship}
                onValueChange={handleSelectChange('relationship')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship">
                    {formData.relationship || 'Select relationship'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:grid md:grid-cols-12">
            <div className="flex flex-col space-y-2 md:col-span-6">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full"
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
            <div className="flex flex-col space-y-2 md:col-span-6">
              <Label htmlFor="street_address">Street Address</Label>
              <Input
                id="street_address"
                name="street_address"
                value={formData.street_address || ''}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-6">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 md:col-span-6 md:grid md:grid-cols-12">
            <div className="flex flex-col gap-2 md:col-span-6">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state || ''}
                onValueChange={handleSelectChange('state')}
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
            <div className="flex flex-col gap-2 md:col-span-6">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                name="zip_code"
                value={formData.zip_code || ''}
                onChange={handleChange}
                className="w-full"
                maxLength={5}
                placeholder="12345"
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
