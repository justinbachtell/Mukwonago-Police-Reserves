'use client'

import { createPolicy, uploadPolicy } from '@/actions/policy'
import type { Policy } from '@/types/policy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import * as Sentry from '@sentry/nextjs'
import { createLogger } from '@/lib/debug'
import { toISOString } from '@/lib/utils'

const logger = createLogger({
  module: 'forms',
  file: 'PolicyForm.tsx'
})

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
  return fileType?.magicNumbers.some((magic: string) => hex.startsWith(magic)) ?? false
}

interface PolicyFormProps {
  policy?: Policy
  onSuccess?: () => void
  closeDialog: () => void
}

export function PolicyForm({
  policy,
  onSuccess,
  closeDialog
}: PolicyFormProps) {
  logger.time('policy-form-render')

  try {
    const [isPending, startTransition] = useTransition()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
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
            'Invalid file type. Please upload a PDF or Word document.'
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

        logger.info(
          'File validated successfully',
          undefined,
          'handleFileChange'
        )
        setSelectedFile(file)
      } catch (error) {
        logger.warn(
          'File validation failed',
          { error: error instanceof Error ? error.message : 'Unknown error' },
          'handleFileChange'
        )
        toast.error(error instanceof Error ? error.message : 'Invalid file')
        e.target.value = '' // Reset file input
        setSelectedFile(null)
      }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      logger.time('policy-submission')

      try {
        if (!selectedFile) {
          logger.warn('No file selected', undefined, 'handleSubmit')
          toast.error('Please select a policy file')
          return
        }

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const policyNumber = formData.get('policy_number') as string
        const policyType = formData.get('policy_type') as string
        const description = formData.get('description') as string
        const effectiveDate = formData.get('effective_date') as string

        logger.info(
          'Processing form submission',
          {
            name,
            policyNumber,
            policyType,
            hasDescription: !!description,
            effectiveDate
          },
          'handleSubmit'
        )

        if (!name || !policyNumber || !policyType || !effectiveDate) {
          logger.warn('Missing required fields', undefined, 'handleSubmit')
          toast.error('Please fill in all required fields')
          return
        }

        startTransition(async () => {
          try {
            logger.time('policy-upload')
            const fileName = await uploadPolicy(
              selectedFile,
              policyNumber,
              name
            )
            logger.timeEnd('policy-upload')

            if (!fileName) {
              throw new Error('Failed to upload policy file')
            }

            logger.info('Creating policy record', { fileName }, 'handleSubmit')
            await createPolicy({
              name,
              policy_number: policyNumber,
              policy_type: policyType,
              description: description || null,
              effective_date: toISOString(new Date(effectiveDate)),
              policy_url: fileName
            })

            logger.info(
              'Policy created successfully',
              undefined,
              'handleSubmit'
            )
            toast.success('Policy created successfully')
            router.refresh()
            onSuccess?.()
            closeDialog()
          } catch (error) {
            logger.error(
              'Policy submission failed',
              logger.errorWithData(error),
              'handleSubmit'
            )

            if (error instanceof Error) {
              if (error.message === 'Upload timeout') {
                toast.error('File upload timed out. Please try again.')
              } else {
                toast.error(`Failed to create policy: ${error.message}`)
              }

              Sentry.captureException(error, {
                extra: {
                  context: 'PolicyForm submission',
                  hasFile: true,
                  fileSize: selectedFile.size,
                  fileType: selectedFile.type
                },
                tags: {
                  action: 'policy_creation',
                  component: 'PolicyForm'
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
        logger.timeEnd('policy-submission')
      }
    }

    return (
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Policy Name</Label>
          <Input id='name' name='name' defaultValue={policy?.name} required />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='policy_number'>Policy Number</Label>
            <Input
              id='policy_number'
              name='policy_number'
              defaultValue={policy?.policy_number}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='policy_type'>Policy Type</Label>
            <Input
              id='policy_type'
              name='policy_type'
              defaultValue={policy?.policy_type}
              required
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea
            id='description'
            name='description'
            defaultValue={policy?.description || ''}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='effective_date'>Effective Date</Label>
          <Input
            id='effective_date'
            name='effective_date'
            type='date'
            defaultValue={
              policy?.effective_date
                ? new Date(policy.effective_date).toISOString().split('T')[0]
                : undefined
            }
            required
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='policy_file'>Policy Document</Label>
          <Input
            id='policy_file'
            name='policy_file'
            type='file'
            accept='.pdf,.doc,.docx'
            onChange={handleFileChange}
            required={!policy}
          />
          <p className='text-sm text-gray-500'>
            Accepted formats: PDF, DOC, DOCX (max 5MB)
          </p>
        </div>

        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending
            ? policy
              ? 'Updating...'
              : 'Creating...'
            : policy
              ? 'Update Policy'
              : 'Create Policy'}
        </Button>
      </form>
    )
  } catch (error) {
    logger.error(
      'Error rendering policy form',
      logger.errorWithData(error),
      'PolicyForm'
    )
    throw error
  } finally {
    logger.timeEnd('policy-form-render')
  }
}
