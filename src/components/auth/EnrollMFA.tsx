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
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'
import Image from 'next/image'

const logger = createLogger({
  module: 'auth',
  file: 'EnrollMFA.tsx'
})

interface EnrollMFAProps {
  onEnrolled: () => void
  onCancelled: () => void
}

export function EnrollMFA({ onEnrolled, onCancelled }: EnrollMFAProps) {
  const [factorId, setFactorId] = useState('')
  const [qr, setQR] = useState('') // holds the QR code image SVG
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const enrollMFA = async () => {
      logger.info('Starting MFA enrollment process', undefined, 'enrollMFA')
      logger.time('mfa-enroll')

      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp'
        })

        if (error) {
          logger.error(
            'MFA enrollment failed',
            logger.errorWithData(error),
            'enrollMFA'
          )
          setError(error.message)
          return
        }

        logger.info(
          'MFA enrollment initiated successfully',
          { factorId: data.id },
          'enrollMFA'
        )
        setFactorId(data.id)
        setQR(data.totp.qr_code)
      } catch (error) {
        logger.error(
          'Unexpected error during MFA enrollment',
          logger.errorWithData(error),
          'enrollMFA'
        )
        setError('An unexpected error occurred')
      } finally {
        logger.timeEnd('mfa-enroll')
      }
    }

    enrollMFA()
  }, [])

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
      toast.success('MFA enabled successfully')
      onEnrolled()
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
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription className='text-xs md:text-sm'>
          Scan the QR code with your authenticator app and enter the
          verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6'>
          {error && <div className='text-sm text-red-500'>{error}</div>}

          {qr && (
            <div className='flex justify-center'>
              <Image
                src={`data:image/svg+xml;utf-8,${encodeURIComponent(qr)}`}
                alt='QR Code'
                width={192}
                height={192}
                className='size-48'
                priority
              />
            </div>
          )}

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

          <div className='flex gap-4'>
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={onCancelled}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='button'
              className='w-full'
              onClick={handleVerify}
              disabled={loading || verifyCode.length !== 6}
            >
              {loading ? <Loader2 className='animate-spin' /> : 'Enable'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
