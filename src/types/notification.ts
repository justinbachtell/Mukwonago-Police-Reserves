import type { notificationTypesEnum } from '@/models/Schema'

export type NotificationType = (typeof notificationTypesEnum.enumValues)[number]

export interface CreateNotification {
  type: NotificationType
  message: string
  url?: string | null
}

export interface UpdateNotification {
  type?: NotificationType
  message?: string
  url?: string | null
}

export interface NotificationFilter {
  type?: NotificationType
  is_read?: boolean
  user_id?: string
  limit?: number
  offset?: number
}

export interface NotificationWithRecipient {
  id: number
  type: NotificationType
  message: string
  url: string | null
  created_at: string
  updated_at: string
  is_read: boolean
}
