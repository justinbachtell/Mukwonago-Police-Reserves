'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'

const logger = createLogger({
  module: 'auth',
  file: 'verifyEmailForm.tsx'
})

export default function VerifyEmailForm() {
  const [loading, setLoading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { toast } = useToast()
  const router = useRouter()

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address is missing. Please try signing up again.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      })

      if (error) {
        logger.error('OTP verification failed', {
          error: logger.errorWithData(error),
          email
        })
        throw error
      }

      toast({
        title: 'Success',
        description: 'Email verified successfully! You can now sign in.'
      })
      router.push('/sign-in')
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to verify email. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  /* const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address is missing. Please try signing up again.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        email,
        type: 'signup'
      })

      if (error) {
        throw error
      }

      toast({
        title: 'Success',
        description:
          'Verification email has been resent. Please check your inbox.'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.message || 'Failed to resend email. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  } */

  if (!email) {
    return (
      <Card className='w-full max-w-md shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-center text-2xl'>Error</CardTitle>
          <CardDescription className='text-center'>
            No email address provided. Please try signing up again.
          </CardDescription>
        </CardHeader>
        <CardFooter className='flex justify-center'>
          <Button asChild>
            <Link href='/sign-up'>Return to Sign Up</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-md shadow-lg dark:bg-gray-950 dark:shadow-2xl dark:shadow-blue-900/20'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-center text-2xl'>
          Verify Your Email
        </CardTitle>
        <CardDescription className='text-center'>
          We've sent a verification email to {email}
          <span className='mt-1 block text-xs text-muted-foreground'>
            (Please check your spam folder if you don't see it)
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='flex justify-center'>
          <Mail className='size-12 text-primary' />
        </div>

        <form
          onSubmit={handleVerifyOTP}
          className='flex flex-col items-center justify-center space-y-4'
        >
          <div className='flex w-full flex-col items-center justify-center space-y-2'>
            <div className='text-center text-sm font-medium'>
              Verification Code
            </div>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={setOtpCode}
              disabled={loading}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className='text-xs text-muted-foreground'>
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </Button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or confirm via email
            </span>
          </div>
        </div>

        {/* <div className='space-y-2 text-center'>
          <p className='text-sm text-muted-foreground'>
            Didn't receive the email?
          </p>
          <Button
            variant='outline'
            onClick={handleResendEmail}
            disabled={loading}
            className='w-full'
          >
            Resend verification email
          </Button>
        </div> */}
      </CardContent>
      <CardFooter className='flex flex-col space-y-4 text-center'>
        <p className='text-sm text-muted-foreground'>
          Already verified?{' '}
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
