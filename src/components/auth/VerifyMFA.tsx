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
  file: 'VerifyMFA.tsx'
})

interface VerifyMFAProps {
  factorId: string
}

export function VerifyMFA({ factorId }: VerifyMFAProps) {
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    const verifyLabel = 'mfa-verify'
    logger.info('Starting MFA verification', { factorId }, 'handleVerify')
    logger.time(verifyLabel)

    try {
      const supabase = createClient()

      // Create challenge
      logger.time('create-challenge')
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      logger.timeEnd('create-challenge')

      if (challenge.error) {
        logger.error(
          'MFA challenge creation failed',
          logger.errorWithData(challenge.error),
          'handleVerify'
        )
        setError(challenge.error.message)
        return
      }

      // Verify the challenge
      logger.time('verify-challenge')
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode
      })
      logger.timeEnd('verify-challenge')

      if (verify.error) {
        logger.error(
          'MFA verification failed',
          logger.errorWithData(verify.error),
          'handleVerify'
        )
        setError(verify.error.message)
        return
      }

      logger.info('MFA verification successful', { factorId }, 'handleVerify')
      toast.success('Successfully authenticated')
      router.refresh()
      router.push('/user/dashboard')
    } catch (error) {
      logger.error(
        'Unexpected error during MFA verification',
        logger.errorWithData(error),
        'handleVerify'
      )
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
      logger.timeEnd(verifyLabel)
    }
  }

  return (
    <Card className='max-w-md'>
      <CardHeader>
        <CardTitle className='text-lg md:text-xl'>
          Two-Factor Authentication
        </CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Enter the verification code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6'>
          {error && <div className='text-sm text-red-500'>{error}</div>}

          <div className='grid gap-2'>
            <Label htmlFor='code'>Verification Code</Label>
            <Input
              id='code'
              placeholder='Enter 6-digit code'
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.trim())}
              maxLength={6}
            />
          </div>

          <Button
            type='button'
            className='w-full'
            onClick={handleVerify}
            disabled={loading || verifyCode.length !== 6}
          >
            {loading ? <Loader2 className='animate-spin' /> : 'Verify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
