'use client';

import type { AssignedEquipment } from '@/types/assignedEquipment';
import type { EmergencyContact } from '@/types/emergencyContact'
import type { UniformSizes } from '@/types/uniformSizes'
import type { DBUser } from '@/types/user'
import { updateUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
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
import { useEffect, useRef, useState } from 'react'
import { AssignedEquipmentForm } from './assignedEquipmentForm'
import { EmergencyContactForm } from './emergencyContactForm'
import { UniformSizesForm } from './uniformSizesForm'
import { createLogger } from '@/lib/debug'
import type { Session } from '@supabase/supabase-js'
import { useForm } from 'react-hook-form'
import { LoadingCard } from '@/components/ui/loading'
import { FormInput } from '@/components/ui/form-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
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

const formSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be 10 digits'),
  street_address: z
    .string()
    .min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  driver_license: z.string().optional(),
  driver_license_state: z.string().optional(),
  callsign: z.string().optional().nullable(),
  radio_number: z.string().optional().nullable()
})

type FormValues = z.infer<typeof formSchema>

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialUser.first_name || '',
      last_name: initialUser.last_name || '',
      phone: initialUser.phone || '',
      street_address: initialUser.street_address || '',
      city: initialUser.city || '',
      state: initialUser.state || '',
      zip_code: initialUser.zip_code || '',
      driver_license: initialUser.driver_license || '',
      driver_license_state: initialUser.driver_license_state || '',
      callsign: initialUser.callsign || '',
      radio_number: initialUser.radio_number || ''
    }
  })

  // Create refs for child form save functions
  const uniformSizesSaveRef = useRef<(() => Promise<any>) | null>(null)
  const emergencyContactSaveRef = useRef<(() => Promise<any>) | null>(null)
  const assignedEquipmentSaveRef = useRef<(() => Promise<any>) | null>(null)

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      setSession(session)
      setIsLoading(false)
    }
    checkSession()
  }, [supabase.auth])

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true)

      if (!session?.user) {
        toast({
          description: 'Not authenticated',
          title: 'Error',
          variant: 'destructive'
        })
        return
      }

      const isAdmin = session.user.user_metadata?.role === 'admin'

      const baseUpdateData = {
        first_name: values.first_name || '',
        last_name: values.last_name || '',
        phone: values.phone || '',
        street_address: values.street_address || '',
        city: values.city || '',
        state: values.state || '',
        zip_code: values.zip_code || '',
        driver_license: values.driver_license || '',
        driver_license_state: values.driver_license_state || '',
        status: 'active' as const,
        callsign: isAdmin ? values.callsign || null : initialUser.callsign,
        radio_number: isAdmin
          ? values.radio_number || null
          : initialUser.radio_number
      }

      await updateUser(initialUser.id, baseUpdateData)

      // Save child forms
      const [uniformResult, emergencyResult, equipmentResult] =
        await Promise.all([
          uniformSizesSaveRef.current?.() ?? Promise.resolve({ success: true }),
          emergencyContactSaveRef.current?.() ??
            Promise.resolve({ success: true }),
          assignedEquipmentSaveRef.current?.() ??
            Promise.resolve({ success: true })
        ])

      if (
        uniformResult?.success &&
        emergencyResult?.success &&
        equipmentResult?.success
      ) {
        toast({
          description: 'Your profile has been updated.',
          title: 'Success'
        })
      } else {
        throw new Error('Failed to save all changes')
      }
    } catch (error) {
      logger.error(
        'Failed to update profile',
        {
          error:
            error instanceof Error
              ? error
              : new Error('Failed to update profile')
        },
        'onSubmit'
      )
      toast({
        description: 'Failed to update profile',
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mx-auto max-w-5xl space-y-6 py-10'
      >
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
                  <FormField
                    control={form.control}
                    name='first_name'
                    render={({ field }) => (
                      <FormInput
                        label='First Name'
                        name='first_name'
                        type='text'
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='last_name'
                    render={({ field }) => (
                      <FormInput
                        label='Last Name'
                        name='last_name'
                        type='text'
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormInput
                        label='Phone Number'
                        name='phone'
                        type='tel'
                        value={field.value}
                        rules={[rules.required('Phone number'), rules.phone()]}
                        formatter='phone'
                        onValueChange={field.onChange}
                        placeholder='(XXX) XXX-XXXX'
                        required
                      />
                    )}
                  />
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='driver_license'
                    render={({ field }) => (
                      <FormInput
                        label="Driver's License Number"
                        name='driver_license'
                        type='text'
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='driver_license_state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Driver's License State</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='callsign'
                    render={({ field }) => (
                      <FormInput
                        label='Callsign'
                        name='callsign'
                        type='text'
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        disabled={
                          session?.user?.user_metadata?.role !== 'admin'
                        }
                        className={
                          session?.user?.user_metadata?.role !== 'admin'
                            ? 'bg-muted'
                            : ''
                        }
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='radio_number'
                    render={({ field }) => (
                      <FormInput
                        label='Radio Number'
                        name='radio_number'
                        type='text'
                        value={field.value || ''}
                        onValueChange={field.onChange}
                        disabled={
                          session?.user?.user_metadata?.role !== 'admin'
                        }
                        className={
                          session?.user?.user_metadata?.role !== 'admin'
                            ? 'bg-muted'
                            : ''
                        }
                      />
                    )}
                  />
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
                <FormField
                  control={form.control}
                  name='street_address'
                  render={({ field }) => (
                    <FormInput
                      label='Street Address'
                      name='street_address'
                      type='text'
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormInput
                      label='City'
                      name='city'
                      type='text'
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />

                <div className='grid gap-6 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='state'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='zip_code'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='12345' maxLength={5} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Uniform Sizes */}
          <UniformSizesForm
            user={initialUser}
            currentSizes={initialSizes}
            saveRef={uniformSizesSaveRef}
          />

          {/* Emergency Contact */}
          <EmergencyContactForm
            user={initialUser}
            currentContact={currentEmergencyContact}
            saveRef={emergencyContactSaveRef}
          />

          {/* Equipment */}
          {currentEquipment && (
            <AssignedEquipmentForm
              user={initialUser}
              saveRef={assignedEquipmentSaveRef}
            />
          )}
        </div>

        {/* Save Button */}
        <div className='mx-auto flex max-w-5xl justify-end'>
          <Button
            type='submit'
            size='lg'
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
