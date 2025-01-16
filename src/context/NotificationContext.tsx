'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useMemo
} from 'react'
import { getCurrentUser } from '@/actions/user'
import { getUserNotifications } from '@/actions/notification'
import type { NotificationWithRecipient } from '@/types/notification'
import { createClient } from '@/lib/client'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'notification',
  file: 'NotificationContext.tsx'
})

interface NotificationContextType {
  notifications: NotificationWithRecipient[]
  unreadCount: number
  loading: boolean
  error: string | null
  refetchNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  error: null,
  refetchNotifications: async () => {}
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<
    NotificationWithRecipient[]
  >([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function fetchNotifications(userId: string) {
    setLoading(true)
    logger.info('Starting notification fetch', { userId }, 'fetchNotifications')

    try {
      const { data, error } = await getUserNotifications({ user_id: userId })

      if (error) {
        logger.error(
          'Error fetching notifications',
          { error, userId },
          'fetchNotifications'
        )
        setError(error)
        return
      }

      if (data) {
        logger.info(
          'Successfully fetched notifications',
          { count: data.length },
          'fetchNotifications'
        )
        setNotifications(data)
      }
    } catch (error) {
      logger.error(
        'Unexpected error in fetchNotifications',
        logger.errorWithData(error),
        'fetchNotifications'
      )
      setError('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    logger.info(
      'NotificationProvider mounted',
      undefined,
      'NotificationProvider'
    )

    const initializeProvider = async () => {
      try {
        logger.info(
          'Getting current user...',
          undefined,
          'NotificationProvider'
        )
        const user = await getCurrentUser()

        if (user?.id) {
          logger.info(
            'Successfully got current user',
            { userId: user.id, userEmail: user.email },
            'NotificationProvider'
          )
          setCurrentUser(user)

          // Don't create test notifications on every mount
          await fetchNotifications(user.id)
        } else {
          logger.warn(
            'No user found or not authenticated',
            undefined,
            'NotificationProvider'
          )
          setLoading(false)
          setError('Not authenticated')
        }
      } catch (error) {
        logger.error(
          'Error initializing NotificationProvider',
          logger.errorWithData(error),
          'NotificationProvider'
        )
        setLoading(false)
        setError('Failed to initialize notifications')
      }
    }

    initializeProvider()
  }, [])

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (!currentUser?.id) {
      logger.warn(
        'No current user for subscription',
        undefined,
        'NotificationProvider'
      )
      return
    }

    logger.info(
      'Setting up notification subscription',
      { userId: currentUser.id },
      'NotificationProvider'
    )

    const supabase = createClient()

    // Subscribe to changes in notification_recipients for the current user
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_recipients',
          filter: `user_id=eq.${currentUser.id}`
        },
        payload => {
          logger.info(
            'Notification change detected',
            { userId: currentUser.id, payload },
            'NotificationProvider'
          )
          // Refetch notifications when changes occur
          fetchNotifications(currentUser.id)
        }
      )
      .subscribe()

    return () => {
      logger.info(
        'Cleaning up notification subscription',
        undefined,
        'NotificationProvider'
      )
      supabase.removeChannel(channel)
    }
  }, [currentUser?.id])

  const unreadCount = notifications.filter(n => !n.is_read).length
  logger.info(
    'Current notification state',
    {
      totalCount: notifications.length,
      unreadCount,
      loading,
      userId: currentUser?.id
    },
    'NotificationProvider'
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter(n => !n.is_read).length,
      loading,
      error,
      refetchNotifications: async () => {
        if (currentUser?.id) {
          await fetchNotifications(currentUser.id)
        }
      }
    }),
    [notifications, loading, error, currentUser]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}
