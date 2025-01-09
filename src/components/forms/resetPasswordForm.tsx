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
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'resetPasswordForm.tsx'
})

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const resetLabel = 'password-reset'
    logger.info('Starting password reset', undefined, 'handleSubmit')
    logger.time(resetLabel)

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during reset', undefined, 'handleSubmit')
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const authLabel = 'supabase-auth-call'
      logger.time(authLabel)
      const { error } = await supabase.auth.updateUser({
        password
      })
      logger.timeEnd(authLabel)

      if (error) {
        logger.error(
          'Password reset failed',
          {
            error: logger.errorWithData(error)
          },
          'handleSubmit'
        )
        toast.error(error.message || 'Failed to reset password')
        return
      }

      logger.info('Password reset successful', undefined, 'handleSubmit')
      toast.success('Password has been reset successfully')
      router.push('/sign-in')
    } catch (error) {
      logger.error(
        'Unexpected error during password reset',
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
        <CardTitle className='text-lg md:text-xl'>Reset Password</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='password'>New Password</Label>
            <Input
              id='password'
              type='password'
              required
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='confirm-password'>Confirm New Password</Label>
            <Input
              id='confirm-password'
              type='password'
              required
              onChange={e => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            />
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <Loader2 className='animate-spin' /> : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
