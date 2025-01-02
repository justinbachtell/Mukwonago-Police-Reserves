'use client';

import type { DBUser } from '@/types/user';
import { updateUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { positionsEnum, rolesEnum } from '@/models/Schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserEditFormProps {
  user: DBUser
}

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const [userData, setUserData] = useState({
    callsign: user.callsign || '',
    city: user.city || '',
    driver_license: user.driver_license || '',
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone || '',
    position: user.position,
    radio_number: user.radio_number || '',
    role: user.role,
    state: user.state || '',
    street_address: user.street_address || '',
    zip_code: user.zip_code || '',
  });

  const handleInputChange = (name: keyof typeof userData, value: string) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(user.id, userData);
      toast({
        description: 'The user information has been updated.',
        title: 'User updated successfully',
      });
      router.refresh();
    }
    catch (error) {
      toast({
        description: 'There was an error updating the user information.',
        title: 'Failed to update user',
        variant: 'destructive',
      });
      console.error('Error updating user:', error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={userData.first_name}
              onChange={e => handleInputChange('first_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={userData.last_name}
              onChange={e => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={userData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_license">Driver's License</Label>
            <Input
              id="driver_license"
              value={userData.driver_license}
              onChange={e => handleInputChange('driver_license', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              value={userData.street_address}
              onChange={e => handleInputChange('street_address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={userData.city}
              onChange={e => handleInputChange('city', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={userData.state}
              onChange={e => handleInputChange('state', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code</Label>
            <Input
              id="zip_code"
              value={userData.zip_code}
              onChange={e => handleInputChange('zip_code', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="callsign">Callsign</Label>
            <Input
              id="callsign"
              value={userData.callsign}
              onChange={e => handleInputChange('callsign', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="radio_number">Radio Number</Label>
            <Input
              id="radio_number"
              value={userData.radio_number}
              onChange={e => handleInputChange('radio_number', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={userData.role}
              onValueChange={value => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {rolesEnum.enumValues.map(role => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select
              value={userData.position}
              onValueChange={value => handleInputChange('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positionsEnum.enumValues.map(position => (
                  <SelectItem key={position} value={position}>
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>
  );
}
