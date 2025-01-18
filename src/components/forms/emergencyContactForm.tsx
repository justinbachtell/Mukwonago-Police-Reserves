'use client';

import type { EmergencyContact } from '@/types/emergencyContact';
import type { SaveResult } from '@/types/forms';
import type { DBUser } from '@/types/user';
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
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
import { rules } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

const logger = createLogger({
  module: 'forms',
  file: 'emergencyContactForm.tsx'
})

interface EmergencyContactFormProps {
  user: DBUser
  currentContact: EmergencyContact | null
  saveRef: MutableRefObject<(() => Promise<SaveResult>) | null>
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
  const { toast } = useToast()

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

  const handleFieldChange =
    (field: keyof EmergencyContact) => (value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value || null
      }))
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
        toast({
          title: 'Error',
          description: 'Please wait for the form to load',
          variant: 'destructive'
        })
        return { message: 'Loading authentication state', success: false }
      }

      if (!session) {
        logger.warn(
          'Save attempted without auth',
          undefined,
          'handleSaveChanges'
        )
        toast({
          title: 'Error',
          description: 'You must be logged in to save changes',
          variant: 'destructive'
        })
        return { message: 'Not authenticated', success: false }
      }

      if (!hasFormChanged()) {
        logger.info('No changes detected', undefined, 'handleSaveChanges')
        return { message: 'No changes detected', success: true }
      }

      if (!formData.first_name || !formData.last_name) {
        logger.warn('Missing required fields', undefined, 'handleSaveChanges')
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        })
        return { message: 'Please fill in all required fields', success: false }
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

      toast({
        title: 'Success',
        description: 'Emergency contact updated successfully',
        variant: 'default'
      })

      return { data: updatedContact, success: true }
    } catch (error) {
      logger.error(
        'Error saving changes',
        logger.errorWithData(error),
        'handleSaveChanges'
      )
      toast({
        title: 'Error',
        description: 'Failed to update emergency contact',
        variant: 'destructive'
      })
      return { message: 'Failed to update emergency contact', success: false }
    } finally {
      logger.timeEnd('save-emergency-contact')
    }
  }, [isLoading, session, hasFormChanged, formData, toast])

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

  try {
    return (
      <>
        <Card className='flex w-full flex-col p-6 shadow-md xl:max-w-[450px]'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
            Emergency Contact
          </h2>
          <div className='space-y-4'>
            <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
              <div className='md:col-span-4'>
                <FormInput
                  label='First Name'
                  name='first_name'
                  value={formData.first_name}
                  rules={[
                    rules.required('First name'),
                    rules.minLength(2, 'First name'),
                    rules.name()
                  ]}
                  onValueChange={handleFieldChange('first_name')}
                  placeholder='Enter first name'
                  required
                />
              </div>
              <div className='md:col-span-4'>
                <FormInput
                  label='Last Name'
                  name='last_name'
                  value={formData.last_name}
                  rules={[
                    rules.required('Last name'),
                    rules.minLength(2, 'Last name'),
                    rules.name()
                  ]}
                  onValueChange={handleFieldChange('last_name')}
                  placeholder='Enter last name'
                  required
                />
              </div>
              <div className='md:col-span-4'>
                <Select
                  value={formData.relationship}
                  onValueChange={handleFieldChange('relationship')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select relationship' />
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
              <div className='md:col-span-6'>
                <FormInput
                  label='Email'
                  name='email'
                  type='email'
                  value={formData.email || ''}
                  rules={[rules.email()]}
                  onValueChange={handleFieldChange('email')}
                  placeholder='Enter email address'
                />
              </div>
              <div className='md:col-span-6'>
                <FormInput
                  label='Phone Number'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  rules={[rules.required('Phone number'), rules.phone()]}
                  formatter='phone'
                  onValueChange={handleFieldChange('phone')}
                  placeholder='(XXX) XXX-XXXX'
                  required
                />
              </div>
            </div>

            <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
              <div className='md:col-span-6'>
                <FormInput
                  label='Street Address'
                  name='street_address'
                  value={formData.street_address || ''}
                  rules={[rules.streetAddress()]}
                  onValueChange={handleFieldChange('street_address')}
                  placeholder='Enter street address'
                />
              </div>
              <div className='md:col-span-6'>
                <FormInput
                  label='City'
                  name='city'
                  value={formData.city || ''}
                  rules={[rules.city()]}
                  onValueChange={handleFieldChange('city')}
                  placeholder='Enter city'
                />
              </div>
            </div>

            <div className='flex flex-col gap-4 md:grid md:grid-cols-12'>
              <div className='md:col-span-6'>
                <Select
                  value={formData.state || ''}
                  onValueChange={handleFieldChange('state')}
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
              <div className='md:col-span-6'>
                <FormInput
                  label='ZIP Code'
                  name='zip_code'
                  value={formData.zip_code || ''}
                  rules={[rules.zipCode()]}
                  formatter='zipCode'
                  onValueChange={handleFieldChange('zip_code')}
                  placeholder='12345'
                  maxLength={5}
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
