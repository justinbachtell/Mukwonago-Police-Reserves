'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Factor } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'auth',
  file: 'signInForm.tsx'
})

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const signInLabel = `sign-in-${email}`
    logger.info('Initiating sign in process', { email }, 'handleSubmit')
    logger.time(signInLabel)

    setLoading(true)

    try {
      const supabase = createClient()

      const authLabel = 'supabase-auth-call'
      logger.time(authLabel)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      logger.timeEnd(authLabel)

      if (error) {
        logger.error(
          'Authentication failed',
          {
            error: logger.errorWithData(error),
            email
          },
          'handleSubmit'
        )
        toast.error(error.message || 'Failed to sign in')
        return
      }

      if (!data?.user) {
        logger.warn(
          'No user data returned after successful auth',
          { email },
          'handleSubmit'
        )
        toast.error('Failed to sign in')
        return
      }

      // Check if MFA is required
      const { data: mfaData, error: factorsError } =
        await supabase.auth.mfa.listFactors()

      if (factorsError) {
        logger.error(
          'Failed to get MFA factors',
          {
            error: logger.errorWithData(factorsError),
            userId: data.user.id
          },
          'handleSubmit'
        )
        toast.error('Failed to check MFA status')
        return
      }

      // If there are verified factors, redirect to MFA verification
      const verifiedFactors = mfaData.totp.filter(
        (factor: Factor) => factor.status === 'verified'
      )
      const firstFactor = verifiedFactors[0]
      if (firstFactor?.id) {
        logger.info(
          'MFA required, redirecting to verification',
          {
            userId: data.user.id,
            factorId: firstFactor.id
          },
          'handleSubmit'
        )
        router.push(`/verify-mfa?factorId=${firstFactor.id}`)
        return
      }

      logger.info(
        'Authentication successful',
        {
          userId: data.user.id,
          email: data.user.email
        },
        'handleSubmit'
      )

      // Refresh to ensure server state is updated
      router.refresh()
      router.push('/user/dashboard')
    } catch (error) {
      logger.error(
        'Unexpected error during authentication',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
      logger.timeEnd(signInLabel)
    }
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='space-y-3 pb-8'>
        <CardTitle className='text-center text-2xl font-bold'>
          Welcome Back
        </CardTitle>
        <CardDescription className='text-center text-sm'>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='name@example.com'
                  required
                  className='pl-10'
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Password
                </Label>
                <Link
                  href='/forgot-password'
                  className='text-sm font-medium text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <div className='relative'>
                <Lock className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  required
                  className='pl-10'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='remember'
                checked={rememberMe}
                onCheckedChange={checked => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor='remember'
                className='text-sm text-muted-foreground'
              >
                Remember me
              </Label>
            </div>
          </div>

          <div className='space-y-4'>
            <Button
              type='submit'
              className='w-full py-6'
              size='lg'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type='button'
              variant='outline'
              className='w-full py-6'
              size='lg'
              onClick={() => router.push('/magic-link')}
            >
              Passwordless Magic Link
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center border-t p-6'>
        <p className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link
            href='/sign-up'
            className='font-medium text-primary hover:underline'
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
