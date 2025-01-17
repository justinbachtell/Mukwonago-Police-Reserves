'use client'

import { BaseTemplate } from '@/templates/BaseTemplate'
import { createLogger } from '@/lib/debug'
import { NotificationList } from '@/components/notifications/NotificationList'
import { LoadingPage } from '@/components/ui/loading'
import { Suspense } from 'react'

const logger = createLogger({
  module: 'recruiting',
  file: 'layout.tsx'
})

function ReservesLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <BaseTemplate>
      <div className='py-8'>
        <NotificationList />
        <Suspense fallback={<LoadingPage />}>{children}</Suspense>
      </div>
    </BaseTemplate>
  )
}

export default function ReservesLayout({
  children
}: {
  children: React.ReactNode
}) {
  logger.info('Rendering reserves layout', undefined, 'ReservesLayout')
  logger.time('reserves-layout-render')
  try {
    return <ReservesLayoutContent>{children}</ReservesLayoutContent>
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
