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
import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import type { positionsEnum } from '@/models/Schema'
import { availabilityEnum, priorExperienceEnum } from '@/models/Schema'
import type { DBUser } from '@/types/user'

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Invalid file type. Please upload a PDF, Word document, JPEG, or PNG file.'
        )
        event.target.value = ''
        return
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File is too large. Maximum size is 5MB.')
        event.target.value = ''
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Please select a resume file')
      return
    }

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        // Upload resume first
        const resumePath = await uploadResume(
          selectedFile,
          formData.get('first_name') as string,
          formData.get('last_name') as string
        )

        // Create application with resume path
        await createApplication({
          first_name: formData.get('first_name') as string,
          last_name: formData.get('last_name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          driver_license: formData.get('driver_license') as string,
          street_address: formData.get('street_address') as string,
          city: formData.get('city') as string,
          state: formData.get('state') as string,
          zip_code: formData.get('zip_code') as string,
          prior_experience: formData.get('prior_experience') as PriorExperience,
          availability: formData.get('availability') as Availability,
          position: formData.get('position') as Position,
          user_id: user.id,
          resume: resumePath
        })

        toast.success('Application submitted successfully')
        router.refresh()
      } catch (error) {
        console.error('Error submitting application:', error)
        toast.error('Failed to submit application. Please try again.')
      }
    })
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
}
