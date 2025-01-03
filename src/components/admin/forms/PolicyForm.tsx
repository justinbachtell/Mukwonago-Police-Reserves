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

interface PolicyFormProps {
  onSuccess?: () => void
}

export function PolicyForm({ onSuccess }: PolicyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Check file type
      if (
        !file.type.match(
          'application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ) {
        toast.error('Please upload a PDF or Word document')
        e.target.value = '' // Clear the input
        return
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        e.target.value = '' // Clear the input
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      if (!selectedFile) {
        toast.error('Please select a policy file')
        return
      }

      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const policyNumber = formData.get('policy_number') as string
      const policyType = formData.get('policy_type') as string
      const description = formData.get('description') as string
      const effectiveDate = formData.get('effective_date') as string

      if (!name || !policyNumber || !policyType || !effectiveDate) {
        toast.error('Please fill in all required fields')
        return
      }

      startTransition(async () => {
        try {
          // Set a timeout for the upload
          const uploadPromise = uploadPolicy(selectedFile, policyNumber, name)
          const fileName = await Promise.race([
            uploadPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Upload timeout')), 30000)
            )
          ])

          // Create the policy record
          await createPolicy({
            name,
            policy_number: policyNumber,
            policy_type: policyType,
            description: description || null,
            effective_date: new Date(effectiveDate),
            policy_url: fileName as string
          })

          toast.success('Policy created successfully')
          router.refresh()
          onSuccess?.()
        } catch (error) {
          console.error('Error in policy submission:', error)

          // Handle specific error types
          if (error instanceof Error) {
            if (error.message === 'Upload timeout') {
              toast.error('File upload timed out. Please try again.')
            } else {
              toast.error(`Failed to create policy: ${error.message}`)
            }

            // Send sanitized error to Sentry
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
      console.error('Form submission error:', error)
      toast.error('Failed to process form submission')
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
        <Input id='effective_date' name='effective_date' type='date' required />
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
}
