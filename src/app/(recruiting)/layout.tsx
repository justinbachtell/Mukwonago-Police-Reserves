import { BaseTemplate } from '@/templates/BaseTemplate'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'recruiting',
  file: 'layout.tsx'
})

export default async function RecruitingLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering recruiting layout', undefined, 'RecruitingLayout')
  logger.time('recruiting-layout-render')
  try {
    return (
      <BaseTemplate>
        <div>{children}</div>
      </BaseTemplate>
    )
  } catch (error) {
    logger.error(
      'Error in recruiting layout',
      logger.errorWithData(error),
      'RecruitingLayout'
    )
    throw error
  } finally {
    logger.timeEnd('recruiting-layout-render')
  }
}
