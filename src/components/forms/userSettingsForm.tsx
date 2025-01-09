'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { DBUser } from '@/types/user'
import { updateUserSettings } from '@/actions/user'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'userSettingsForm.tsx'
})

interface UserSettingsFormProps {
  user: DBUser
}

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  email: string
}

export function UserSettingsForm({ user }: UserSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  logger.time('user-settings-form-render')

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
  }, [supabase.auth])

  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: user.email || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    logger.debug(
      'Form field changed',
      { field: name, hasValue: !!value },
      'handleChange'
    )
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    logger.time('settings-update')
    setIsSaving(true)

    try {
      if (!session) {
        logger.warn(
          'Form submission attempted without auth',
          undefined,
          'handleSubmit'
        )
        toast.error('You must be logged in to update settings')
        return
      }

      // Validate password requirements if changing password
      if (formData.newPassword) {
        logger.info('Validating new password', undefined, 'handleSubmit')

        if (formData.newPassword.length < 8) {
          logger.warn('Password too short', undefined, 'handleSubmit')
          toast.error('New password must be at least 8 characters long')
          return
        }

        if (formData.newPassword !== formData.confirmPassword) {
          logger.warn('Passwords do not match', undefined, 'handleSubmit')
          toast.error('New passwords do not match')
          return
        }

        if (!formData.currentPassword) {
          logger.warn('Current password missing', undefined, 'handleSubmit')
          toast.error('Current password is required to set a new password')
          return
        }
      }

      // Validate email format
      if (
        formData.email &&
        !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formData.email)
      ) {
        logger.warn('Invalid email format', undefined, 'handleSubmit')
        toast.error('Please enter a valid email address')
        return
      }

      logger.info(
        'Submitting settings update',
        {
          userId: user.id,
          hasPasswordChange: !!formData.newPassword,
          emailChanged: formData.email !== user.email
        },
        'handleSubmit'
      )

      const updateData = {
        email: formData.email,
        ...(formData.newPassword && {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      }

      const result = await updateUserSettings(user.id, updateData)

      if (result.success) {
        logger.info('Settings updated successfully', undefined, 'handleSubmit')
        toast.success('Settings updated successfully')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        logger.error(
          'Failed to update settings',
          { message: result.message },
          'handleSubmit'
        )
        toast.error(result.message || 'Failed to update settings')
      }
    } catch (error) {
      logger.error(
        'Error updating settings',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
      logger.timeEnd('settings-update')
    }
  }

  try {
    if (isLoading) {
      return <div className='p-4 text-center'>Loading...</div>
    }

    return (
      <form onSubmit={handleSubmit} className='space-y-8'>
        <Card className='p-6'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
            Account Settings
          </h2>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full'
                required
              />
            </div>

            <div className='border-t pt-6'>
              <h3 className='mb-4 text-lg font-medium'>Change Password</h3>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='currentPassword'>Current Password</Label>
                  <Input
                    id='currentPassword'
                    name='currentPassword'
                    type='password'
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className='w-full'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>New Password</Label>
                  <Input
                    id='newPassword'
                    name='newPassword'
                    type='password'
                    value={formData.newPassword}
                    onChange={handleChange}
                    className='w-full'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                  <Input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='w-full'
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className='flex justify-end'>
          <Button
            type='submit'
            className='rounded-lg bg-blue-700 px-8 py-2 text-white shadow-md hover:bg-blue-800 md:max-w-fit'
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    )
  } catch (error) {
    logger.error(
      'Error rendering settings form',
      logger.errorWithData(error),
      'render'
    )
    throw error
  } finally {
    logger.timeEnd('user-settings-form-render')
  }
}
