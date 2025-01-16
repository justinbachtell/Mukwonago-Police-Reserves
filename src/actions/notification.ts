'use server'

import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/libs/DB'
import { notifications, notificationRecipients, user } from '@/models/Schema'
import type {
  CreateNotification,
  NotificationFilter,
  UpdateNotification
} from '@/types/notification'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@/lib/debug'
import { toISOString } from '@/lib/utils'

const logger = createLogger({
  module: 'notification',
  file: 'notification.ts'
})

export async function createNotificationWithRecipients(
  { type, message, url = null }: CreateNotification,
  recipientUserIds: string[]
) {
  logger.info(
    'Creating notification with recipients',
    { type, message, url, recipientCount: recipientUserIds.length },
    'createNotificationWithRecipients'
  )
  logger.time('create-notification')

  try {
    const now = toISOString(new Date())
    const [notification] = await db
      .insert(notifications)
      .values({
        type,
        message,
        url,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (notification && recipientUserIds.length > 0) {
      logger.info(
        'Notification created, adding recipients',
        {
          notificationId: notification.id,
          recipientCount: recipientUserIds.length
        },
        'createNotificationWithRecipients'
      )

      await db.insert(notificationRecipients).values(
        recipientUserIds.map(userId => ({
          notification_id: notification.id,
          user_id: userId,
          is_read: false,
          created_at: now,
          updated_at: now
        }))
      )

      logger.info(
        'Recipients added successfully',
        { notificationId: notification.id },
        'createNotificationWithRecipients'
      )
    } else {
      logger.warn(
        'No notification created or no recipients to add',
        {
          hasNotification: !!notification,
          recipientCount: recipientUserIds.length
        },
        'createNotificationWithRecipients'
      )
    }

    revalidatePath('/notifications')
    logger.timeEnd('create-notification')
    return { data: notification, error: null }
  } catch (error) {
    logger.error(
      'Error creating notification:',
      logger.errorWithData(error),
      'createNotificationWithRecipients'
    )
    return { data: null, error: 'Failed to create notification' }
  }
}

export async function getNotification(id: number) {
  try {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, id),
      with: {
        recipients: {
          with: {
            user: true
          }
        }
      }
    })

    return { data: notification, error: null }
  } catch (error) {
    console.error('Error getting notification:', error)
    return { data: null, error: 'Failed to get notification' }
  }
}

export async function updateNotification(id: number, data: UpdateNotification) {
  try {
    const now = toISOString(new Date())
    const [notification] = await db
      .update(notifications)
      .set({
        ...data,
        updated_at: now
      })
      .where(eq(notifications.id, id))
      .returning()

    revalidatePath('/notifications')
    return { data: notification, error: null }
  } catch (error) {
    console.error('Error updating notification:', error)
    return { data: null, error: 'Failed to update notification' }
  }
}

export async function deleteNotification(id: number) {
  try {
    // First delete all recipients
    await db
      .delete(notificationRecipients)
      .where(eq(notificationRecipients.notification_id, id))

    // Then delete the notification
    const [notification] = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning()

    revalidatePath('/notifications')
    return { data: notification, error: null }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { data: null, error: 'Failed to delete notification' }
  }
}

export async function getUserNotifications(filter: NotificationFilter = {}) {
  try {
    const { type, is_read, user_id, limit = 50, offset = 0 } = filter

    logger.info(
      'Getting user notifications',
      { type, is_read, user_id, limit, offset },
      'getUserNotifications'
    )
    logger.time('get-user-notifications')

    if (!user_id) {
      logger.warn(
        'No user_id provided for getUserNotifications',
        undefined,
        'getUserNotifications'
      )
      return { data: [], error: null }
    }

    // Get notification IDs for this user first
    const recipientNotifications = await db
      .select({
        notification_id: notificationRecipients.notification_id,
        is_read: notificationRecipients.is_read
      })
      .from(notificationRecipients)
      .where(eq(notificationRecipients.user_id, user_id))

    if (recipientNotifications.length === 0) {
      logger.info(
        'No notifications found for user',
        { userId: user_id },
        'getUserNotifications'
      )
      return { data: [], error: null }
    }

    const notificationIds = recipientNotifications.map(n => n.notification_id)
    const readStatus = new Map(
      recipientNotifications.map(n => [n.notification_id, n.is_read])
    )

    // Then get the actual notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(inArray(notifications.id, notificationIds))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset)

    const result = userNotifications.map(notification => ({
      ...notification,
      is_read: readStatus.get(notification.id) ?? false
    }))

    logger.info(
      'Found notifications',
      { count: result.length },
      'getUserNotifications'
    )
    logger.timeEnd('get-user-notifications')

    return { data: result, error: null }
  } catch (error) {
    logger.error(
      'Error getting notifications:',
      {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        filter
      },
      'getUserNotifications'
    )
    return { data: null, error: 'Failed to get notifications' }
  }
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: string
) {
  try {
    const [recipient] = await db
      .update(notificationRecipients)
      .set({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .where(
        and(
          eq(notificationRecipients.notification_id, notificationId),
          eq(notificationRecipients.user_id, userId)
        )
      )
      .returning()

    revalidatePath('/notifications')
    return { data: recipient, error: null }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { data: null, error: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await db
      .update(notificationRecipients)
      .set({
        is_read: true,
        updated_at: new Date().toISOString()
      })
      .where(eq(notificationRecipients.user_id, userId))

    revalidatePath('/notifications')
    return { data: true, error: null }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { data: null, error: 'Failed to mark all notifications as read' }
  }
}

// Helper functions for specific notification types
export async function createApplicationNotification(
  applicantFirstName: string,
  applicantLastName: string
) {
  // Get all admin users
  const adminUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, 'admin'))

  return createNotificationWithRecipients(
    {
      type: 'application_submitted',
      message: `${applicantFirstName} ${applicantLastName} submitted an application`
    },
    adminUsers.map(u => u.id)
  )
}

export async function createEventNotification(
  eventName: string,
  eventId: number
) {
  logger.info(
    'Creating event notification',
    { eventName, eventId },
    'createEventNotification'
  )
  logger.time('create-event-notification')

  try {
    // Get all reserve users
    const reserveUsers = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.position, 'reserve'))

    logger.info(
      'Found reserve users for notification',
      { count: reserveUsers.length },
      'createEventNotification'
    )

    if (reserveUsers.length === 0) {
      logger.warn(
        'No reserve users found to notify',
        undefined,
        'createEventNotification'
      )
      return { data: null, error: 'No reserve users found' }
    }

    const result = await createNotificationWithRecipients(
      {
        type: 'event_created',
        message: `A new event "${eventName}" has been created`,
        url: null
      },
      reserveUsers.map(u => u.id)
    )

    logger.timeEnd('create-event-notification')
    return result
  } catch (error) {
    logger.error(
      'Failed to create event notification',
      logger.errorWithData(error),
      'createEventNotification'
    )
    return { data: null, error: 'Failed to create event notification' }
  }
}

export async function createTrainingSignupNotification(
  userFirstName: string,
  userLastName: string,
  trainingName: string
) {
  // Get all admin users
  const adminUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, 'admin'))

  return createNotificationWithRecipients(
    {
      type: 'training_signup',
      message: `${userFirstName} ${userLastName} has signed up for ${trainingName}`,
      url: null
    },
    adminUsers.map(u => u.id)
  )
}

export async function createTrainingNotification(
  trainingName: string,
  _trainingId: number,
  type: 'training_created' | 'training_updated' = 'training_created'
) {
  // Get all reserve users
  const reserveUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.position, 'reserve'))

  return createNotificationWithRecipients(
    {
      type,
      message:
        type === 'training_created'
          ? `A new training "${trainingName}" has been created`
          : `Training "${trainingName}" has been updated`,
      url: null
    },
    reserveUsers.map(u => u.id)
  )
}

export async function createEquipmentNotification(
  equipmentName: string,
  userId: string,
  type:
    | 'equipment_assigned'
    | 'equipment_returned'
    | 'equipment_return_reminder'
) {
  logger.info(
    'Creating equipment notification',
    { equipmentName, userId, type },
    'createEquipmentNotification'
  )

  try {
    const now = toISOString(new Date())

    // Create notification message based on type
    let message = ''

    switch (type) {
      case 'equipment_assigned':
        message = `Equipment "${equipmentName}" has been assigned to you`
        break
      case 'equipment_returned':
        message = `Equipment "${equipmentName}" has been returned`
        break
      case 'equipment_return_reminder':
        message = `Please return equipment "${equipmentName}"`
        break
    }

    // Create notification
    const [notification] = await db
      .insert(notifications)
      .values({
        type,
        message,
        url: null,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!notification) {
      logger.error(
        'Failed to create notification',
        { equipmentName, userId, type },
        'createEquipmentNotification'
      )
      return null
    }

    // Add recipient
    await db.insert(notificationRecipients).values({
      notification_id: notification.id,
      user_id: userId,
      created_at: now,
      updated_at: now
    })

    logger.info(
      'Equipment notification created',
      {
        notificationId: notification.id,
        userId,
        type
      },
      'createEquipmentNotification'
    )

    return notification
  } catch (error) {
    logger.error(
      'Failed to create equipment notification',
      logger.errorWithData(error),
      'createEquipmentNotification'
    )
    return null
  }
}

export async function createPolicyNotification(
  policyName: string,
  policyNumber: string,
  _policyId: number,
  type: 'policy_created' | 'policy_updated',
  userFirstName?: string,
  userLastName?: string
) {
  // Get all reserve users
  const reserveUsers = await db
    .select({
      id: user.id
    })
    .from(user)
    .where(eq(user.position, 'reserve'))

  const message =
    type === 'policy_created'
      ? `New policy: ${policyName} (${policyNumber})`
      : userFirstName && userLastName
        ? `${userFirstName} ${userLastName} acknowledged policy: ${policyName}`
        : `Policy updated: ${policyName} (${policyNumber})`

  return createNotificationWithRecipients(
    {
      type,
      message,
      url: null
    },
    reserveUsers.map(u => u.id)
  )
}

export async function createEventSignupNotification(
  eventName: string,
  eventId: number,
  firstName: string,
  lastName: string
) {
  logger.info(
    'Creating event signup notification',
    { eventName, eventId },
    'createEventSignupNotification'
  )

  try {
    // Get all admin users to notify them of the signup
    const adminUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, 'admin'))

    // Create notification for admin users
    await createNotificationWithRecipients(
      {
        type: 'event_signup',
        message: `${firstName} ${lastName} has signed up for event: ${eventName}`,
        url: null
      },
      adminUsers.map(user => user.id)
    )

    return true
  } catch (error) {
    logger.error(
      'Failed to create event signup notification',
      logger.errorWithData(error),
      'createEventSignupNotification'
    )
    return false
  }
}

export async function createTestNotification(userId: string) {
  logger.info(
    'Creating test notification',
    { userId },
    'createTestNotification'
  )

  try {
    const now = toISOString(new Date())

    // First create the notification
    const [notification] = await db
      .insert(notifications)
      .values({
        type: 'general',
        message: 'This is a test notification',
        url: null,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!notification) {
      logger.error(
        'Failed to create test notification',
        undefined,
        'createTestNotification'
      )
      return { data: null, error: 'Failed to create notification' }
    }

    // Then create the recipient
    await db.insert(notificationRecipients).values({
      notification_id: notification.id,
      user_id: userId,
      is_read: false,
      created_at: now,
      updated_at: now
    })

    logger.info(
      'Test notification created successfully',
      { notificationId: notification.id },
      'createTestNotification'
    )

    return { data: notification, error: null }
  } catch (error) {
    logger.error(
      'Error creating test notification:',
      logger.errorWithData(error),
      'createTestNotification'
    )
    return { data: null, error: 'Failed to create test notification' }
  }
}

export async function createEventLeaveNotification(
  eventName: string,
  eventId: number,
  firstName: string,
  lastName: string
) {
  logger.info(
    'Creating event leave notification',
    { eventName, eventId },
    'createEventLeaveNotification'
  )

  try {
    // Get all admin users to notify them of the leave
    const adminUsers = await db
      .select()
      .from(user)
      .where(eq(user.role, 'admin'))

    const adminIds = adminUsers.map(user => user.id)

    // Create notification for admin users
    await createNotificationWithRecipients(
      {
        type: 'event_signup',
        message: `${firstName} ${lastName} has left event: ${eventName}`,
        url: null
      },
      adminIds
    )

    return true
  } catch (error) {
    logger.error(
      'Failed to create event leave notification',
      logger.errorWithData(error),
      'createEventLeaveNotification'
    )
    return false
  }
}

export async function createTrainingLeaveNotification(
  userFirstName: string,
  userLastName: string,
  trainingName: string
) {
  // Get all admin users
  const adminUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, 'admin'))

  return createNotificationWithRecipients(
    {
      type: 'training_signup',
      message: `${userFirstName} ${userLastName} has left training: ${trainingName}`,
      url: null
    },
    adminUsers.map(u => u.id)
  )
}
