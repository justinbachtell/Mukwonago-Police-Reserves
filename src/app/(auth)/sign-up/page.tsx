import SignUpForm from '@/components/forms/signUpForm'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'register/page.tsx'
})

export const metadata = {
  title: 'Sign Up - Mukwonago Police Reserves',
  description: 'Create an account to apply for the Mukwonago Police Reserves'
}

export default async function SignUpPage() {
  logger.info('Initializing registration page', undefined, 'SignUpPage')
  logger.time('register-page-load')

  try {
    logger.info('Rendering registration form', undefined, 'SignUpPage')
    return (
      <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
        <div className='flex flex-1 items-center justify-center'>
          <SignUpForm />
        </div>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in registration page',
      logger.errorWithData(error),
      'SignUpPage'
    )

    // Show the sign-up form for other types of errors
    logger.info('Rendering sign-up form due to error', undefined, 'SignUpPage')
    return (
      <div className='flex min-h-screen flex-1 items-center justify-center px-4 md:px-6 lg:px-10'>
        <SignUpForm />
      </div>
    )
  } finally {
    logger.info('Registration page loaded', undefined, 'SignUpPage')
    logger.timeEnd('register-page-load')
  }
}
