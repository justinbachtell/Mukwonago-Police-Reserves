import { BaseTemplate } from '@/templates/BaseTemplate'
import { createLogger } from '@/lib/debug'

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
        <div className='[&_p]:my-6'>{children}</div>
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
