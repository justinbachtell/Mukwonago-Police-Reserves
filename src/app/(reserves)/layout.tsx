import { BaseTemplate } from '@/templates/BaseTemplate'
import { createLogger } from '@/lib/debug'
import { NotificationList } from '@/components/notifications/NotificationList'

const logger = createLogger({
  module: 'recruiting',
  file: 'layout.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export default async function ReservesLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering reserves layout', undefined, 'ReservesLayout')
  logger.time('reserves-layout-render')
  try {
    return (
      <BaseTemplate>
        <div className='px-4 pb-12 pt-20 lg:py-10'>
          <NotificationList />
          {children}
        </div>
      </BaseTemplate>
    )
  } catch (error) {
    logger.error(
      'Error in reserves layout',
      logger.errorWithData(error),
      'ReservesLayout'
    )
    throw error
  } finally {
    logger.timeEnd('reserves-layout-render')
  }
}
