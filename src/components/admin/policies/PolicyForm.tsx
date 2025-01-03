'use client'

import { createPolicy, uploadPolicy } from '@/actions/policy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { toast } from 'sonner'

export function PolicyForm() {
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

    startTransition(async () => {
      try {
        // Upload the policy file first
        const fileName = await uploadPolicy(selectedFile, policyNumber, name)

        // Create the policy record
        await createPolicy({
          name,
          policy_number: policyNumber,
          policy_type: policyType,
          description,
          effective_date: new Date(effectiveDate),
          policy_url: fileName
        })

        toast.success('Policy created successfully')
        router.refresh()
      } catch (error) {
        console.error('Error creating policy:', error)
        toast.error('Failed to create policy')
      }
    })
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
      </div>

      <Button type='submit' disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Policy'}
      </Button>
    </form>
  )
}
