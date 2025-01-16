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
      <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
        <div className='flex flex-1 items-center justify-center'>
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
      <div className='flex min-h-screen flex-1 items-center justify-center px-4 md:px-6 lg:px-10'>
        <SignInForm />
      </div>
    )
  } finally {
    logger.info('Sign-in page loaded', undefined, 'SignInPage')
    logger.timeEnd('sign-in-page-load')
  }
}
