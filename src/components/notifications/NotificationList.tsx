'use client'

import { useEffect, useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getCurrentUser } from '@/actions/user'
import { markAllNotificationsAsRead } from '@/actions/notification'
import { NotificationBell } from './NotificationBell'
import { NotificationItem } from './NotificationItem'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { cn } from '@/lib/utils'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'notification',
  file: 'NotificationList.tsx'
})

export function NotificationList() {
  const { notifications, loading, refetchNotifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    logger.info('NotificationList mounted', undefined, 'NotificationList')
    getCurrentUser()
      .then(user => {
        logger.info(
          'Got current user',
          { userId: user?.id, userRole: user?.role, userStatus: user?.status },
          'NotificationList'
        )
        if (user) {
          setCurrentUser(user)
          setError(null)
        } else {
          logger.warn('No user found', undefined, 'NotificationList')
          setError('User not authenticated')
        }
      })
      .catch(err => {
        logger.error(
          'Error getting current user',
          logger.errorWithData(err),
          'NotificationList'
        )
        setError('Failed to get user information')
      })
  }, [])

  useEffect(() => {
    logger.info(
      'Notifications state updated',
      {
        count: notifications.length,
        loading,
        userId: currentUser?.id,
        error
      },
      'NotificationList'
    )
  }, [notifications, loading, currentUser, error])

  async function handleMarkAllRead() {
    if (!currentUser?.id) {
      logger.warn('No current user found', undefined, 'handleMarkAllRead')
      setError('User not authenticated')
      return
    }

    try {
      logger.info(
        'Marking all notifications as read',
        { userId: currentUser.id },
        'handleMarkAllRead'
      )
      setMarkingRead(true)
      setError(null)
      await markAllNotificationsAsRead(currentUser.id)
      await refetchNotifications()
      logger.info(
        'Finished marking all notifications as read',
        undefined,
        'handleMarkAllRead'
      )
    } catch (err) {
      logger.error(
        'Error marking notifications as read',
        logger.errorWithData(err),
        'handleMarkAllRead'
      )
      setError('Failed to mark notifications as read')
    } finally {
      setMarkingRead(false)
    }
  }

  function handleClose() {
    logger.info('Closing notification list', undefined, 'handleClose')
    setOpen(false)
  }

  if (error) {
    logger.warn('Rendering error state', { error }, 'NotificationList')
    return null
  }

  if (!currentUser) {
    logger.info(
      'No current user, not rendering notification list',
      undefined,
      'NotificationList'
    )
    return null
  }

  const hasUnread = notifications.some(n => !n.is_read)
  logger.info(
    'Rendering notification list',
    { hasUnread, open, notificationCount: notifications.length },
    'NotificationList'
  )

  return (
    <div
      className={cn(
        'fixed right-6 top-4 z-50 transition-all duration-300',
        hasUnread && 'animate-subtle-pulse'
      )}
    >
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          hasUnread && 'glow-primary'
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div>
              <NotificationBell />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className='w-[380px] p-0 shadow-lg'
            align='end'
            sideOffset={8}
          >
            <div className='flex items-center justify-between border-b p-4'>
              <h4 className='font-medium leading-none'>Notifications</h4>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 text-xs'
                onClick={handleMarkAllRead}
                disabled={markingRead || notifications.every(n => n.is_read)}
              >
                {markingRead ? (
                  <Loader2 className='mr-1 size-3 animate-spin' />
                ) : (
                  <Check className='mr-1 size-3' />
                )}
                Mark all read
              </Button>
            </div>
            <ScrollArea className='h-[calc(100vh-20rem)] min-h-[300px] w-full'>
              {loading ? (
                <div className='flex h-[300px] items-center justify-center'>
                  <Loader2 className='size-6 animate-spin text-muted-foreground' />
                </div>
              ) : notifications.length === 0 ? (
                <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
                  No notifications
                </div>
              ) : (
                <div className='grid gap-1 p-1'>
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      {...notification}
                      userId={currentUser.id}
                      onNotificationClick={handleClose}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
