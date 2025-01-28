'use client';

import type { Application } from '@/types/application';
import type { DBUser } from '@/types/user';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { availabilityEnum, priorExperienceEnum } from '@/models/Schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface Props {
  user: DBUser
  application: Application
}

const formSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  driver_license: z.string().min(1),
  driver_license_state: z.string().length(2),
  street_address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip_code: z.string().min(5),
  prior_experience: z.enum(priorExperienceEnum.enumValues),
  availability: z.enum(availabilityEnum.enumValues),
  position: z.literal('candidate')
})

type FormValues = z.infer<typeof formSchema>

export function CompletedApplicationForm({ application, user }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      driver_license: user.driver_license || '',
      driver_license_state: user.driver_license_state || '',
      street_address: user.street_address || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
      prior_experience: application.prior_experience,
      availability: application.availability,
      position: 'candidate'
    }
  })

  return (
    <Form {...form}>
      <form className='space-y-6'>
        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            Personal Information
          </h2>
          <div className='grid gap-6'>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
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
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type='email' disabled />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type='tel' disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='driver_license'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver's License</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
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
                  <FormLabel>Driver's License State</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            Address Information
          </h2>
          <div className='grid gap-6'>
            <FormField
              control={form.control}
              name='street_address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
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
                      <Input {...field} disabled />
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
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            Additional Information
          </h2>
          <div className='grid gap-6'>
            <FormField
              control={form.control}
              name='prior_experience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prior Law Enforcement Experience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select experience level' />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='availability'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select availability' />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {application.resume && (
          <Card className='p-6'>
            <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              Resume
            </h2>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Resume submitted on{' '}
                {format(new Date(application.created_at), 'PPP')}
              </p>
              <Button variant='outline' asChild>
                <a
                  href={application.resume}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  View Resume
                </a>
              </Button>
            </div>
          </Card>
        )}
      </form>
    </Form>
  )
}
