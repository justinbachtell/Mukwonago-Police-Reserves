'use client';

import { createApplication, uploadResume } from '@/actions/application'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type { DBUser } from '@/types/user'
import * as Sentry from '@sentry/nextjs'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'
import { updateUser } from '@/actions/user'
import { STATES } from '@/libs/States'
import { LoadingCard } from '@/components/ui/loading'
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

const logger = createLogger({
  module: 'forms',
  file: 'applicationForm.tsx'
})

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

const formSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be 10 digits'),
  driver_license: z.string().min(1, "Driver's license is required"),
  driver_license_state: z.string().min(2, "Driver's license state is required"),
  street_address: z
    .string()
    .min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State is required'),
  zip_code: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  prior_experience: z.enum([
    'none',
    'less_than_1_year',
    '1_to_3_years',
    'more_than_3_years'
  ] as const),
  availability: z.enum(['weekdays', 'weekends', 'both', 'flexible'] as const),
  position: z.enum(['candidate'] as const) // Only allow 'candidate' for new applications
})

type FormValues = z.infer<typeof formSchema>

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
      prior_experience: 'none',
      availability: 'weekdays',
      position: 'candidate'
    }
  })

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

  const onSubmit = async (data: FormValues) => {
    if (!session) {
      logger.warn(
        'Form submission attempted without auth',
        undefined,
        'handleSubmit'
      )
      toast.error('You must be logged in to submit an application')
      return
    }

    logger.info(
      'Submitting application',
      {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        position: data.position
      },
      'handleSubmit'
    )

    startTransition(async () => {
      try {
        // Upload resume if selected
        let resumePath: string | undefined
        if (selectedFile !== null) {
          logger.time('resume-upload')
          try {
            resumePath = await uploadResume(
              selectedFile,
              data.first_name,
              data.last_name
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
        }

        // Create application with optional resume path
        const result = await createApplication({
          ...data,
          user_id: user.id,
          ...(resumePath && { resume: resumePath })
        })

        if (result?.id) {
          // Update user information with the application data
          await updateUser(user.id, {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            driver_license: data.driver_license,
            driver_license_state: data.driver_license_state,
            street_address: data.street_address,
            city: data.city,
            state: data.state,
            zip_code: data.zip_code
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

        Sentry.captureException(error, {
          extra: {
            context: 'ApplicationForm submission',
            hasFile: true,
            fileSize: selectedFile?.size,
            fileType: selectedFile?.type,
            userId: user.id
          },
          tags: {
            action: 'application_submission',
            component: 'ApplicationForm'
          }
        })
      }
    })
  }

  try {
    if (isLoading) {
      return <LoadingCard />
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
                        <Input {...field} placeholder='Enter your first name' />
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
                        <Input {...field} placeholder='Enter your last name' />
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
                      <Input
                        {...field}
                        type='email'
                        placeholder='Enter your email'
                      />
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
                      <Input
                        {...field}
                        type='tel'
                        placeholder='(XXX) XXX-XXXX'
                      />
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
                      <Input
                        {...field}
                        placeholder="Enter your driver's license number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <FormLabel htmlFor='driver_license_state'>
                  Driver&apos;s License State
                </FormLabel>
                <FormControl>
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
                </FormControl>
              </div>
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
                      <Input
                        {...field}
                        placeholder='Enter your street address'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Enter your city' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <FormLabel htmlFor='state'>State</FormLabel>
                  <FormControl>
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
                  </FormControl>
                </div>
              </div>

              <FormField
                control={form.control}
                name='zip_code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Enter your ZIP code' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className='p-6'>
            <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              Resume Upload
            </h2>
            <div className='space-y-2'>
              <FormLabel htmlFor='resume'>
                Resume (Optional - PDF, Word, JPEG, or PNG - Max 5MB)
              </FormLabel>
              <FormControl>
                <Input
                  id='resume'
                  name='resume'
                  type='file'
                  accept='.pdf,.doc,.docx,.jpeg,.jpg,.png'
                  onChange={handleFileChange}
                  className='w-full'
                />
              </FormControl>
            </div>
          </Card>

          <Card className='p-6'>
            <h2 className='mb-4 text-xl font-semibold text-gray-900 dark:text-white'>
              Position Information
            </h2>
            <div className='grid gap-6'>
              <div className='hidden space-y-2'>
                <FormLabel htmlFor='position'>Position</FormLabel>
                <FormControl>
                  <Select name='position' value='candidate' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a position' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='candidate'>Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>

              <div className='space-y-2'>
                <FormLabel htmlFor='prior_experience'>
                  Prior Experience
                </FormLabel>
                <FormControl>
                  <Select name='prior_experience' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your prior experience' />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'none',
                        'less_than_1_year',
                        '1_to_3_years',
                        'more_than_3_years'
                      ].map(value => (
                        <SelectItem key={value} value={value}>
                          {value
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>

              <div className='space-y-2'>
                <FormLabel htmlFor='availability'>Availability</FormLabel>
                <FormControl>
                  <Select name='availability' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your availability' />
                    </SelectTrigger>
                    <SelectContent>
                      {['weekdays', 'weekends', 'both', 'flexible'].map(
                        value => (
                          <SelectItem key={value} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
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
      </Form>
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
