'use server'

import type { NewEvent, UpdateEvent } from '@/types/event'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import type { eventTypesEnum } from '@/models/Schema'
import { events, eventAssignments } from '@/models/Schema'
import { eq, and } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import {
  createEventNotification,
  createEventSignupNotification,
  createEventLeaveNotification
} from '@/actions/notification'
import { getCurrentUser } from '@/actions/user'
import { revalidatePath } from 'next/cache'

const logger = createLogger({
  module: 'events',
  file: 'event.ts'
})

export async function getAllEvents() {
  logger.info('Fetching all events', undefined, 'getAllEvents')

  try {
    const allEvents = await db.query.events.findMany({
      with: {
        assignments: {
          with: {
            user: true
          }
        }
      }
    })

    logger.info(
      'Events retrieved successfully',
      { count: allEvents.length },
      'getAllEvents'
    )
    return allEvents.map(event => ({
      ...event,
      event_type:
        event.event_type as (typeof eventTypesEnum.enumValues)[number],
      created_at: new Date(event.created_at),
      event_date: new Date(event.event_date),
      event_end_time: new Date(event.event_end_time),
      event_start_time: new Date(event.event_start_time),
      min_participants: event.min_participants,
      max_participants: event.max_participants,
      updated_at: new Date(event.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch events',
      logger.errorWithData(error),
      'getAllEvents'
    )
    return null
  }
}

export async function getEventById(id: number) {
  logger.info('Fetching event by ID', { eventId: id }, 'getEventById')

  try {
    const [event] = await db.query.events.findMany({
      where: eq(events.id, id),
      with: {
        assignments: {
          with: {
            user: true
          }
        }
      }
    })

    if (!event) {
      logger.warn('Event not found', { eventId: id }, 'getEventById')
      return null
    }

    logger.info('Event retrieved successfully', { eventId: id }, 'getEventById')
    return {
      ...event,
      event_type:
        event.event_type as (typeof eventTypesEnum.enumValues)[number],
      created_at: new Date(event.created_at),
      event_date: new Date(event.event_date),
      event_end_time: new Date(event.event_end_time),
      event_start_time: new Date(event.event_start_time),
      min_participants: event.min_participants,
      max_participants: event.max_participants,
      updated_at: new Date(event.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to fetch event',
      logger.errorWithData(error),
      'getEventById'
    )
    return null
  }
}

export async function createEvent(data: NewEvent) {
  logger.info(
    'Creating new event',
    {
      name: data.event_name,
      date: data.event_date,
      type: data.event_type
    },
    'createEvent'
  )

  try {
    logger.time('create-event')
    const now = toISOString(new Date())
    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        created_at: now,
        event_type:
          data.event_type as (typeof eventTypesEnum.enumValues)[number],
        event_date: toISOString(data.event_date),
        event_end_time: toISOString(data.event_end_time),
        event_start_time: toISOString(data.event_start_time),
        min_participants: data.min_participants,
        max_participants: data.max_participants,
        updated_at: now
      })
      .returning()

    if (!newEvent) {
      logger.error(
        'No event returned after insert',
        {
          name: data.event_name
        },
        'createEvent'
      )
      return null
    }

    await createEventNotification(
      `A new event has been created: ${newEvent.event_name}`,
      newEvent.id,
      'event_created'
    )

    logger.info(
      'Event created successfully',
      {
        eventId: newEvent.id,
        name: newEvent.event_name
      },
      'createEvent'
    )
    logger.timeEnd('create-event')

    return {
      ...newEvent,
      event_type:
        newEvent.event_type as (typeof eventTypesEnum.enumValues)[number],
      created_at: new Date(newEvent.created_at),
      event_date: new Date(newEvent.event_date),
      event_end_time: new Date(newEvent.event_end_time),
      event_start_time: new Date(newEvent.event_start_time),
      min_participants: newEvent.min_participants,
      max_participants: newEvent.max_participants,
      updated_at: new Date(newEvent.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to create event',
      logger.errorWithData(error),
      'createEvent'
    )
    return null
  }
}

export async function updateEvent(id: number, data: UpdateEvent) {
  logger.info(
    'Updating event',
    {
      eventId: id,
      updates: data
    },
    'updateEvent'
  )

  try {
    logger.time(`update-event-${id}`)
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...data,
        event_type:
          data.event_type as (typeof eventTypesEnum.enumValues)[number],
        event_date: data.event_date ? toISOString(data.event_date) : undefined,
        event_end_time: data.event_end_time
          ? toISOString(data.event_end_time)
          : undefined,
        event_start_time: data.event_start_time
          ? toISOString(data.event_start_time)
          : undefined,
        updated_at: toISOString(new Date()),
        min_participants: data.min_participants,
        max_participants: data.max_participants
      })
      .where(eq(events.id, id))
      .returning()

    if (!updatedEvent) {
      logger.error(
        'No event returned after update',
        { eventId: id },
        'updateEvent'
      )
      return null
    }

    await createEventNotification(
      `An event has been updated: ${updatedEvent.event_name}`,
      updatedEvent.id,
      'event_updated'
    )

    logger.info(
      'Event updated successfully',
      {
        eventId: id,
        name: updatedEvent.event_name
      },
      'updateEvent'
    )
    logger.timeEnd(`update-event-${id}`)

    return {
      ...updatedEvent,
      event_type:
        updatedEvent.event_type as (typeof eventTypesEnum.enumValues)[number],
      created_at: new Date(updatedEvent.created_at),
      event_date: new Date(updatedEvent.event_date),
      event_end_time: new Date(updatedEvent.event_end_time),
      event_start_time: new Date(updatedEvent.event_start_time),
      min_participants: updatedEvent.min_participants,
      max_participants: updatedEvent.max_participants,
      updated_at: new Date(updatedEvent.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to update event',
      logger.errorWithData(error),
      'updateEvent'
    )
    return null
  }
}

export async function deleteEvent(id: number) {
  logger.info('Deleting event', { eventId: id }, 'deleteEvent')

  try {
    // First, delete all event assignments for this event
    await db.delete(eventAssignments).where(eq(eventAssignments.event_id, id))

    // Then delete the event itself
    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning()

    if (!deletedEvent) {
      logger.error(
        'No event returned after deletion',
        { eventId: id },
        'deleteEvent'
      )
      return null
    }

    await createEventNotification(
      `${deletedEvent.event_name} (Cancelled)`,
      deletedEvent.id
    )

    logger.info('Event deleted successfully', { eventId: id }, 'deleteEvent')
    return deletedEvent
  } catch (error) {
    logger.error(
      'Failed to delete event',
      logger.errorWithData(error),
      'deleteEvent'
    )
    return null
  }
}

export async function signUpForEvent(eventId: number) {
  logger.info('Signing up for event', { eventId }, 'signUpForEvent')

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('User not found', undefined, 'signUpForEvent')
      return null
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId))

    if (!event) {
      logger.error('Event not found', { eventId }, 'signUpForEvent')
      return null
    }

    const now = toISOString(new Date())
    const [signup] = await db
      .insert(eventAssignments)
      .values({
        event_id: eventId,
        user_id: currentUser.id,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (signup) {
      // Create notification for event signup
      await createEventSignupNotification(
        event.event_name,
        eventId,
        currentUser.first_name,
        currentUser.last_name
      )
    }

    revalidatePath('/events')
    revalidatePath(`/events/${eventId}`)
    return signup
  } catch (error) {
    logger.error(
      'Failed to sign up for event',
      logger.errorWithData(error),
      'signUpForEvent'
    )
    return null
  }
}

export async function leaveEvent(eventId: number) {
  logger.info('Leaving event', { eventId }, 'leaveEvent')

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('User not found', undefined, 'leaveEvent')
      return null
    }

    const [event] = await db.query.events.findMany({
      where: eq(events.id, eventId)
    })

    if (!event) {
      logger.error('Event not found', { eventId }, 'leaveEvent')
      return null
    }

    const [deletedAssignment] = await db
      .delete(eventAssignments)
      .where(
        and(
          eq(eventAssignments.event_id, eventId),
          eq(eventAssignments.user_id, currentUser.id)
        )
      )
      .returning()

    if (!deletedAssignment) {
      logger.error(
        'No assignment returned after deletion',
        { eventId, userId: currentUser.id },
        'leaveEvent'
      )
      return null
    }

    // Create notification for leaving event
    await createEventLeaveNotification(
      event.event_name,
      event.id,
      currentUser.first_name,
      currentUser.last_name
    )

    logger.info(
      'Event left successfully',
      { eventId, userId: currentUser.id },
      'leaveEvent'
    )

    revalidatePath('/events')
    revalidatePath(`/events/${eventId}`)
    return deletedAssignment
  } catch (error) {
    logger.error(
      'Failed to leave event',
      logger.errorWithData(error),
      'leaveEvent'
    )
    return null
  }
}
