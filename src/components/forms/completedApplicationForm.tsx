'use client';

import type { Application } from '@/types/application';
import type { DBUser } from '@/types/user';
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
import { STATES } from '@/libs/States'

interface Props {
  user: DBUser
  application: Application
}

function getStateName(abbreviation: string): string {
  const state = STATES.find(s => s.abbreviation === abbreviation)
  return state ? state.name : abbreviation
}

export function CompletedApplicationForm({ application, user }: Props) {
  return (
    <form className='space-y-6'>
      <Card className='p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          Personal Information
        </h2>
        <div className='grid gap-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='first_name'>First Name</Label>
              <Input
                id='first_name'
                name='first_name'
                placeholder='Enter your first name'
                className='w-full'
                value={user.first_name}
                disabled
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='last_name'>Last Name</Label>
              <Input
                id='last_name'
                name='last_name'
                placeholder='Enter your last name'
                className='w-full'
                value={user.last_name}
                disabled
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='Enter your email'
              className='w-full'
              value={user.email}
              disabled
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input
              id='phone'
              name='phone'
              type='tel'
              placeholder='Enter your phone number'
              className='w-full'
              value={user.phone || ''}
              disabled
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='driver_license'>Driver&apos;s License</Label>
            <Input
              id='driver_license'
              name='driver_license'
              placeholder="Enter your driver's license number"
              className='w-full'
              value={user.driver_license || ''}
              disabled
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='driver_license_state'>
              Driver&apos;s License State
            </Label>
            <Input
              id='driver_license_state'
              name='driver_license_state'
              placeholder="Enter the state of your driver's license"
              className='w-full'
              value={
                application.driver_license_state
                  ? getStateName(application.driver_license_state)
                  : ''
              }
              disabled
            />
          </div>
        </div>
      </Card>

      <Card className='p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          Address Information
        </h2>
        <div className='grid gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='street_address'>Street Address</Label>
            <Input
              id='street_address'
              name='street_address'
              placeholder='Enter your street address'
              className='w-full'
              value={user.street_address || ''}
              disabled
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='city'>City</Label>
              <Input
                id='city'
                name='city'
                placeholder='Enter your city'
                className='w-full'
                value={user.city || ''}
                disabled
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='state'>State</Label>
              <Input
                id='state'
                name='state'
                placeholder='Enter your state'
                className='w-full'
                value={user.state ? getStateName(user.state) : ''}
                disabled
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='zip_code'>ZIP Code</Label>
            <Input
              id='zip_code'
              name='zip_code'
              placeholder='Enter your ZIP code'
              className='w-full'
              value={user.zip_code || ''}
              disabled
            />
          </div>
        </div>
      </Card>

      <Card className='p-6'>
        <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
          Additional Information
        </h2>
        <div className='grid gap-6'>
          <div className='space-y-2'>
            <Label htmlFor='prior_experience'>
              Prior Law Enforcement Experience
            </Label>
            <Select
              name='prior_experience'
              value={application.prior_experience}
              disabled
            >
              <SelectTrigger id='prior_experience'>
                <SelectValue placeholder='Select experience level' />
              </SelectTrigger>
              <SelectContent>
                {priorExperienceEnum.enumValues.map(experience => (
                  <SelectItem key={experience} value={experience}>
                    {experience
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='availability'>Availability</Label>
            <Select
              name='availability'
              value={application.availability}
              disabled
            >
              <SelectTrigger id='availability'>
                <SelectValue placeholder='Select availability' />
              </SelectTrigger>
              <SelectContent>
                {availabilityEnum.enumValues.map(availability => (
                  <SelectItem key={availability} value={availability}>
                    {availability
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='position'>Desired Position</Label>
            <Select name='position' value={application.position} disabled>
              <SelectTrigger id='position'>
                <SelectValue placeholder='Select position' />
              </SelectTrigger>
              <SelectContent>
                {positionsEnum.enumValues
                  .filter(position => position !== 'admin')
                  .map(position => (
                    <SelectItem key={position} value={position}>
                      {position
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </form>
  )
}
