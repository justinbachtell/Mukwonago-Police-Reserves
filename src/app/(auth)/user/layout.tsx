import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'user/layout.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export default async function UserLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering user layout', undefined, 'UserLayout')
  logger.time('user-layout-render')
  try {
    return <>{children}</>
  } catch (error) {
    logger.error(
      'Error in user layout',
      logger.errorWithData(error),
      'UserLayout'
    )
    throw error
  } finally {
    logger.timeEnd('user-layout-render')
  }
}
