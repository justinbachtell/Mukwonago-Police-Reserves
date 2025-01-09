// TODO: FIX GETSESSION AND REDIRECT
// TODO: ADD FINALLY END TIME

import { VerifyMFA } from '@/components/auth/VerifyMFA'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'verify-mfa/page.tsx'
})

export const metadata = {
  title: 'Verify MFA - Mukwonago Police Reserves',
  description: 'Complete two-factor authentication'
}

interface PageProps {
  searchParams: Promise<{
    factorId?: string
  }>
}

export default async function VerifyMFAPage({ searchParams }: PageProps) {
  logger.info('Initializing MFA verification page', undefined, 'VerifyMFAPage')
  logger.time('verify-mfa-page-load')

  try {
    const supabase = await createClient()

    logger.time('fetch-supabase-session')
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    logger.timeEnd('fetch-supabase-session')

    if (sessionError) {
      logger.error(
        'Failed to get Supabase session',
        logger.errorWithData(sessionError),
        'VerifyMFAPage'
      )
      throw sessionError
    }

    // Redirect if already fully authenticated
    if (session?.user && !session.user.factors?.length) {
      logger.info(
        'User already authenticated without MFA, redirecting to dashboard',
        {
          userId: session.user.id
        },
        'VerifyMFAPage'
      )
      logger.timeEnd('verify-mfa-page-load')
      return redirect('/user/dashboard')
    }

    // Ensure we have a factorId
    const { factorId } = await searchParams
    if (!factorId) {
      logger.error('No factorId provided', undefined, 'VerifyMFAPage')
      return redirect('/sign-in')
    }

    logger.info(
      'Rendering MFA verification form',
      { factorId },
      'VerifyMFAPage'
    )
    logger.timeEnd('verify-mfa-page-load')
    return <VerifyMFA factorId={factorId} />
  } catch (error) {
    logger.error(
      'Error in MFA verification page',
      logger.errorWithData(error),
      'VerifyMFAPage'
    )
    logger.timeEnd('verify-mfa-page-load')
    throw error
  }
}
