'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications } from '@/context/NotificationContext'
import { createLogger } from '@/lib/debug'
import { cn } from '@/lib/utils'

const logger = createLogger({
  module: 'notification',
  file: 'NotificationBell.tsx'
})

interface NotificationBellProps {
  onClick?: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount, loading } = useNotifications()

  logger.info(
    'Rendering notification bell',
    { unreadCount, loading },
    'NotificationBell'
  )

  const handleClick = () => {
    logger.info(
      'Notification bell clicked',
      { unreadCount, loading },
      'NotificationBell'
    )
    onClick?.()
  }

  return (
    <Button
      variant='outline'
      size='icon'
      className='relative size-12 rounded-full border bg-background/95 shadow-md backdrop-blur transition-all hover:scale-110 hover:shadow-lg hover:ring-2 hover:ring-primary/20 active:scale-95'
      onClick={handleClick}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      disabled={loading}
    >
      <Bell className={cn('size-6', loading && 'animate-pulse')} />
      {unreadCount > 0 && (
        <Badge
          variant='destructive'
          className='absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full p-0 text-sm animate-in zoom-in'
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
