import SignInForm from '@/components/forms/signInForm'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'signup/page.tsx'
})

export const metadata = {
  title: 'Sign In - Mukwonago Police Reserves',
  description: 'Sign in to your Mukwonago Police Reserves account'
}

export default async function SignInPage() {
  logger.info('Initializing sign-in page', undefined, 'SignInPage')
  logger.time('sign-in-page-load')

  try {
    logger.info('Rendering sign-in form', undefined, 'SignInPage')
    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <div className='flex flex-1 items-center justify-center p-4 md:p-8'>
          <SignInForm />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in sign-in page',
      logger.errorWithData(error),
      'SignInPage'
    )

    // Show the sign-in form for other types of errors
    logger.info('Rendering sign-in form due to error', undefined, 'SignInPage')
    return (
      <div className='flex flex-1 items-center justify-center p-4 md:p-8'>
        <SignInForm />
      </div>
    )
  } finally {
    logger.info('Sign-in page loaded', undefined, 'SignInPage')
    logger.timeEnd('sign-in-page-load')
  }
}
