'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import type { DBUser } from '@/types/user'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'
import { LoadingCard } from '@/components/ui/loading'
import { FormInput } from '@/components/ui/form-input'
import { rules } from '@/lib/validation'

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

  const handleChange = (name: keyof FormData, value: string) => {
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
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'You must be logged in to update settings'
        })
        return
      }

      // Check if anything has changed
      if (!formData.newPassword && formData.email === user.email) {
        logger.info('No changes detected', undefined, 'handleSubmit')
        toast({
          variant: 'default',
          title: 'No Changes',
          description: 'No changes to save'
        })
        return
      }

      // Validate password requirements if changing password
      if (formData.newPassword) {
        logger.info('Validating new password', undefined, 'handleSubmit')

        if (formData.newPassword.length < 8) {
          logger.warn('Password too short', undefined, 'handleSubmit')
          toast({
            variant: 'destructive',
            title: 'Invalid Password',
            description: 'New password must be at least 8 characters long'
          })
          return
        }

        if (formData.newPassword !== formData.confirmPassword) {
          logger.warn('Passwords do not match', undefined, 'handleSubmit')
          toast({
            variant: 'destructive',
            title: 'Password Mismatch',
            description: 'New passwords do not match'
          })
          return
        }

        if (!formData.currentPassword) {
          logger.warn('Current password missing', undefined, 'handleSubmit')
          toast({
            variant: 'destructive',
            title: 'Current Password Required',
            description: 'Current password is required to set a new password'
          })
          return
        }

        // Update password using Supabase
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        })

        if (passwordError) {
          logger.error(
            'Failed to update password',
            { message: passwordError.message },
            'handleSubmit'
          )
          toast({
            variant: 'destructive',
            title: 'Password Update Failed',
            description: passwordError.message || 'Failed to update password'
          })
          return
        }

        logger.info('Password updated successfully', undefined, 'handleSubmit')
        toast({
          variant: 'default',
          title: 'Success',
          description: 'Password updated successfully'
        })
      }

      // Validate email format
      if (
        formData.email &&
        formData.email !== user.email &&
        !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formData.email)
      ) {
        logger.warn('Invalid email format', undefined, 'handleSubmit')
        toast({
          variant: 'destructive',
          title: 'Invalid Email',
          description: 'Please enter a valid email address'
        })
        return
      }

      // Only update email if it has changed
      if (formData.email && formData.email !== user.email) {
        logger.info(
          'Submitting email update',
          {
            userId: user.id,
            emailChanged: true
          },
          'handleSubmit'
        )

        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })

        if (emailError) {
          logger.error(
            'Failed to update email',
            { message: emailError.message },
            'handleSubmit'
          )
          toast({
            variant: 'destructive',
            title: 'Email Update Failed',
            description: emailError.message || 'Failed to update email'
          })
          return
        }

        logger.info('Email update initiated', undefined, 'handleSubmit')
        toast({
          variant: 'default',
          title: 'Email Verification Required',
          description: 'Email verification sent. Please check your inbox.'
        })
      }

      // Clear sensitive form data
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      logger.error(
        'Error updating settings',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred'
      })
    } finally {
      setIsSaving(false)
      logger.timeEnd('settings-update')
    }
  }

  try {
    if (isLoading) {
      return <LoadingCard />
    }

    return (
      <form
        onSubmit={handleSubmit}
        className='mx-auto space-y-8 xl:max-w-[450px]'
      >
        <Card className='p-6'>
          <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
            Account Settings
          </h2>
          <div className='space-y-6'>
            <div className='space-y-2'>
              <FormInput
                label='Email Address'
                name='email'
                type='email'
                value={formData.email}
                rules={[rules.required('Email'), rules.email()]}
                onValueChange={value => handleChange('email', value)}
                required
              />
            </div>

            <div className='border-t pt-6'>
              <h3 className='mb-4 text-lg font-medium'>Change Password</h3>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <FormInput
                    label='Current Password'
                    name='currentPassword'
                    type='password'
                    value={formData.currentPassword}
                    rules={[
                      rules.required('Current password'),
                      rules.password()
                    ]}
                    onValueChange={value =>
                      handleChange('currentPassword', value)
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <FormInput
                    label='New Password'
                    name='newPassword'
                    type='password'
                    value={formData.newPassword}
                    rules={[rules.password()]}
                    onValueChange={value => handleChange('newPassword', value)}
                  />
                </div>

                <div className='space-y-2'>
                  <FormInput
                    label='Confirm New Password'
                    name='confirmPassword'
                    type='password'
                    value={formData.confirmPassword}
                    rules={[
                      rules.required('Password confirmation'),
                      rules.passwordMatch(formData.newPassword)
                    ]}
                    onValueChange={value =>
                      handleChange('confirmPassword', value)
                    }
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
