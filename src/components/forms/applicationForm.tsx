'use client';

import type { DBUser } from '@/types/user';
import { createApplication } from '@/actions/application';
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
import { availabilityEnum, positionsEnum, priorExperienceEnum } from '@/models/Schema';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

type Props = {
  user: DBUser;
};

export function ApplicationForm({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createApplication({
          first_name: formData.get('first_name') as string,
          last_name: formData.get('last_name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          driver_license: formData.get('driver_license') as string,
          street_address: formData.get('street_address') as string,
          city: formData.get('city') as string,
          state: formData.get('state') as string,
          zip_code: formData.get('zip_code') as string,
          prior_experience: formData.get('prior_experience') as typeof priorExperienceEnum.enumValues[number],
          availability: formData.get('availability') as typeof availabilityEnum.enumValues[number],
          position: formData.get('position') as typeof positionsEnum.enumValues[number],
          user_id: user.id,
        });

        toast.success('Application submitted successfully');
        router.refresh();
      } catch (error) {
        console.error('Error submitting application:', error);
        toast.error('Failed to submit application. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                className="w-full"
                defaultValue={user.first_name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                className="w-full"
                defaultValue={user.last_name}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full"
              defaultValue={user.email}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="w-full"
              defaultValue={user.phone || ''}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_license">Driver's License</Label>
            <Input
              id="driver_license"
              name="driver_license"
              placeholder="Enter your driver's license number"
              className="w-full"
              defaultValue={user.driver_license || ''}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Address Information
        </h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="street_address">Street Address</Label>
            <Input
              id="street_address"
              name="street_address"
              placeholder="Enter your street address"
              className="w-full"
              defaultValue={user.street_address || ''}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Enter your city"
                className="w-full"
                defaultValue={user.city || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                placeholder="Enter your state"
                className="w-full"
                defaultValue={user.state || ''}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code</Label>
            <Input
              id="zip_code"
              name="zip_code"
              placeholder="Enter your ZIP code"
              className="w-full"
              defaultValue={user.zip_code || ''}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Additional Information
        </h2>
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="prior_experience">Prior Law Enforcement Experience</Label>
            <Select name="prior_experience" required>
              <SelectTrigger id="prior_experience">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                {priorExperienceEnum.enumValues.map(experience => (
                  <SelectItem key={experience} value={experience}>
                    {experience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select name="availability" required>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                {availabilityEnum.enumValues.map(availability => (
                  <SelectItem key={availability} value={availability}>
                    {availability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Desired Position</Label>
            <Select name="position" defaultValue="reserve" required>
              <SelectTrigger id="position">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positionsEnum.enumValues
                  .filter(position => position !== 'admin')
                  .map(position => (
                    <SelectItem key={position} value={position}>
                      {position.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="rounded-lg bg-blue-700 px-8 py-6 text-lg text-white hover:bg-blue-800"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}
