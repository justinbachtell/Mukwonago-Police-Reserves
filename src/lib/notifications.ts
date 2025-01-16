import type { NotificationType } from '@/types/notification'

type NotificationTemplate = {
  [K in NotificationType]: string
}

// Message templates for each notification type
export const notificationTemplates: NotificationTemplate = {
  application_submitted: 'New application submitted by {userName}',
  application_approved: 'Your application has been approved',
  application_rejected: 'Your application has been rejected',
  event_created: 'New event: {eventName}',
  event_updated: 'Event updated: {eventName}',
  event_signup: '{userName} signed up for {eventName}',
  event_signup_reminder: 'Reminder: You are signed up for {eventName}',
  event_reminder: 'Reminder: Event {eventName} is happening soon',
  training_created: 'New training: {trainingName}',
  training_updated: 'Training updated: {trainingName}',
  training_signup: '{userName} signed up for {trainingName}',
  training_signup_reminder: 'Reminder: You are signed up for {trainingName}',
  training_reminder: 'Reminder: Training {trainingName} is happening soon',
  equipment_assigned: 'Equipment assigned: {equipmentName}',
  equipment_returned: 'Equipment returned: {equipmentName}',
  equipment_return_reminder: 'Please return equipment: {equipmentName}',
  policy_created: 'New policy: {policyName}',
  policy_updated: 'Policy updated: {policyName}',
  policy_reminder: 'Please review policy: {policyName}',
  general: '{message}',
  announcement: '{message}'
}

/**
 * Formats a notification message using the template and provided data
 */
export function formatNotificationMessage(
  type: NotificationType,
  templateData?: Record<string, string | number>
): string {
  let message = notificationTemplates[type]
  if (templateData) {
    Object.entries(templateData).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, String(value))
    })
  }
  return message
}

/**
 * Removes duplicate users from recipients array
 */
export function deduplicateRecipients<T extends { id: string }>(
  recipients: T[]
): T[] {
  const seen = new Set<string>()
  return recipients.filter(user => {
    if (seen.has(user.id)) {
      return false
    }
    seen.add(user.id)
    return true
  })
}
