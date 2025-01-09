'use client'

import { createPolicy, uploadPolicy } from '@/actions/policy'
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

interface PolicyFormProps {
  onSuccess?: () => void
}

export function PolicyForm({ onSuccess }: PolicyFormProps) {
  logger.time('policy-form-render')

  try {
    const [isPending, startTransition] = useTransition()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      logger.debug('File input change detected', undefined, 'handleFileChange')

      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        logger.info(
          'Processing file selection',
          { fileName: file.name, fileSize: file.size, fileType: file.type },
          'handleFileChange'
        )

        // Check file type
        if (
          !file.type.match(
            'application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          )
        ) {
          logger.warn(
            'Invalid file type',
            { fileType: file.type },
            'handleFileChange'
          )
          toast.error('Please upload a PDF or Word document')
          e.target.value = ''
          return
        }

        // Check file size
        if (file.size > 5 * 1024 * 1024) {
          logger.warn(
            'File too large',
            { fileSize: file.size },
            'handleFileChange'
          )
          toast.error('File size should be less than 5MB')
          e.target.value = ''
          return
        }

        logger.info(
          'File validated successfully',
          undefined,
          'handleFileChange'
        )
        setSelectedFile(file)
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
          <Input id='name' name='name' required />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='policy_number'>Policy Number</Label>
            <Input id='policy_number' name='policy_number' required />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='policy_type'>Policy Type</Label>
            <Input id='policy_type' name='policy_type' required />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea id='description' name='description' />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='effective_date'>Effective Date</Label>
          <Input
            id='effective_date'
            name='effective_date'
            type='date'
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
            required
          />
          <p className='text-sm text-gray-500'>
            Accepted formats: PDF, DOC, DOCX (max 5MB)
          </p>
        </div>

        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending ? 'Creating...' : 'Create Policy'}
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
