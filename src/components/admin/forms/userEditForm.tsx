'use client';

import type { DBUser } from '@/types/user';
import { updateUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { positionsEnum, rolesEnum } from '@/models/Schema'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createLogger } from '@/lib/debug'
import { FormInput } from '@/components/ui/form-input'
import { rules } from '@/lib/validation'

const logger = createLogger({
  module: 'forms',
  file: 'userEditForm.tsx'
})

interface UserEditFormProps {
  user: DBUser
  onSuccess?: () => void
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const { toast } = useToast()
  logger.time('user-edit-form-render')

  try {
    logger.info(
      'Initializing user edit form',
      {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      'UserEditForm'
    )

    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [userData, setUserData] = useState(() => {
      logger.debug(
        'Setting initial form data',
        {
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          position: user.position
        },
        'UserEditForm'
      )

      return {
        callsign: user.callsign || '',
        city: user.city || '',
        driver_license: user.driver_license || '',
        driver_license_state: user.driver_license_state || '',
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        position: user.position,
        radio_number: user.radio_number || '',
        role: user.role,
        state: user.state || '',
        status: user.status,
        street_address: user.street_address || '',
        zip_code: user.zip_code || ''
      }
    })

    const handleInputChange = (name: keyof typeof userData, value: string) => {
      logger.debug(
        'Input change detected',
        { field: name, value },
        'handleInputChange'
      )
      setUserData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      logger.info(
        'Submitting user edit form',
        { userId: user.id },
        'handleSubmit'
      )
      logger.time('user-update-submission')

      // Check if any changes were made by comparing original user data with current form data
      const hasChanges = Object.entries(userData).some(([key, value]) => {
        const originalValue = user[key as keyof typeof user]
        return value !== originalValue
      })

      if (!hasChanges) {
        logger.info(
          'No changes detected in form data',
          { userId: user.id },
          'handleSubmit'
        )
        toast({
          description: "No changes were made to the user's information.",
          title: 'No Changes',
          variant: 'default'
        })
        return
      }

      try {
        startTransition(async () => {
          const updatedUser = await updateUser(user.id, userData)

          if (updatedUser) {
            logger.info(
              'User updated successfully',
              { userId: user.id },
              'handleSubmit'
            )
            toast({
              description: "The user's information has been updated.",
              title: 'User updated successfully'
            })
            onSuccess?.()
            router.refresh()
          } else {
            throw new Error('Failed to update user')
          }
        })
      } catch (error) {
        logger.error(
          'Failed to update user',
          logger.errorWithData(error),
          'handleSubmit'
        )
        toast({
          description: "There was an error updating the user's information.",
          title: 'Failed to update user',
          variant: 'destructive'
        })
      } finally {
        logger.timeEnd('user-update-submission')
      }
    }

    return (
      <Card className='p-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <FormInput
              label='First Name'
              name='first_name'
              value={userData.first_name}
              rules={[rules.required('First name'), rules.name()]}
              onValueChange={value => handleInputChange('first_name', value)}
              required
            />

            <FormInput
              label='Last Name'
              name='last_name'
              value={userData.last_name}
              rules={[rules.required('Last name'), rules.name()]}
              onValueChange={value => handleInputChange('last_name', value)}
              required
            />

            <FormInput
              label='Email'
              name='email'
              type='email'
              value={userData.email}
              rules={[rules.required('Email'), rules.email()]}
              onValueChange={value => handleInputChange('email', value)}
              required
            />

            <FormInput
              label='Phone'
              name='phone'
              type='tel'
              value={userData.phone}
              rules={[rules.phone()]}
              onValueChange={value => handleInputChange('phone', value)}
            />

            <FormInput
              label="Driver's License"
              name='driver_license'
              value={userData.driver_license}
              rules={[rules.driversLicense()]}
              onValueChange={value =>
                handleInputChange('driver_license', value)
              }
            />

            <FormInput
              label='Street Address'
              name='street_address'
              value={userData.street_address}
              rules={[rules.streetAddress()]}
              onValueChange={value =>
                handleInputChange('street_address', value)
              }
            />

            <FormInput
              label='City'
              name='city'
              value={userData.city}
              rules={[rules.city()]}
              onValueChange={value => handleInputChange('city', value)}
            />

            <FormInput
              label='State'
              name='state'
              value={userData.state}
              rules={[rules.minLength(2, 'State')]}
              onValueChange={value => handleInputChange('state', value)}
            />

            <FormInput
              label='ZIP Code'
              name='zip_code'
              value={userData.zip_code}
              rules={[rules.zipCode()]}
              onValueChange={value => handleInputChange('zip_code', value)}
            />

            <FormInput
              label='Callsign'
              name='callsign'
              value={userData.callsign}
              rules={[rules.minLength(1, 'Callsign')]}
              onValueChange={value => handleInputChange('callsign', value)}
            />

            <FormInput
              label='Radio Number'
              name='radio_number'
              value={userData.radio_number}
              rules={[rules.minLength(1, 'Radio number')]}
              onValueChange={value => handleInputChange('radio_number', value)}
            />

            <div className='space-y-2'>
              <Select
                value={userData.role}
                onValueChange={value => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
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

            <div className='space-y-2'>
              <Select
                value={userData.position}
                onValueChange={value => handleInputChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select position' />
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

          <div className='flex justify-end space-x-4'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    )
  } catch (error) {
    logger.error(
      'Error rendering user edit form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('user-edit-form-render')
  }
}
