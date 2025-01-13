import MagicLinkForm from '@/components/forms/magicLinkForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'magic-link/page.tsx'
})

export const metadata = {
  title: 'Sign In with Magic Link - Mukwonago Police Reserves',
  description: 'Sign in to your account with a magic link sent to your email'
}

export default async function MagicLinkPage() {
  logger.info('Initializing magic link page', undefined, 'MagicLinkPage')
  logger.time('magic-link-page-load')

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
        'MagicLinkPage'
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
        'MagicLinkPage'
      )
      logger.timeEnd('magic-link-page-load')
      return redirect('/user/dashboard')
    }

    logger.info('Rendering magic link form', undefined, 'MagicLinkPage')
    logger.timeEnd('magic-link-page-load')
    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <div className='flex flex-1 items-center justify-center p-4 md:p-8'>
          <MagicLinkForm />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in magic link page',
      logger.errorWithData(error),
      'MagicLinkPage'
    )
    logger.timeEnd('magic-link-page-load')
    throw error
  }
}
