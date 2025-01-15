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
import { useRef, useState } from 'react'
import { Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Factor } from '@supabase/supabase-js'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import type { Route } from 'next'

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
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const captcha = useRef<HCaptcha | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const signInLabel = 'sign-in-attempt'
    logger.time(signInLabel)

    try {
      // Validate form
      const validationErrors: FormErrors = {}

      logger.info(
        'Starting sign-in process',
        {
          email,
          hasCaptchaToken: !!captchaToken,
          hasValidationErrors: Object.keys(validationErrors).length > 0
        },
        'handleSubmit'
      )

      if (!email) {
        validationErrors.email = 'Email is required'
      }
      if (!password) {
        validationErrors.password = 'Password is required'
      }

      if (Object.keys(validationErrors).length > 0) {
        logger.warn(
          'Sign-in validation failed',
          { validationErrors },
          'handleSubmit'
        )
        setErrors(validationErrors)
        setLoading(false)
        return
      }

      // Validate captcha
      if (!captchaToken) {
        logger.warn('Missing captcha token', undefined, 'handleSubmit')
        toast({
          title: 'Error',
          description: 'Please complete the captcha verification',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Log auth attempt
      logger.info(
        'Attempting Supabase authentication',
        {
          email,
          hasCaptchaToken: !!captchaToken
        },
        'handleSubmit'
      )

      const authStartTime = Date.now()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken
        }
      })

      // Log auth response time
      logger.info(
        'Auth response received',
        {
          responseTime: Date.now() - authStartTime,
          hasError: !!error,
          hasData: !!data
        },
        'handleSubmit'
      )

      if (error) {
        logger.error(
          'Authentication failed',
          {
            error: logger.errorWithData(error),
            email,
            message: error.message,
            status: error.status,
            rawError: JSON.stringify(error),
            errorName: error.name,
            errorStack: error.stack
          },
          'handleSubmit'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign in',
          variant: 'destructive'
        })
        return
      }

      if (!data?.user) {
        logger.warn(
          'No user data returned after successful auth',
          { email },
          'handleSubmit'
        )
        toast({
          title: 'Error',
          description: 'Failed to sign in',
          variant: 'destructive'
        })
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
        toast({
          title: 'Error',
          description: 'Failed to check MFA status',
          variant: 'destructive'
        })
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

      // Show success toast
      toast({
        title: 'Success',
        description: 'Successfully signed in'
      })

      // Refresh to ensure server state is updated
      router.refresh()
      router.push('/user/dashboard')
    } catch (error: any) {
      logger.error(
        'Unexpected error during authentication',
        {
          error: logger.errorWithData(error),
          errorType: typeof error,
          errorName: error?.name,
          errorMessage: error?.message,
          errorStack: error?.stack,
          isAxiosError: error?.isAxiosError,
          responseData: error?.response?.data,
          responseStatus: error?.response?.status,
          responseHeaders: error?.response?.headers,
          requestUrl: error?.config?.url,
          requestMethod: error?.config?.method
        },
        'handleSubmit'
      )
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      if (captcha.current) {
        captcha.current.resetCaptcha()
      }

      setLoading(false)
      logger.timeEnd(signInLabel)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
            redirectUrl: window.location.origin
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

      // Success case is handled by the redirect
      logger.info('Redirecting to Google OAuth...', {}, 'handleGoogleSignIn')
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email'
        }
      })

      if (error) {
        logger.error(
          'Microsoft OAuth failed',
          {
            error: logger.errorWithData(error),
            redirectUrl: window.location.origin
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

      // Success case is handled by the redirect
      logger.info(
        'Redirecting to Microsoft OAuth...',
        {},
        'handleMicrosoftSignIn'
      )
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
    <Card className='w-full max-w-md justify-center shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
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
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  onChange={e => {
                    setEmail(e.target.value)
                    setErrors(prev => ({ ...prev, email: undefined }))
                  }}
                  value={email}
                />
                {errors.email && (
                  <p className='mt-1 text-xs text-red-500'>{errors.email}</p>
                )}
              </div>
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
              <div className='relative'>
                <Lock className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  required
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }}
                />
                {errors.password && (
                  <p className='mt-1 text-xs text-red-500'>{errors.password}</p>
                )}
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

          <div className='mx-auto flex w-full items-center justify-center'>
            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={token => {
                setCaptchaToken(token)
              }}
            />
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

            <div className='flex flex-col space-y-4'>
              <Button
                type='button'
                variant='outline'
                className='w-full py-6'
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
                className='w-full py-6'
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
      <CardFooter className='flex justify-center border-t p-6'>
        <p className='text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link
            href={'/sign-up' as Route}
            className='font-medium text-primary hover:underline'
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
