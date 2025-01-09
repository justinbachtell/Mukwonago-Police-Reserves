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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { STATES } from '@/libs/States';
import { createClient } from '@/lib/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AssignedEquipmentForm } from './assignedEquipmentForm'
import { EmergencyContactForm } from './emergencyContactForm'
import { UniformSizesForm } from './uniformSizesForm'
import { createLogger } from '@/lib/debug'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'profileForm.tsx'
})

interface ProfileFormProps {
  user: DBUser
  currentSizes: UniformSizes | null
  currentEmergencyContact: EmergencyContact | null
  currentEquipment: AssignedEquipment | null
}

interface UpdateUserData {
  first_name: string
  last_name: string
  phone: string
  street_address: string
  city: string
  state: string
  zip_code: string
  driver_license: string
  driver_license_state: string
  callsign: string | null
  radio_number: string | null
  status: 'active' | 'inactive' | 'denied'
}

function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '')

  // Limit to 10 digits
  const trimmed = cleaned.slice(0, 10)

  // Format the number
  if (trimmed.length > 6) {
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`
  } else if (trimmed.length > 3) {
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`
  } else if (trimmed.length > 0) {
    return `(${trimmed}`
  }

  return trimmed
}

function isValidPhoneNumber(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 10
}

function formatState(value: string): string {
  return value.toUpperCase().slice(0, 2)
}

function formatZipCode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 5)
}

function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode)
}

export function ProfileForm({
  user: initialUser,
  currentSizes: initialSizes,
  currentEmergencyContact,
  currentEquipment
}: ProfileFormProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [currentSizes, setCurrentSizes] = useState(initialSizes)
  const [assignedEquipment, setAssignedEquipment] = useState(currentEquipment)

  // Create refs for child form save functions
  const uniformSizesSaveRef = useRef<(() => Promise<SaveResult>) | null>(null)
  const emergencyContactSaveRef = useRef<(() => Promise<SaveResult>) | null>(
    null
  )
  const assignedEquipmentSaveRef = useRef<(() => Promise<SaveResult>) | null>(
    null
  )

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()
        if (error) {
          logger.error(
            'Failed to get auth session',
            logger.errorWithData(error),
            'checkSession'
          )
          throw error
        }
        logger.info(
          'Auth session retrieved',
          { userId: session?.user?.id },
          'checkSession'
        )
        setSession(session)
      } catch (error) {
        logger.error(
          'Session check error',
          logger.errorWithData(error),
          'checkSession'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    logger.info('Setting up auth state change listener', undefined, 'useEffect')
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.info(
        'Auth state changed',
        { userId: session?.user?.id },
        'onAuthStateChange'
      )
      setSession(session)
      setIsLoading(false)
    })

    return () => {
      logger.info('Cleaning up auth state listener', undefined, 'useEffect')
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const [formData, setFormData] = useState({
    city: user.city || '',
    driver_license: user.driver_license || '',
    driver_license_state: user.driver_license_state || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    state: user.state || '',
    street_address: user.street_address || '',
    zip_code: user.zip_code || ''
  })

  const hasFormChanged = useCallback((): boolean => {
    logger.debug(
      'Checking form changes',
      {
        current: formData,
        original: user
      },
      'hasFormChanged'
    )

    return (
      formData.first_name !== (user.first_name || '') ||
      formData.last_name !== (user.last_name || '') ||
      formData.phone !== (user.phone || '') ||
      formData.street_address !== (user.street_address || '') ||
      formData.city !== (user.city || '') ||
      formData.state !== (user.state || '') ||
      formData.zip_code !== (user.zip_code || '') ||
      formData.driver_license !== (user.driver_license || '') ||
      formData.driver_license_state !== (user.driver_license_state || '')
    )
  }, [formData, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    logger.debug('Form field changed', { field: name, value }, 'handleChange')

    switch (name) {
      case 'phone':
        setFormData(prev => ({
          ...prev,
          [name]: formatPhoneNumber(value)
        }))
        break
      case 'state':
        setFormData(prev => ({
          ...prev,
          [name]: formatState(value)
        }))
        break
      case 'zip_code':
        setFormData(prev => ({
          ...prev,
          [name]: formatZipCode(value)
        }))
        break
      case 'driver_license_state':
        setFormData(prev => ({
          ...prev,
          [name]: formatState(value)
        }))
        break
      default:
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleMainFormSave = async () => {
    logger.info('Saving main form data', undefined, 'handleMainFormSave')
    try {
      if (!session?.user) {
        logger.warn('No active session', undefined, 'handleMainFormSave')
        return { message: 'Not authenticated', success: false }
      }

      if (!hasFormChanged()) {
        logger.info('No changes detected', undefined, 'handleMainFormSave')
        return { message: 'No changes detected', success: true }
      }

      if (formData.phone && !isValidPhoneNumber(formData.phone)) {
        logger.warn(
          'Invalid phone number',
          { phone: formData.phone },
          'handleMainFormSave'
        )
        return {
          message: 'Please enter a complete phone number',
          success: false
        }
      }

      if (formData.zip_code && !isValidZipCode(formData.zip_code)) {
        logger.warn(
          'Invalid ZIP code',
          { zipCode: formData.zip_code },
          'handleMainFormSave'
        )
        return {
          message: 'Please enter a valid 5-digit ZIP code',
          success: false
        }
      }

      const updateData: UpdateUserData = {
        ...formData,
        callsign: user.callsign,
        radio_number: user.radio_number,
        status: 'active'
      }

      logger.info(
        'Updating user profile',
        { userId: user.id, data: updateData },
        'handleMainFormSave'
      )
      const updatedUser = await updateUser(user.id, updateData)
      logger.info(
        'Profile updated successfully',
        { userId: user.id },
        'handleMainFormSave'
      )

      return { data: updatedUser, success: true }
    } catch (error) {
      logger.error(
        'Failed to update profile',
        logger.errorWithData(error),
        'handleMainFormSave'
      )
      return { message: 'Failed to update profile', success: false }
    }
  }

  const handleSaveAll = async () => {
    logger.info('Starting save all process', undefined, 'handleSaveAll')
    try {
      setIsSaving(true)

      const results = await Promise.all([
        handleMainFormSave(),
        uniformSizesSaveRef.current?.() ??
          Promise.resolve({ message: 'No changes', success: true }),
        emergencyContactSaveRef.current?.() ??
          Promise.resolve({ message: 'No changes', success: true }),
        assignedEquipmentSaveRef.current?.() ??
          Promise.resolve({ message: 'No changes', success: true })
      ])

      const [mainResult, uniformResult, emergencyResult, equipmentResult] =
        results as SaveResult[]

      logger.info(
        'All save operations completed',
        {
          mainSuccess: mainResult?.success,
          uniformSuccess: uniformResult?.success,
          emergencySuccess: emergencyResult?.success,
          equipmentSuccess: equipmentResult?.success
        },
        'handleSaveAll'
      )

      if (
        !mainResult?.success ||
        !uniformResult?.success ||
        !emergencyResult?.success ||
        !equipmentResult?.success
      ) {
        const errorMessage =
          mainResult?.message ||
          uniformResult?.message ||
          emergencyResult?.message ||
          equipmentResult?.message ||
          'An error occurred while saving.'

        logger.error(
          'Save operation failed',
          { message: errorMessage },
          'handleSaveAll'
        )
        toast({
          description: errorMessage,
          title: 'Failed to save changes',
          variant: 'destructive'
        })
        return
      }

      // Update local state with new data
      if ('data' in mainResult && mainResult.data) {
        logger.info(
          'Updating user state',
          { userId: mainResult.data.id },
          'handleSaveAll'
        )
        setUser(mainResult.data)
      }
      if ('data' in uniformResult && uniformResult.data) {
        logger.info('Updating uniform sizes state', undefined, 'handleSaveAll')
        setCurrentSizes(uniformResult.data)
      }
      if ('data' in equipmentResult && equipmentResult.data) {
        logger.info('Updating equipment state', undefined, 'handleSaveAll')
        setAssignedEquipment(equipmentResult.data)
      }

      logger.info('All states updated successfully', undefined, 'handleSaveAll')
      toast({
        description: 'Your profile has been updated.',
        title: 'Changes saved successfully'
      })
    } catch (err) {
      logger.error(
        'Unexpected error during save all',
        logger.errorWithData(err),
        'handleSaveAll'
      )
      toast({
        description: 'An unexpected error occurred.',
        title: 'Error',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className='flex flex-col gap-8 md:grid md:grid-cols-12'>
      {/* Personal Information */}
      <Card className='flex flex-col p-6 shadow-md md:col-span-8'>
        <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
          Personal Information
        </h2>
        <div className='space-y-4'>
          <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='first_name'>First Name</Label>
              <Input
                id='first_name'
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='last_name'>Last Name</Label>
              <Input
                id='last_name'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                className='w-full'
              />
            </div>
          </div>

          <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={session?.user?.email ?? ''}
                className='w-full'
                disabled
              />
            </div>

            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleChange}
                className='w-full'
                placeholder='(123) 456-7890'
                maxLength={14}
              />
            </div>
          </div>

          <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
            <div className='flex flex-col space-y-2 md:col-span-8'>
              <Label htmlFor='driver_license'>Driver's License Number</Label>
              <Input
                id='driver_license'
                name='driver_license'
                value={formData.driver_license}
                onChange={handleChange}
                className='w-full'
              />
            </div>
            <div className='flex flex-col space-y-2 md:col-span-4'>
              <Label htmlFor='driver_license_state'>
                Driver's License State
              </Label>
              <Select
                value={formData.driver_license_state}
                onValueChange={value => {
                  logger.debug(
                    'Driver license state changed',
                    { value },
                    'onValueChange'
                  )
                  setFormData(prev => ({
                    ...prev,
                    driver_license_state: value
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select state' />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem
                      key={state.abbreviation}
                      value={state.abbreviation}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>
      {/* Address Information */};
      <Card className='flex flex-col p-6 shadow-md md:col-span-4'>
        <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
          Address Information
        </h2>
        <div className='space-y-4'>
          <div className='flex flex-col space-y-2 md:col-span-12'>
            <Label htmlFor='street_address'>Street Address</Label>
            <Input
              id='street_address'
              name='street_address'
              value={formData.street_address}
              onChange={handleChange}
              className='w-full'
            />
          </div>

          <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
            <div className='flex flex-col space-y-2 md:col-span-12'>
              <Label htmlFor='city'>City</Label>
              <Input
                id='city'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full'
              />
            </div>
          </div>

          <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='state'>State</Label>
              <Select
                value={formData.state}
                onValueChange={value => {
                  logger.debug('State changed', { value }, 'onValueChange')
                  setFormData(prev => ({ ...prev, state: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select state' />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(state => (
                    <SelectItem
                      key={state.abbreviation}
                      value={state.abbreviation}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col space-y-2 md:col-span-6'>
              <Label htmlFor='zip_code'>ZIP Code</Label>
              <Input
                id='zip_code'
                name='zip_code'
                value={formData.zip_code}
                onChange={handleChange}
                className='w-full'
                maxLength={5}
                placeholder='12345'
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
        <AssignedEquipmentForm user={user} saveRef={assignedEquipmentSaveRef} />
      )}
      {/* Save Button */}
      <div className='flex flex-col items-end justify-center md:col-span-12'>
        <Button
          type='button'
          className='rounded-lg bg-blue-700 px-8 py-2 text-white shadow-md hover:bg-blue-800 md:max-w-fit'
          onClick={handleSaveAll}
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
