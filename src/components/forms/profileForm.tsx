'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { EmergencyContact } from '@/types/emergencyContact';
import type { SaveResult } from '@/types/forms';
import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { updateUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { STATES } from '@/libs/States'
import { createClient } from '@/lib/client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AssignedEquipmentForm } from './assignedEquipmentForm'
import { EmergencyContactForm } from './emergencyContactForm'
import { UniformSizesForm } from './uniformSizesForm'
import { createLogger } from '@/lib/debug'
import type { Session } from '@supabase/supabase-js'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { LoadingCard } from '@/components/ui/loading'
import { FormInput } from '@/components/ui/form-input'
import { rules } from '@/lib/validation'

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

  const form = useForm({
    defaultValues: formData
  })

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
    return <LoadingCard />
  }

  return (
    <Form {...form}>
      <form className='mx-auto max-w-5xl space-y-6 py-10'>
        <div className='flex flex-row flex-wrap gap-6'>
          {/* Personal Information */}
          <Card className='w-full shadow-sm xl:max-w-[450px]'>
            <div className='border-b border-b-muted/20 bg-muted/5 px-7 py-4'>
              <h2 className='font-semibold tracking-tight'>
                Personal Information
              </h2>
            </div>
            <div className='p-7'>
              <div className='grid gap-8'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div>
                    <FormInput
                      label='First Name'
                      name='first_name'
                      value={formData.first_name}
                      rules={[
                        rules.required('First name'),
                        rules.minLength(2, 'First name'),
                        rules.name()
                      ]}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, first_name: value }))
                      }
                    />
                  </div>
                  <div>
                    <FormInput
                      label='Last Name'
                      name='last_name'
                      value={formData.last_name}
                      rules={[
                        rules.required('Last name'),
                        rules.minLength(2, 'Last name'),
                        rules.name()
                      ]}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, last_name: value }))
                      }
                    />
                  </div>
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <div>
                    <FormInput
                      label='Email'
                      name='email'
                      type='email'
                      value={session?.user?.email ?? ''}
                      disabled
                      className='bg-muted'
                    />
                  </div>
                  <div>
                    <FormInput
                      label='Phone Number'
                      name='phone'
                      type='tel'
                      value={formData.phone}
                      rules={[rules.required('Phone number'), rules.phone()]}
                      formatter='phone'
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          phone: formatPhoneNumber(value)
                        }))
                      }
                      placeholder='(123) 456-7890'
                      maxLength={14}
                    />
                  </div>
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <div>
                    <FormInput
                      label="Driver's License Number"
                      name='driver_license'
                      value={formData.driver_license}
                      rules={[rules.driversLicense()]}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          driver_license: value
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='driver_license_state'
                      className='text-sm font-medium'
                    >
                      Driver's License State
                    </Label>
                    <Select
                      value={formData.driver_license_state}
                      onValueChange={value => {
                        setFormData(prev => ({
                          ...prev,
                          driver_license_state: value
                        }))
                      }}
                    >
                      <SelectTrigger
                        id='driver_license_state'
                        aria-label="Driver's license state"
                      >
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
            </div>
          </Card>

          {/* Address Information */}
          <Card className='w-full shadow-sm xl:max-w-[450px]'>
            <div className='border-b border-b-muted/20 bg-muted/5 px-7 py-4'>
              <h2 className='font-semibold tracking-tight'>
                Address Information
              </h2>
            </div>
            <div className='p-7'>
              <div className='grid gap-8'>
                <div>
                  <FormInput
                    label='Street Address'
                    name='street_address'
                    value={formData.street_address}
                    rules={[rules.streetAddress()]}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, street_address: value }))
                    }
                  />
                </div>

                <div>
                  <FormInput
                    label='City'
                    name='city'
                    value={formData.city}
                    rules={[rules.city()]}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, city: value }))
                    }
                  />
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <div>
                    <Label htmlFor='state' className='text-sm font-medium'>
                      State
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={value => {
                        setFormData(prev => ({ ...prev, state: value }))
                      }}
                    >
                      <SelectTrigger id='state' aria-label='State of residence'>
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
                  <div>
                    <FormInput
                      label='ZIP Code'
                      name='zip_code'
                      value={formData.zip_code}
                      rules={[rules.zipCode()]}
                      formatter='zipCode'
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          zip_code: formatZipCode(value)
                        }))
                      }
                      maxLength={5}
                      placeholder='12345'
                    />
                  </div>
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

          {/* Equipment */}
          {assignedEquipment && (
            <AssignedEquipmentForm
              user={user}
              saveRef={assignedEquipmentSaveRef}
            />
          )}
        </div>

        {/* Save Button */}
        <div className='mx-auto flex max-w-5xl justify-end'>
          <Button
            type='button'
            size='lg'
            onClick={handleSaveAll}
            disabled={isSaving || isLoading}
            className='min-w-[150px]'
          >
            {isSaving ? (
              <>
                <span className='mr-2 size-4 animate-spin rounded-full border-2 border-gray-300 border-t-white'></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
