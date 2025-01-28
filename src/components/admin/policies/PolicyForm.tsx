'use client'

import type { Policy } from '@/types/policy'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { createLogger } from '@/lib/debug'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'
import { policyTypeEnum } from '@/models/Schema'
import { uploadPolicyFile, createPolicyRecord } from '@/actions/policy'

const logger = createLogger({
  module: 'admin',
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
  return (
    fileType?.magicNumbers.some((magic: string) => hex.startsWith(magic)) ??
    false
  )
}

const formSchema = z.object({
  policy_name: z.string().min(2, 'Policy name must be at least 2 characters'),
  policy_number: z
    .string()
    .min(2, 'Policy number must be at least 2 characters'),
  policy_type: z.enum(policyTypeEnum.enumValues),
  description: z.string().nullable(),
  effective_date: z.string().min(1, 'Effective date is required'),
  file: z
    .custom<File>()
    .refine(file => file instanceof File, 'Please upload a file')
    .refine(
      file => file.size <= MAX_FILE_SIZE,
      'File size must be less than 5MB'
    )
    .refine(
      file => Object.keys(ALLOWED_FILE_TYPES).includes(file.type),
      'File type must be PDF, DOC, or DOCX'
    )
    .optional()
})

type FormValues = z.infer<typeof formSchema>

interface PolicyFormProps {
  policy?: Policy
  onSuccess?: (policy: Policy) => void
  closeDialog?: () => void
}

export function PolicyForm({ policy, closeDialog }: PolicyFormProps) {
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

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

    logger.info('Setting up auth state change listener', undefined, 'useEffect')
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event: string, currentSession: Session | null) => {
        logger.info(
          'Auth state changed',
          { userId: currentSession?.user?.id },
          'onAuthStateChange'
        )
        setSession(currentSession)
        setIsLoading(false)
      }
    )

    return () => {
      logger.info('Cleaning up auth state listener', undefined, 'useEffect')
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_name: policy?.name || '',
      policy_number: policy?.policy_number || '',
      policy_type: policy?.policy_type || policyTypeEnum.enumValues[0],
      description: policy?.description || '',
      effective_date:
        policy?.effective_date || new Date().toISOString().split('T')[0],
      file: undefined
    }
  })

  async function onSubmit(formData: FormValues) {
    try {
      if (!session?.user?.id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to submit the form',
          variant: 'destructive'
        })
        return
      }

      if (formData.file) {
        const isValidMagicNumbers = await checkFileMagicNumbers(formData.file)
        if (!isValidMagicNumbers) {
          toast({
            title: 'Error',
            description:
              'Invalid file format. Please upload a valid PDF, DOC, or DOCX file.',
            variant: 'destructive'
          })
          return
        }

        try {
          // Upload file using server action
          const policyUrl = await uploadPolicyFile(formData.file)

          // Create policy record using server action
          await createPolicyRecord({
            name: formData.policy_name,
            policy_type: formData.policy_type,
            description: formData.description || '',
            policy_url: policyUrl,
            policy_number: formData.policy_number,
            effective_date: formData.effective_date
          })

          toast({
            title: 'Success',
            description: 'Policy created successfully'
          })

          closeDialog?.()
        } catch (error) {
          logger.error(
            'Failed to upload policy file',
            { error: error instanceof Error ? error.message : 'Unknown error' },
            'onSubmit'
          )
          toast({
            title: 'Error',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to upload policy file',
            variant: 'destructive'
          })
        }
      } else {
        // Create policy without file
        const { error: insertError } = await supabase.from('policies').insert({
          name: formData.policy_name,
          policy_type: formData.policy_type,
          description: formData.description || '',
          policy_url: '',
          policy_number: formData.policy_number,
          effective_date: formData.effective_date
        })

        if (insertError) {
          toast({
            title: 'Error',
            description: 'Failed to create policy',
            variant: 'destructive'
          })
          return
        }

        toast({
          title: 'Success',
          description: 'Policy created successfully'
        })
      }
    } catch (error) {
      logger.error(
        'Failed to submit policy form',
        logger.errorWithData(error),
        'onSubmit'
      )
      toast({
        title: 'Error',
        description: 'Failed to submit policy form',
        variant: 'destructive'
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='policy_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='policy_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='policy_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {policyTypeEnum.enumValues.map(type => (
                    <SelectItem key={type} value={type} className='capitalize'>
                      {type.replace(/_/g, ' ')}
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='effective_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Effective Date</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='file'
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Policy File</FormLabel>
              <FormControl>
                <Input
                  type='file'
                  accept='.pdf,.doc,.docx'
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onChange(file)
                    }
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isLoading}>
          {policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </form>
    </Form>
  )
}
