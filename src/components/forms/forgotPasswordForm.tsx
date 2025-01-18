'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FormInput } from '@/components/ui/form-input'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { rules } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

const logger = createLogger({
  module: 'auth',
  file: 'forgotPasswordForm.tsx'
})

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const resetLabel = `password-reset-${email}`
    logger.info('Initiating password reset process', { email }, 'handleSubmit')
    logger.time(resetLabel)

    setLoading(true)

    try {
      const supabase = createClient()

      const authLabel = 'supabase-auth-call'
      logger.time(authLabel)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      logger.timeEnd(authLabel)

      if (error) {
        logger.error(
          'Password reset request failed',
          {
            error: logger.errorWithData(error),
            email
          },
          'handleSubmit'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to send reset email',
          variant: 'destructive'
        })
        return
      }

      logger.info(
        'Password reset email sent successfully',
        { email },
        'handleSubmit'
      )
      toast({
        title: 'Success',
        description: 'Check your email for the password reset link',
        variant: 'default'
      })
    } catch (error) {
      logger.error(
        'Unexpected error during password reset request',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      logger.timeEnd(resetLabel)
    }
  }

  return (
    <Card className='mt-16 w-full max-w-md justify-center shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>Forgot Password</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='grid gap-4'>
          <FormInput
            label='Email'
            name='email'
            type='email'
            placeholder='name@example.com'
            rules={[rules.required('Email'), rules.email()]}
            onValueChange={setEmail}
            value={email}
            required
          />

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <Loader2 className='animate-spin' /> : 'Send Reset Link'}
          </Button>

          <p className='text-center text-sm'>
            Remember your password?{' '}
            <Link href='/sign-in' className='underline'>
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
