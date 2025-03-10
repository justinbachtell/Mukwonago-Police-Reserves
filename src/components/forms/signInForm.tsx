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
import { Label } from '@/components/ui/label'
import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import type { Route } from 'next'
import { FormInput } from '@/components/ui/form-input'
import { rules } from '@/lib/validation'

const logger = createLogger({
  module: 'auth',
  file: 'signInForm.tsx'
})

type FormErrors = {
  email?: string
  password?: string
}

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const captcha = useRef<HCaptcha | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      logger.info('Attempting authentication', {
        email,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasPassword: !!password,
        hasCaptcha: !!captchaToken
      })

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: captchaToken || undefined
        }
      })

      if (error) {
        logger.error('Authentication error', {
          error: logger.errorWithData(error),
          statusCode: error.status,
          message: error.message,
          name: error.name,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          email
        })
        throw error
      }

      // Success handling
      logger.info('Authentication successful', { email })
      toast({
        title: 'Success',
        description: 'Successfully signed in!'
      })
      router.push('/user/dashboard')
    } catch (error: any) {
      logger.error('Sign-in error', {
        error: logger.errorWithData(error),
        type: typeof error,
        name: error?.name,
        message: error?.message,
        status: error?.status,
        response: error?.response?.data
      })

      // Show a more specific error message
      let errorMessage = 'Failed to sign in. Please try again.'

      if (error?.message?.includes('<!DOCTYPE')) {
        errorMessage =
          'Authentication service is temporarily unavailable. Please try again later.'
      } else if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error?.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in.'
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      if (captcha.current) {
        captcha.current.resetCaptcha()
      }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient()
      const redirectURL = `${window.location.origin}/auth/callback?next=/user/dashboard`

      logger.info('Starting Google OAuth', {
        redirectURL,
        origin: window.location.origin
      })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        logger.error(
          'Google OAuth failed',
          {
            error: logger.errorWithData(error),
            redirectUrl: redirectURL,
            origin: window.location.origin
          },
          'handleGoogleSignIn'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign in with Google',
          variant: 'destructive'
        })
        return
      }

      if (!data?.url) {
        logger.error(
          'No OAuth URL returned',
          {
            data,
            redirectUrl: redirectURL
          },
          'handleGoogleSignIn'
        )
        toast({
          title: 'Error',
          description: 'Failed to initiate Google sign in',
          variant: 'destructive'
        })
        return
      }

      // Success case is handled by the redirect
      logger.info(
        'Redirecting to Google OAuth...',
        {
          redirectUrl: data.url,
          originalRedirect: redirectURL
        },
        'handleGoogleSignIn'
      )

      // Manually redirect to ensure it happens
      window.location.href = data.url
    } catch (error) {
      logger.error(
        'Unexpected error during Google OAuth',
        logger.errorWithData(error),
        'handleGoogleSignIn'
      )
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      const supabase = createClient()
      const redirectURL = `${window.location.origin}/auth/callback?next=/user/dashboard`

      logger.info('Starting Microsoft OAuth', {
        redirectURL,
        origin: window.location.origin
      })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: redirectURL,
          scopes: 'email profile openid User.Read'
        }
      })

      if (error) {
        logger.error(
          'Microsoft OAuth failed',
          {
            error: logger.errorWithData(error),
            redirectUrl: redirectURL,
            origin: window.location.origin
          },
          'handleMicrosoftSignIn'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign in with Microsoft',
          variant: 'destructive'
        })
        return
      }

      if (!data?.url) {
        logger.error(
          'No OAuth URL returned',
          {
            data,
            redirectUrl: redirectURL
          },
          'handleMicrosoftSignIn'
        )
        toast({
          title: 'Error',
          description: 'Failed to initiate Microsoft sign in',
          variant: 'destructive'
        })
        return
      }

      // Success case is handled by the redirect
      logger.info(
        'Redirecting to Microsoft OAuth...',
        {
          redirectUrl: data.url,
          originalRedirect: redirectURL
        },
        'handleMicrosoftSignIn'
      )

      // Manually redirect to ensure it happens
      window.location.href = data.url
    } catch (error) {
      logger.error(
        'Unexpected error during Microsoft OAuth',
        logger.errorWithData(error),
        'handleMicrosoftSignIn'
      )
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className='max-h-[90vh] w-full max-w-md overflow-y-auto shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
      <CardHeader className='space-y-2 pb-4'>
        <CardTitle className='text-center text-xl font-bold'>
          Welcome Back
        </CardTitle>
        <CardDescription className='text-center text-sm'>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-3'>
            <div className='space-y-2'>
              <FormInput
                label='Email Address'
                name='email'
                type='email'
                placeholder='name@example.com'
                required
                rules={[rules.required('Email'), rules.email()]}
                onValueChange={value => {
                  setEmail(value)
                  setErrors(prev => ({ ...prev, email: undefined }))
                }}
                value={email}
                error={errors.email}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Password
                </Label>
                <Link
                  href={'/forgot-password' as Route}
                  className='text-sm font-medium text-primary hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
              <FormInput
                label=''
                name='password'
                type='password'
                placeholder='••••••••'
                required
                rules={[rules.required('Password'), rules.password()]}
                onValueChange={value => {
                  setPassword(value)
                  setErrors(prev => ({ ...prev, password: undefined }))
                }}
                value={password}
                error={errors.password}
              />
            </div>
          </div>

          <div className='mx-auto my-2 flex w-full items-center justify-center'>
            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={token => {
                setCaptchaToken(token)
              }}
            />
          </div>

          <div className='space-y-3'>
            <Button
              type='submit'
              className='w-full py-4'
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
              className='w-full py-4'
              size='lg'
              onClick={() => router.push('/magic-link')}
            >
              Passwordless Magic Link
            </Button>

            <div className='flex flex-col space-y-3'>
              <Button
                type='button'
                variant='outline'
                className='w-full py-4'
                size='lg'
                onClick={handleGoogleSignIn}
              >
                <svg
                  className='mr-2 size-4'
                  aria-hidden='true'
                  focusable='false'
                  data-prefix='fab'
                  data-icon='google'
                  role='img'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 488 512'
                >
                  <path
                    fill='currentColor'
                    d='M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z'
                  ></path>
                </svg>
                Continue with Google
              </Button>

              <Button
                type='button'
                variant='outline'
                className='w-full py-4'
                size='lg'
                onClick={handleMicrosoftSignIn}
              >
                <svg
                  className='mr-2 size-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 23 23'
                >
                  <path
                    fill='currentColor'
                    d='M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z'
                  />
                </svg>
                Continue with Microsoft
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-2 border-t p-4'>
        <p className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link
            href={'/sign-up' as Route}
            className='font-medium text-primary hover:underline'
          >
            Create account
          </Link>
        </p>
        <p className='text-xs text-muted-foreground'>
          By continuing, you agree to our{' '}
          <Link
            href={'/terms' as Route}
            className='font-medium text-primary hover:underline'
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href={'/privacy' as Route}
            className='font-medium text-primary hover:underline'
          >
            Privacy Policy
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
