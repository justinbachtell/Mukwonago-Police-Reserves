import ForgotPasswordForm from '@/components/forms/forgotPasswordForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'forgot-password/page.tsx'
})

export const metadata = {
  title: 'Forgot Password - Mukwonago Police Reserves',
  description: 'Reset your Mukwonago Police Reserves account password'
}

export default async function ForgotPasswordPage() {
  logger.info(
    'Initializing forgot password page',
    undefined,
    'ForgotPasswordPage'
  )
  logger.time('forgot-password-page-load')

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
        'ForgotPasswordPage'
      )
      throw sessionError
    }

    // Redirect if already authenticated
    if (session?.user) {
      logger.info(
        'User already authenticated, redirecting to dashboard',
        {
          userId: session.user.id
        },
        'ForgotPasswordPage'
      )
      logger.timeEnd('forgot-password-page-load')
      return redirect('/user/dashboard')
    }

    logger.info(
      'Rendering forgot password form',
      undefined,
      'ForgotPasswordPage'
    )
    logger.timeEnd('forgot-password-page-load')
    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <div className='flex flex-1 items-center justify-center p-4 md:p-8'>
          <ForgotPasswordForm />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in forgot password page',
      logger.errorWithData(error),
      'ForgotPasswordPage'
    )
    logger.timeEnd('forgot-password-page-load')
    throw error
  }
}
