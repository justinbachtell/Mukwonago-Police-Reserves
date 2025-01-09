import ResetPasswordForm from '@/components/forms/resetPasswordForm'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'reset-password/page.tsx'
})

export const metadata = {
  title: 'Reset Password - Mukwonago Police Reserves',
  description: 'Reset your Mukwonago Police Reserves account password'
}

export default async function ResetPasswordPage() {
  logger.info(
    'Initializing reset password page',
    undefined,
    'ResetPasswordPage'
  )
  logger.time('reset-password-page-load')

  try {
    logger.info('Rendering reset password form', undefined, 'ResetPasswordPage')
    logger.timeEnd('reset-password-page-load')
    return <ResetPasswordForm />
  } catch (error) {
    logger.error(
      'Error in reset password page',
      logger.errorWithData(error),
      'ResetPasswordPage'
    )
    logger.timeEnd('reset-password-page-load')
    throw error
  }
}
