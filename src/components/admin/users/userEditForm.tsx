'use client';

import type { DBUser, UpdateUser } from '@/types/user'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateUser } from '@/actions/user'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'userEditForm.tsx'
})

const formSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(
      /^[a-z\s\-']*$/i,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(
      /^[a-z\s\-']*$/i,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(
      /^[0-9\-+()]*$/,
      'Phone number can only contain numbers and basic punctuation'
    ),
  street_address: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address cannot exceed 100 characters')
    .regex(
      /^[a-z0-9\s\-.,#]*$/i,
      'Street address can only contain letters, numbers, spaces, and basic punctuation'
    ),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters')
    .regex(
      /^[a-z\s\-']*$/i,
      'City can only contain letters, spaces, hyphens, and apostrophes'
    ),
  state: z
    .string()
    .length(2, 'State must be a 2-letter code')
    .regex(/^[A-Z]*$/, 'State must be in uppercase letters'),
  zip_code: z
    .string()
    .length(5, 'ZIP code must be 5 digits')
    .regex(/^\d*$/, 'ZIP code can only contain numbers'),
  driver_license: z
    .string()
    .min(5, 'Driver license number must be at least 5 characters')
    .max(20, 'Driver license number cannot exceed 20 characters')
    .regex(
      /^[a-z0-9\-]*$/i,
      'Driver license number can only contain letters, numbers, and hyphens'
    ),
  driver_license_state: z
    .string()
    .length(2, 'Driver license state must be a 2-letter code')
    .regex(/^[A-Z]*$/, 'Driver license state must be in uppercase letters'),
  role: z.enum(['admin', 'member', 'guest']),
  position: z.enum([
    'candidate',
    'officer',
    'reserve',
    'admin',
    'staff',
    'dispatcher'
  ])
})

type FormValues = z.infer<typeof formSchema>

interface UserEditFormProps {
  user: DBUser
  onSuccess?: () => void
  closeDialog?: () => void
}

export function UserEditForm({
  user,
  onSuccess,
  closeDialog
}: UserEditFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      street_address: user.street_address || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
      driver_license: user.driver_license || '',
      driver_license_state: user.driver_license_state || '',
      role: user.role || 'guest',
      position: user.position || 'candidate'
    }
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const updateData: UpdateUser = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        driver_license: data.driver_license,
        driver_license_state: data.driver_license_state,
        role: data.role,
        position: data.position
      }

      const success = await updateUser(user.id, updateData)
      if (!success) {
        throw new Error('Failed to update user')
      }

      toast('User updated successfully')
      onSuccess?.()
      closeDialog?.()
      form.reset()
    } catch (error) {
      logger.error('Failed to update user', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      toast('Failed to update user', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred'
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='first_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='last_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type='tel' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='street_address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} />
                </FormControl>
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
                  <Input {...field} maxLength={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='driver_license'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver License Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='driver_license_state'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver License State</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='member'>Member</SelectItem>
                    <SelectItem value='guest'>Guest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='position'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select position' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='candidate'>Candidate</SelectItem>
                    <SelectItem value='officer'>Officer</SelectItem>
                    <SelectItem value='reserve'>Reserve</SelectItem>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='staff'>Staff</SelectItem>
                    <SelectItem value='dispatcher'>Dispatcher</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
