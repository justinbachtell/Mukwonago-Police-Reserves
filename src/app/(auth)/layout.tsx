import { BaseTemplate } from '@/templates/BaseTemplate'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'layout.tsx'
})

export default async function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering auth layout', undefined, 'AuthLayout')
  logger.time('auth-layout-render')
  try {
    return (
      <BaseTemplate>
        <div className='[&_p]:my-6'>{children}</div>
      </BaseTemplate>
    )
  } catch (error) {
    logger.error(
      'Error in auth layout',
      logger.errorWithData(error),
      'AuthLayout'
    )
    throw error
  } finally {
    logger.timeEnd('auth-layout-render')
  }
}
