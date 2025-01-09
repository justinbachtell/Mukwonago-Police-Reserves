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
import { useState } from 'react'
import { Loader2, Mail, User, Lock, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'signUpForm.tsx'
})

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const timestamp = Date.now()
    logger.info(
      'Starting registration submission',
      { email, firstName, lastName },
      'handleSubmit'
    )
    logger.time(`sign-up-${email}-${timestamp}`)

    if (password !== passwordConfirmation) {
      logger.warn(
        'Password mismatch during registration',
        { email },
        'handleSubmit'
      )
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      logger.time(`supabase-auth-call-${timestamp}`)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })
      logger.timeEnd(`supabase-auth-call-${timestamp}`)

      if (error) {
        logger.error(
          'Registration failed',
          {
            error: logger.errorWithData(error),
            email
          },
          'handleSubmit'
        )
        toast.error(error.message || 'Failed to create account')
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
        toast.success('Please check your email to confirm your account')
        router.push('/sign-in')
      }
    } catch (error) {
      logger.error(
        'Unexpected error during registration',
        logger.errorWithData(error),
        'handleSubmit'
      )
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
      logger.timeEnd(`sign-up-${email}-${timestamp}`)
    }
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
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
                    className='pl-10'
                    onChange={e => setFirstName(e.target.value)}
                    value={firstName}
                  />
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
                    className='pl-10'
                    onChange={e => setLastName(e.target.value)}
                    value={lastName}
                  />
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
                  className='pl-10'
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                />
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
                  className='pl-10'
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                />
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
                  className='pl-10'
                  onChange={e => setPasswordConfirmation(e.target.value)}
                  value={passwordConfirmation}
                />
              </div>
            </div>
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
        </form>
      </CardContent>
      <CardFooter className='flex justify-center border-t p-6'>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href='/sign-in'
            className='font-medium text-primary hover:underline'
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
