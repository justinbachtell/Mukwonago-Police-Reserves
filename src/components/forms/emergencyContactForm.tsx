'use client';

import type { EmergencyContact } from '@/types/emergencyContact';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateEmergencyContact } from '@/actions/emergencyContact'
import { STATES } from '@/libs/States'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'emergencyContactForm.tsx'
})

interface EmergencyContactFormProps {
  user: DBUser
  currentContact: EmergencyContact | null
  saveRef: MutableRefObject<(() => Promise<SaveResult>) | null>
}

function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  const trimmed = cleaned.slice(0, 10)

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

export function EmergencyContactForm({
  currentContact,
  saveRef,
  user: dbUser
}: EmergencyContactFormProps) {
  logger.time('emergency-contact-form-render')

  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setIsLoading(false)
    }

    checkSession()
  }, [supabase.auth])

  const [formData, setFormData] = useState<EmergencyContact>({
    city: currentContact?.city || null,
    created_at: currentContact?.created_at || toISOString(new Date()),
    email: currentContact?.email || null,
    first_name: currentContact?.first_name || '',
    id: currentContact?.id || 0,
    is_current: true,
    last_name: currentContact?.last_name || '',
    phone: currentContact?.phone || '',
    relationship: currentContact?.relationship || '',
    state: currentContact?.state || null,
    street_address: currentContact?.street_address || null,
    updated_at: currentContact?.updated_at || toISOString(new Date()),
    user: dbUser,
    user_id: dbUser.id,
    zip_code: currentContact?.zip_code || null
  })

  logger.info(
    'Form initialized',
    {
      hasCurrentContact: !!currentContact,
      userId: dbUser.id
    },
    'EmergencyContactForm'
  )

  const hasFormChanged = useCallback((): boolean => {
    const changed =
      formData.first_name !== (currentContact?.first_name || '') ||
      formData.last_name !== (currentContact?.last_name || '') ||
      formData.phone !== (currentContact?.phone || '') ||
      formData.email !== (currentContact?.email || null) ||
      formData.relationship !== (currentContact?.relationship || '') ||
      formData.street_address !== (currentContact?.street_address || null) ||
      formData.city !== (currentContact?.city || null) ||
      formData.state !== (currentContact?.state || null) ||
      formData.zip_code !== (currentContact?.zip_code || null)

    logger.debug(
      'Checking form changes',
      { changed, currentContact, formData },
      'hasFormChanged'
    )

    return changed
  }, [formData, currentContact])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    logger.debug('Field change', { field: name, value }, 'handleChange')

    switch (name) {
      case 'email':
        setFormData(prev => ({
          ...prev,
          [name]: value || null
        }))
        break
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
      default:
        setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSaveChanges = useCallback(async () => {
    logger.time('save-emergency-contact')

    try {
      if (isLoading) {
        logger.warn(
          'Save attempted while loading',
          undefined,
          'handleSaveChanges'
        )
        return { message: 'Loading authentication state', success: false }
      }

      if (!session) {
        logger.warn(
          'Save attempted without auth',
          undefined,
          'handleSaveChanges'
        )
        return { message: 'Not authenticated', success: false }
      }

      if (!hasFormChanged()) {
        logger.info('No changes detected', undefined, 'handleSaveChanges')
        return { message: 'No changes detected', success: true }
      }

      if (!formData.first_name || !formData.last_name) {
        logger.warn('Missing required fields', undefined, 'handleSaveChanges')
        return { message: 'Please fill in all required fields', success: false }
      }

      if (!isValidPhoneNumber(formData.phone)) {
        logger.warn('Invalid phone number', undefined, 'handleSaveChanges')
        return { message: 'Please enter a valid phone number', success: false }
      }

      logger.info(
        'Saving changes',
        { contactId: formData.id },
        'handleSaveChanges'
      )

      const updatedContact = await updateEmergencyContact(
        String(formData.id),
        formData
      )
      logger.info(
        'Changes saved successfully',
        { contactId: formData.id },
        'handleSaveChanges'
      )
      return { data: updatedContact, success: true }
    } catch (error) {
      logger.error(
        'Error saving changes',
        logger.errorWithData(error),
        'handleSaveChanges'
      )
      return { message: 'Failed to update emergency contact', success: false }
    } finally {
      logger.timeEnd('save-emergency-contact')
    }
  }, [formData, isLoading, session, hasFormChanged])

  useEffect(() => {
    logger.info('[EmergencyContactForm] Updating save ref')
    saveRef.current = handleSaveChanges
  }, [handleSaveChanges, saveRef])

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
    'Other'
  ]

  // Add this new handler for Select components
  const handleSelectChange =
    (name: keyof EmergencyContact) => (value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

  try {
    return (
      <>
        {/* Personal Information */}
        <Card className='flex w-full flex-col p-6 shadow-md xl:max-w-[450px]'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
            Emergency Contact
          </h2>
          <div className='space-y-4'>
            <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
              <div className='flex flex-col space-y-2 md:col-span-4'>
                <Label htmlFor='first_name'>First Name</Label>
                <Input
                  id='first_name'
                  name='first_name'
                  value={formData.first_name}
                  onChange={handleChange}
                  className='w-full'
                />
              </div>
              <div className='flex flex-col space-y-2 md:col-span-4'>
                <Label htmlFor='last_name'>Last Name</Label>
                <Input
                  id='last_name'
                  name='last_name'
                  value={formData.last_name}
                  onChange={handleChange}
                  className='w-full'
                />
              </div>
              <div className='flex flex-col space-y-2 md:col-span-4'>
                <Label htmlFor='relationship'>Relationship</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={handleSelectChange('relationship')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select relationship'>
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

            <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
              <div className='flex flex-col space-y-2 md:col-span-6'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email || ''}
                  onChange={handleChange}
                  className='w-full'
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
              <div className='flex flex-col space-y-2 md:col-span-6'>
                <Label htmlFor='street_address'>Street Address</Label>
                <Input
                  id='street_address'
                  name='street_address'
                  value={formData.street_address || ''}
                  onChange={handleChange}
                  className='w-full'
                />
              </div>

              <div className='flex flex-col gap-2 md:col-span-6'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  name='city'
                  value={formData.city || ''}
                  onChange={handleChange}
                  className='w-full'
                />
              </div>
            </div>

            <div className='flex flex-col gap-4 md:col-span-6 md:grid md:grid-cols-12'>
              <div className='flex flex-col gap-2 md:col-span-6'>
                <Label htmlFor='state'>State</Label>
                <Select
                  value={formData.state || ''}
                  onValueChange={handleSelectChange('state')}
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
              <div className='flex flex-col gap-2 md:col-span-6'>
                <Label htmlFor='zip_code'>ZIP Code</Label>
                <Input
                  id='zip_code'
                  name='zip_code'
                  value={formData.zip_code || ''}
                  onChange={handleChange}
                  className='w-full'
                  maxLength={5}
                  placeholder='12345'
                />
              </div>
            </div>
          </div>
        </Card>
      </>
    )
  } catch (error) {
    logger.error(
      'Error rendering emergency contact form',
      logger.errorWithData(error),
      'EmergencyContactForm'
    )
    throw error
  } finally {
    logger.timeEnd('emergency-contact-form-render')
  }
}
