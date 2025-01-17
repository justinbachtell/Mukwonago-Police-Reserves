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
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { rules } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

const logger = createLogger({
  module: 'auth',
  file: 'resetPasswordForm.tsx'
})

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const resetLabel = 'password-reset'
    logger.info('Starting password reset', undefined, 'handleSubmit')
    logger.time(resetLabel)

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during reset', undefined, 'handleSubmit')
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      })
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
        toast({
          title: 'Error',
          description: error.message || 'Failed to reset password',
          variant: 'destructive'
        })
        return
      }

      logger.info('Password reset successful', undefined, 'handleSubmit')
      toast({
        title: 'Success',
        description: 'Password has been reset successfully',
        variant: 'default'
      })
      router.push('/sign-in')
    } catch (error) {
      logger.error(
        'Unexpected error during password reset',
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
        <CardTitle className='text-lg md:text-xl'>Reset Password</CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='grid gap-4'>
          <FormInput
            label='New Password'
            name='password'
            type='password'
            rules={[rules.password()]}
            onValueChange={setPassword}
            value={password}
            required
          />

          <FormInput
            label='Confirm New Password'
            name='confirm-password'
            type='password'
            rules={[
              rules.required('Password confirmation'),
              rules.passwordMatch(password)
            ]}
            onValueChange={setConfirmPassword}
            value={confirmPassword}
            required
          />

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <Loader2 className='animate-spin' /> : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
