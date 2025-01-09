'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'forgotPasswordForm.tsx'
})

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

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
        toast.error(error.message || 'Failed to send reset email')
        return
      }

      logger.info(
        'Password reset email sent successfully',
        { email },
        'handleSubmit'
      )
      toast.success('Check your email for the password reset link')
    } catch (error) {
      logger.error(
        'Unexpected error during password reset request',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
      logger.timeEnd(resetLabel)
    }
  }

  return (
    <Card className='max-w-md'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>Forgot Password</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='name@example.com'
              required
              onChange={e => setEmail(e.target.value)}
              value={email}
            />
          </div>

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
