import { createLogger } from '@/lib/debug'
import { db } from '@/libs/DB'
import { eq, and, lt, isNull } from 'drizzle-orm'
import {
  events,
  training,
  policies,
  assignedEquipment,
  equipment
} from '@/models/Schema'
import { addDays, subDays } from 'date-fns'
import { toISOString } from '@/lib/utils'
import {
  createEventNotification,
  createTrainingNotification,
  createPolicyNotification,
  createEquipmentNotification
} from '@/actions/notification'

const logger = createLogger({
  module: 'reminders',
  file: 'reminders.ts'
})

// Send reminders for events happening in 4 days
export async function sendEventReminders() {
  logger.info('Sending event reminders', undefined, 'sendEventReminders')

  try {
    const targetDate = addDays(new Date(), 4)
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(eq(events.event_date, toISOString(targetDate)))

    for (const event of upcomingEvents) {
      await createEventNotification(event.event_name, event.id)

      // Update last reminder sent
      await db
        .update(events)
        .set({
          last_reminder_sent: new Date(),
          updated_at: toISOString(new Date())
        })
        .where(eq(events.id, event.id))
    }

    return true
  } catch (error) {
    // Log error but don't fail the application
    logger.error(
      'Failed to send event reminders',
      logger.errorWithData(error),
      'sendEventReminders'
    )
    return false
  }
}

// Send reminders for training sessions happening in 4 days
export async function sendTrainingReminders() {
  logger.info('Sending training reminders', undefined, 'sendTrainingReminders')

  try {
    const targetDate = addDays(new Date(), 4)
    const upcomingTraining = await db
      .select()
      .from(training)
      .where(eq(training.training_date, toISOString(targetDate)))

    for (const session of upcomingTraining) {
      await createTrainingNotification(
        session.name,
        session.id,
        'training_created'
      )

      // Update last reminder sent
      await db
        .update(training)
        .set({
          last_reminder_sent: new Date(),
          updated_at: toISOString(new Date())
        })
        .where(eq(training.id, session.id))
    }

    return true
  } catch (error) {
    // Log error but don't fail the application
    logger.error(
      'Failed to send training reminders',
      logger.errorWithData(error),
      'sendTrainingReminders'
    )
    return false
  }
}

// Send reminders for policies every 5 days if not acknowledged
export async function sendPolicyReminders() {
  logger.info('Sending policy reminders', undefined, 'sendPolicyReminders')

  try {
    const activePolicies = await db
      .select()
      .from(policies)
      .where(
        and(
          eq(policies.is_active, true),
          lt(policies.last_reminder_sent, subDays(new Date(), 5))
        )
      )

    for (const policy of activePolicies) {
      await createPolicyNotification(
        policy.name,
        policy.policy_number,
        policy.id,
        'policy_created'
      )

      // Update last reminder sent date
      await db
        .update(policies)
        .set({
          last_reminder_sent: new Date(),
          updated_at: toISOString(new Date())
        })
        .where(eq(policies.id, policy.id))
    }

    return true
  } catch (error) {
    // Log error but don't fail the application
    logger.error(
      'Failed to send policy reminders',
      logger.errorWithData(error),
      'sendPolicyReminders'
    )
    return false
  }
}

// Send reminders for equipment due in 4 days
export async function sendEquipmentReturnReminders() {
  logger.info(
    'Sending equipment return reminders',
    undefined,
    'sendEquipmentReturnReminders'
  )

  try {
    const targetDate = addDays(new Date(), 4)
    const dueEquipment = await db
      .select()
      .from(assignedEquipment)
      .where(
        and(
          eq(assignedEquipment.expected_return_date, toISOString(targetDate)),
          isNull(assignedEquipment.checked_in_at)
        )
      )

    for (const assignment of dueEquipment) {
      const [equipmentItem] = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, assignment.equipment_id))

      if (equipmentItem) {
        await createEquipmentNotification(
          equipmentItem.name,
          assignment.user_id,
          'equipment_return_reminder'
        )
      }
    }

    return true
  } catch (error) {
    // Log error but don't fail the application
    logger.error(
      'Failed to send equipment return reminders',
      logger.errorWithData(error),
      'sendEquipmentReturnReminders'
    )
    return false
  }
}

// Main function to run all reminders
export async function processAllReminders() {
  logger.info('Processing all reminders', undefined, 'processAllReminders')

  try {
    // Run all reminders in parallel but don't fail if any fail
    const results = await Promise.allSettled([
      sendEventReminders(),
      sendTrainingReminders(),
      sendPolicyReminders(),
      sendEquipmentReturnReminders()
    ])

    // Log results but continue even if some failed
    results.forEach((result, index) => {
      const reminderType = ['events', 'training', 'policies', 'equipment'][
        index
      ]

      if (result.status === 'rejected') {
        logger.error(
          `Failed to process ${reminderType} reminders`,
          logger.errorWithData(result.reason),
          'processAllReminders'
        )
      } else if (!result.value) {
        logger.warn(
          `${reminderType} reminders completed with errors`,
          undefined,
          'processAllReminders'
        )
      }
    })

    return true
  } catch (error) {
    // Log error but don't fail the application
    logger.error(
      'Failed to process reminders',
      logger.errorWithData(error),
      'processAllReminders'
    )
    return false
  }
}
