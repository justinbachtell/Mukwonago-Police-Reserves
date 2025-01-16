'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { NotificationType } from '@/types/notification'
import { markNotificationAsRead } from '@/actions/notification'

interface NotificationItemProps {
  id: number
  type: NotificationType
  message: string
  is_read: boolean
  created_at: string
  onNotificationClick: () => void
  userId: string
}

export function NotificationItem({
  id,
  type,
  message,
  is_read,
  created_at,
  onNotificationClick,
  userId
}: NotificationItemProps) {
  async function handleClick() {
    if (!is_read) {
      await markNotificationAsRead(id, userId)
    }
    onNotificationClick()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={cn(
        'w-full rounded-lg p-3 text-left text-sm transition-colors hover:bg-accent',
        !is_read && 'bg-accent/50'
      )}
    >
      <div className='line-clamp-2'>{message}</div>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <span>
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </span>
        <span className='ml-2 capitalize'>{type.replace(/_/g, ' ')}</span>
      </div>
    </button>
  )
}
