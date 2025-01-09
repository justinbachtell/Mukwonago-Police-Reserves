import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'auth',
  file: 'admin/layout.tsx'
})

// export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering admin layout', undefined, 'AdminLayout')
  logger.time('admin-layout-render')
  try {
    return <div className='[&_p]:my-6'>{children}</div>
  } catch (error) {
    logger.error(
      'Error in admin layout',
      logger.errorWithData(error),
      'AdminLayout'
    )
    throw error
  } finally {
    logger.timeEnd('admin-layout-render')
  }
}
