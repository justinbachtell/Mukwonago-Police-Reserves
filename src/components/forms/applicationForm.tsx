'use client';

import { createApplication, uploadResume } from '@/actions/application'
import { Button } from '@/components/ui/button'
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
import { useRouter } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { positionsEnum } from '@/models/Schema'
import { availabilityEnum, priorExperienceEnum } from '@/models/Schema'
import type { DBUser } from '@/types/user'
import * as Sentry from '@sentry/nextjs'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'applicationForm.tsx'
})

type PriorExperience = (typeof priorExperienceEnum.enumValues)[number]
type Availability = (typeof availabilityEnum.enumValues)[number]
type Position = (typeof positionsEnum.enumValues)[number]

interface Props {
  user: DBUser
}

export function ApplicationForm({ user }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  logger.time('application-form-render')

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      try {
        const {
          data: { session: currentSession }
        } = await supabase.auth.getSession()
        setSession(currentSession)
      } catch (error) {
        logger.error(
          'Failed to check auth session',
          logger.errorWithData(error),
          'checkSession'
        )
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      logger.info(
        'File selected',
        { name: file.name, type: file.type, size: file.size },
        'handleFileChange'
      )

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
      if (!allowedTypes.includes(file.type)) {
        logger.warn(
          'Invalid file type',
          { type: file.type },
          'handleFileChange'
        )
        toast.error(
          'Invalid file type. Please upload a PDF, Word document, JPEG, or PNG file.'
        )
        event.target.value = ''
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        logger.warn('File too large', { size: file.size }, 'handleFileChange')
        toast.error('File is too large. Maximum size is 5MB.')
        event.target.value = ''
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    logger.time('form-submission')

    try {
      if (!session) {
        logger.warn(
          'Form submission attempted without auth',
          undefined,
          'handleSubmit'
        )
        toast.error('You must be logged in to submit an application')
        return
      }

      if (!selectedFile) {
        logger.warn('No file selected', undefined, 'handleSubmit')
        toast.error('Please select a resume file')
        return
      }

      const formData = new FormData(e.currentTarget)

      logger.info(
        'Submitting application',
        {
          firstName: formData.get('first_name'),
          lastName: formData.get('last_name'),
          email: formData.get('email'),
          position: formData.get('position')
        },
        'handleSubmit'
      )

      startTransition(async () => {
        try {
          // Upload resume with timeout
          logger.time('resume-upload')
          const uploadPromise = uploadResume(
            selectedFile,
            formData.get('first_name') as string,
            formData.get('last_name') as string
          )
          const resumePath = await Promise.race([
            uploadPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Upload timeout')), 30000)
            )
          ])
          logger.timeEnd('resume-upload')

          logger.info(
            'Resume uploaded successfully',
            { path: resumePath },
            'handleSubmit'
          )

          // Create application with resume path
          const result = await createApplication({
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            driver_license: formData.get('driver_license') as string,
            street_address: formData.get('street_address') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            zip_code: formData.get('zip_code') as string,
            prior_experience: formData.get(
              'prior_experience'
            ) as PriorExperience,
            availability: formData.get('availability') as Availability,
            position: formData.get('position') as Position,
            user_id: user.id,
            resume: resumePath as string
          })

          logger.info(
            'Application submitted successfully',
            { applicationId: result?.id },
            'handleSubmit'
          )
          toast.success('Application submitted successfully')
          router.refresh()
        } catch (error) {
          logger.error(
            'Error submitting application',
            logger.errorWithData(error),
            'handleSubmit'
          )

          if (error instanceof Error) {
            if (error.message === 'Upload timeout') {
              toast.error('Resume upload timed out. Please try again.')
            } else {
              toast.error(`Failed to submit application: ${error.message}`)
            }

            Sentry.captureException(error, {
              extra: {
                context: 'ApplicationForm submission',
                hasFile: true,
                fileSize: selectedFile.size,
                fileType: selectedFile.type,
                userId: user.id
              },
              tags: {
                action: 'application_submission',
                component: 'ApplicationForm'
              }
            })
          } else {
            toast.error('An unexpected error occurred')
          }
        }
      })
    } catch (error) {
      logger.error(
        'Form submission error',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast.error('Failed to process form submission')
    } finally {
      logger.timeEnd('form-submission')
    }
  }

  try {
    if (isLoading) {
      return <div className='p-4 text-center'>Loading...</div>
    }

    return (
      <form onSubmit={handleSubmit} className='space-y-8'>
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
                  defaultValue={user.first_name}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='last_name'>Last Name</Label>
                <Input
                  id='last_name'
                  name='last_name'
                  placeholder='Enter your last name'
                  className='w-full'
                  defaultValue={user.last_name}
                  required
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
                defaultValue={user.email}
                required
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
                defaultValue={user.phone || ''}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='driver_license'>Driver's License</Label>
              <Input
                id='driver_license'
                name='driver_license'
                placeholder="Enter your driver's license number"
                className='w-full'
                defaultValue={user.driver_license || ''}
                required
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
                defaultValue={user.street_address || ''}
                required
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
                  defaultValue={user.city || ''}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Input
                  id='state'
                  name='state'
                  placeholder='Enter your state'
                  className='w-full'
                  defaultValue={user.state || ''}
                  required
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
                defaultValue={user.zip_code || ''}
                required
              />
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            Resume Upload
          </h2>
          <div className='space-y-2'>
            <Label htmlFor='resume'>
              Resume (PDF, Word, JPEG, or PNG - Max 5MB)
            </Label>
            <Input
              id='resume'
              name='resume'
              type='file'
              accept='.pdf,.doc,.docx,.jpeg,.jpg,.png'
              onChange={handleFileChange}
              className='w-full'
            />
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
            Position Information
          </h2>
          <div className='grid gap-6'>
            <div className='hidden space-y-2'>
              <Label htmlFor='position'>Position</Label>
              <Select name='position' defaultValue='reserve' required>
                <SelectTrigger>
                  <SelectValue placeholder='Select a position' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='reserve'>Reserve</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='prior_experience'>Prior Experience</Label>
              <Select name='prior_experience' required>
                <SelectTrigger>
                  <SelectValue placeholder='Select your prior experience' />
                </SelectTrigger>
                <SelectContent>
                  {priorExperienceEnum.enumValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {value
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='availability'>Availability</Label>
              <Select name='availability' required>
                <SelectTrigger>
                  <SelectValue placeholder='Select your availability' />
                </SelectTrigger>
                <SelectContent>
                  {availabilityEnum.enumValues.map(value => (
                    <SelectItem key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className='flex justify-end'>
          <Button
            type='submit'
            className='rounded-lg bg-blue-700 px-8 py-6 text-lg text-white hover:bg-blue-800'
            disabled={isPending}
          >
            {isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    )
  } catch (error) {
    logger.error(
      'Error rendering application form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('application-form-render')
  }
}
