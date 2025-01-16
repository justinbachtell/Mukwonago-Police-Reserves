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
import { updateUser } from '@/actions/user'
import { STATES } from '@/libs/States'

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

// File validation types and constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

type FileType = keyof typeof ALLOWED_FILE_TYPES

interface FileTypeInfo {
  magicNumbers: readonly string[]
  extension: string | readonly string[]
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': {
    magicNumbers: ['25504446'] as const, // %PDF
    extension: '.pdf'
  },
  'application/msword': {
    magicNumbers: ['D0CF11E0'] as const, // DOC
    extension: '.doc'
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    magicNumbers: ['504B0304'] as const, // DOCX (ZIP)
    extension: '.docx'
  },
  'image/jpeg': {
    magicNumbers: ['FFD8FF'] as const, // JPEG
    extension: ['.jpg', '.jpeg'] as const
  },
  'image/png': {
    magicNumbers: ['89504E47'] as const, // PNG
    extension: '.png'
  }
} as const satisfies Record<string, FileTypeInfo>

// Function to check file's magic numbers
async function checkFileMagicNumbers(file: File): Promise<boolean> {
  const arr = new Uint8Array(await file.slice(0, 4).arrayBuffer())
  const hex = Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  const fileType = ALLOWED_FILE_TYPES[file.type as FileType]
  return (
    fileType?.magicNumbers.some((magic: string) => hex.startsWith(magic)) ??
    false
  )
}

export function ApplicationForm({ user }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [selectedState, setSelectedState] = useState(user.state || '')
  const [selectedLicenseState, setSelectedLicenseState] = useState(
    user.driver_license_state || ''
  )
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    logger.info(
      'File selected',
      { name: file.name, type: file.type, size: file.size },
      'handleFileChange'
    )

    try {
      // 1. Validate file type
      if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
        throw new Error(
          'Invalid file type. Please upload a PDF, Word document, JPEG, or PNG file.'
        )
      }

      // 2. Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File is too large. Maximum size is 5MB.')
      }

      // 3. Validate file content (magic numbers)
      const isValidContent = await checkFileMagicNumbers(file)
      if (!isValidContent) {
        throw new Error(
          'Invalid file content. The file appears to be different from its extension.'
        )
      }

      // 4. Validate file extension matches content type
      const extension = file.name.toLowerCase().split('.').pop()
      const fileTypeInfo = ALLOWED_FILE_TYPES[file.type as FileType]
      const allowedExtensions = Array.isArray(fileTypeInfo.extension)
        ? fileTypeInfo.extension
        : [fileTypeInfo.extension]

      if (!extension || !allowedExtensions.includes(`.${extension}` as any)) {
        throw new Error(
          `Invalid file extension. Expected one of: ${allowedExtensions.join(', ')}`
        )
      }

      setSelectedFile(file)
    } catch (error) {
      logger.warn(
        'File validation failed',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'handleFileChange'
      )
      toast.error(error instanceof Error ? error.message : 'Invalid file')
      event.target.value = '' // Reset file input
      setSelectedFile(null)
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
          // Upload resume
          logger.time('resume-upload')
          let resumePath: string | undefined
          try {
            resumePath = await uploadResume(
              selectedFile,
              formData.get('first_name') as string,
              formData.get('last_name') as string
            )
            logger.timeEnd('resume-upload')
            logger.info(
              'Resume uploaded successfully',
              { path: resumePath },
              'handleSubmit'
            )
          } catch (uploadError) {
            logger.error(
              'Resume upload failed',
              logger.errorWithData(uploadError),
              'handleSubmit'
            )
            throw new Error(
              uploadError instanceof Error
                ? uploadError.message
                : 'Failed to upload resume'
            )
          }

          if (!resumePath) {
            throw new Error('No resume path returned from upload')
          }

          // Create application with resume path
          const result = await createApplication({
            first_name: formData.get('first_name') as string,
            last_name: formData.get('last_name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            driver_license: formData.get('driver_license') as string,
            driver_license_state: formData.get(
              'driver_license_state'
            ) as string,
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
            resume: resumePath
          })

          if (result?.id) {
            // Update user information with the application data
            await updateUser(user.id, {
              first_name: formData.get('first_name') as string,
              last_name: formData.get('last_name') as string,
              email: formData.get('email') as string,
              phone: formData.get('phone') as string,
              driver_license: formData.get('driver_license') as string,
              driver_license_state: formData.get(
                'driver_license_state'
              ) as string,
              street_address: formData.get('street_address') as string,
              city: formData.get('city') as string,
              state: formData.get('state') as string,
              zip_code: formData.get('zip_code') as string
            })

            logger.info(
              'User information updated with application data',
              { userId: user.id },
              'handleSubmit'
            )
          }

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
            {
              message: error instanceof Error ? error.message : 'Unknown error'
            },
            'handleSubmit'
          )

          if (error instanceof Error) {
            toast.error(`Failed to submit application: ${error.message}`)
          } else {
            toast.error('An unexpected error occurred')
          }

          // Only send non-binary data to Sentry
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
        }
      })
    } catch (error) {
      logger.error(
        'Form submission error',
        { message: error instanceof Error ? error.message : 'Unknown error' },
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
              <Label htmlFor='driver_license'>Driver&apos;s License</Label>
              <Input
                id='driver_license'
                name='driver_license'
                placeholder="Enter your driver's license number"
                className='w-full'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='driver_license_state'>
                Driver&apos;s License State
              </Label>
              <Select
                name='driver_license_state'
                value={selectedLicenseState}
                onValueChange={setSelectedLicenseState}
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
                <Select
                  name='state'
                  value={selectedState}
                  onValueChange={setSelectedState}
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
              <Select name='position' defaultValue='candidate' required>
                <SelectTrigger>
                  <SelectValue placeholder='Select a position' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='candidate'>Candidate</SelectItem>
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
