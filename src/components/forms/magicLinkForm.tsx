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
  file: 'magicLinkForm.tsx'
})

export default function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const magicLinkLabel = `magic-link-${email}`
    logger.info('Initiating magic link sign in', { email }, 'handleSubmit')
    logger.time(magicLinkLabel)

    setLoading(true)

    try {
      const supabase = createClient()

      const authLabel = 'supabase-auth-call'
      logger.time(authLabel)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      logger.timeEnd(authLabel)

      if (error) {
        logger.error(
          'Magic link request failed',
          {
            error: logger.errorWithData(error),
            email
          },
          'handleSubmit'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to send magic link',
          variant: 'destructive'
        })
        return
      }

      logger.info('Magic link sent successfully', { email }, 'handleSubmit')
      toast({
        title: 'Success',
        description: 'Check your email for the magic link',
        variant: 'default'
      })
    } catch (error) {
      logger.error(
        'Unexpected error during magic link request',
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
      logger.timeEnd(magicLinkLabel)
    }
  }

  return (
    <Card className='mt-16 w-full max-w-md justify-center shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>
          Sign In with Magic Link
        </CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter your email to receive a magic link to sign in
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
            {loading ? <Loader2 className='animate-spin' /> : 'Send Magic Link'}
          </Button>

          <div className='space-y-2 text-center text-sm'>
            <p>
              Want to use a password?{' '}
              <Link href='/sign-in' className='underline'>
                Sign in with password
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link href='/sign-up' className='underline'>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
