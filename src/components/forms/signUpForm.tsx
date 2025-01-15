'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import { Loader2, Mail, User, Lock, KeyRound } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import type { Route } from 'next'

const logger = createLogger({
  module: 'auth',
  file: 'signUpForm.tsx'
})

type FormErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  passwordConfirmation?: string
}

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()
  const { toast } = useToast()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captcha = useRef<HCaptcha | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter'
    } else if (!/\d/.test(password)) {
      newErrors.password = 'Password must contain at least one number'
    } else if (!/[!@#$%^&*]/.test(password)) {
      newErrors.password =
        'Password must contain at least one special character'
    }

    // Password confirmation validation
    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = 'Please confirm your password'
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const timestamp = Date.now()
    logger.info(
      'Starting registration submission',
      { email, firstName, lastName },
      'handleSubmit'
    )
    logger.time(`sign-up-${email}-${timestamp}`)

    setLoading(true)

    try {
      const supabase = createClient()

      logger.time(`supabase-auth-call-${timestamp}`)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/user/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName
          },
          captchaToken: captchaToken || undefined
        }
      })
      logger.timeEnd(`supabase-auth-call-${timestamp}`)

      if (error) {
        logger.error(
          'Registration failed',
          {
            error: logger.errorWithData(error),
            email,
            message: error.message,
            status: error.status
          },
          'handleSubmit'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to create account',
          variant: 'destructive'
        })
        return
      }

      if (data?.user) {
        logger.info(
          'Registration successful',
          {
            userId: data.user.id,
            email: data.user.email
          },
          'handleSubmit'
        )
        toast({
          title: 'Success',
          description: 'Please check your email to confirm your account'
        })
        router.push('/sign-in')
      }
    } catch (error) {
      logger.error(
        'Unexpected error during registration',
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
      logger.timeEnd(`sign-up-${email}-${timestamp}`)
      if (captcha.current) {
        captcha.current.resetCaptcha()
      }
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
            error: logger.errorWithData(error)
          },
          'handleGoogleSignIn'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign in with Google',
          variant: 'destructive'
        })
      }
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
            error: logger.errorWithData(error)
          },
          'handleMicrosoftSignIn'
        )
        toast({
          title: 'Error',
          description: error.message || 'Failed to sign in with Microsoft',
          variant: 'destructive'
        })
      }
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
    <Card className='w-full max-w-md shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
      <CardHeader className='space-y-3 pb-8'>
        <CardTitle className='text-center text-2xl font-bold'>
          Create Account
        </CardTitle>
        <CardDescription className='text-center text-sm'>
          Enter your information to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName' className='text-sm font-medium'>
                  First Name
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                  <Input
                    id='firstName'
                    placeholder='John'
                    required
                    className={`pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                    onChange={e => {
                      setFirstName(e.target.value)
                      setErrors(prev => ({ ...prev, firstName: undefined }))
                    }}
                    value={firstName}
                  />
                  {errors.firstName && (
                    <p className='mt-1 text-xs text-red-500'>
                      {errors.firstName}
                    </p>
                  )}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-sm font-medium'>
                  Last Name
                </Label>
                <div className='relative'>
                  <User className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                  <Input
                    id='lastName'
                    placeholder='Doe'
                    required
                    className={`pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                    onChange={e => {
                      setLastName(e.target.value)
                      setErrors(prev => ({ ...prev, lastName: undefined }))
                    }}
                    value={lastName}
                  />
                  {errors.lastName && (
                    <p className='mt-1 text-xs text-red-500'>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='john@example.com'
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
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  required
                  className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                  onChange={e => {
                    setPassword(e.target.value)
                    setErrors(prev => ({ ...prev, password: undefined }))
                  }}
                  value={password}
                />
                {errors.password && (
                  <p className='mt-1 text-xs text-red-500'>{errors.password}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='password-confirmation'
                className='text-sm font-medium'
              >
                Confirm Password
              </Label>
              <div className='relative'>
                <KeyRound className='absolute left-3 top-2.5 size-5 text-muted-foreground' />
                <Input
                  id='password-confirmation'
                  type='password'
                  placeholder='••••••••'
                  required
                  className={`pl-10 ${
                    errors.passwordConfirmation ? 'border-red-500' : ''
                  }`}
                  onChange={e => {
                    setPasswordConfirmation(e.target.value)
                    setErrors(prev => ({
                      ...prev,
                      passwordConfirmation: undefined
                    }))
                  }}
                  value={passwordConfirmation}
                />
                {errors.passwordConfirmation && (
                  <p className='mt-1 text-xs text-red-500'>
                    {errors.passwordConfirmation}
                  </p>
                )}
              </div>
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

          <Button
            type='submit'
            className='w-full py-6'
            size='lg'
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Creating Account...
              </>
            ) : (
              'Create Account'
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
        </form>
      </CardContent>
      <CardFooter className='flex justify-center border-t p-6'>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href={'/sign-in' as Route}
            className='font-medium text-primary hover:underline'
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
