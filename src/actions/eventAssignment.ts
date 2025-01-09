"use server";

import type { EventAssignment, CompletionStatus } from '@/types/eventAssignment'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { eventAssignments } from '@/models/Schema'
import { and, eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'

const logger = createLogger({
  module: 'event-assignments',
  file: 'eventAssignment.ts'
})

export async function getEventAssignments(event_id: number) {
  logger.info(
    'Fetching event assignments',
    { eventId: event_id },
    'getEventAssignments'
  )
  logger.time(`fetch-assignments-${event_id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'getEventAssignments'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getEventAssignments')
      return null
    }

    const assignments = await db
      .select()
      .from(eventAssignments)
      .where(eq(eventAssignments.event_id, event_id))

    logger.info(
      'Event assignments retrieved',
      { eventId: event_id, count: assignments.length },
      'getEventAssignments'
    )
    logger.timeEnd(`fetch-assignments-${event_id}`)

    return assignments.map(assignment => ({
      ...assignment,
      created_at: new Date(assignment.created_at),
      updated_at: new Date(assignment.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch event assignments',
      logger.errorWithData(error),
      'getEventAssignments'
    )
    return null
  }
}

export async function getUserEventAssignments(user_id: string) {
  logger.info(
    'Fetching user event assignments',
    { userId: user_id },
    'getUserEventAssignments'
  )
  logger.time(`fetch-user-assignments-${user_id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'getUserEventAssignments'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getUserEventAssignments')
      return null
    }

    const assignments = await db.query.eventAssignments.findMany({
      where: eq(eventAssignments.user_id, user_id),
      with: { event: true }
    })

    logger.info(
      'User event assignments retrieved successfully',
      { userId: user_id, count: assignments.length },
      'getUserEventAssignments'
    )
    logger.timeEnd(`fetch-user-assignments-${user_id}`)

    return assignments.map(assignment => ({
      ...assignment,
      created_at: new Date(assignment.created_at),
      updated_at: new Date(assignment.updated_at),
      event: assignment.event
        ? {
            ...assignment.event,
            event_date: new Date(assignment.event.event_date),
            created_at: new Date(assignment.event.created_at),
            updated_at: new Date(assignment.event.updated_at)
          }
        : null
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch user event assignments',
      logger.errorWithData(error),
      'getUserEventAssignments'
    )
    return null
  }
}

export async function createEventAssignment(
  data: Pick<EventAssignment, 'event_id' | 'user_id'>
) {
  logger.info(
    'Creating event assignment',
    { eventId: data.event_id, userId: data.user_id },
    'createEventAssignment'
  )
  logger.time(`create-assignment-${data.event_id}-${data.user_id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'createEventAssignment'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'createEventAssignment')
      return null
    }

    const now = toISOString(new Date())
    const [newAssignment] = await db
      .insert(eventAssignments)
      .values({
        ...data,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!newAssignment) {
      logger.error(
        'No assignment returned after creation',
        { eventId: data.event_id, userId: data.user_id },
        'createEventAssignment'
      )
      return null
    }

    logger.info(
      'Event assignment created successfully',
      { id: newAssignment.id },
      'createEventAssignment'
    )
    logger.timeEnd(`create-assignment-${data.event_id}-${data.user_id}`)

    return newAssignment
  } catch (error) {
    logger.error(
      'Failed to create event assignment',
      logger.errorWithData(error),
      'createEventAssignment'
    )
    return null
  }
}

export async function deleteEventAssignment(event_id: number, user_id: string) {
  logger.info(
    'Deleting event assignment',
    { eventId: event_id, userId: user_id },
    'deleteEventAssignment'
  )
  logger.time(`delete-assignment-${event_id}-${user_id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'deleteEventAssignment'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'deleteEventAssignment')
      return null
    }

    const [deletedAssignment] = await db
      .delete(eventAssignments)
      .where(
        and(
          eq(eventAssignments.event_id, event_id),
          eq(eventAssignments.user_id, user_id)
        )
      )
      .returning()

    if (!deletedAssignment) {
      logger.error(
        'No assignment returned after deletion',
        { eventId: event_id, userId: user_id },
        'deleteEventAssignment'
      )
      return null
    }

    logger.info(
      'Event assignment deleted successfully',
      { eventId: event_id, userId: user_id },
      'deleteEventAssignment'
    )
    logger.timeEnd(`delete-assignment-${event_id}-${user_id}`)

    return deletedAssignment
  } catch (error) {
    logger.error(
      'Failed to delete event assignment',
      logger.errorWithData(error),
      'deleteEventAssignment'
    )
    return null
  }
}

export async function updateEventAssignmentCompletion(
  eventId: number,
  userId: string,
  data: {
    completion_status: CompletionStatus
    completion_notes?: string | null
  }
) {
  logger.info(
    'Updating event assignment completion',
    { eventId, userId, status: data.completion_status },
    'updateEventAssignmentCompletion'
  )
  logger.time(`update-assignment-${eventId}-${userId}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'updateEventAssignmentCompletion'
      )
      return null
    }

    if (!user) {
      logger.warn(
        'No active user found',
        undefined,
        'updateEventAssignmentCompletion'
      )
      return null
    }

    const [updatedAssignment] = await db
      .update(eventAssignments)
      .set({
        ...data,
        updated_at: toISOString(new Date())
      })
      .where(
        and(
          eq(eventAssignments.event_id, eventId),
          eq(eventAssignments.user_id, userId)
        )
      )
      .returning()

    if (!updatedAssignment) {
      logger.error(
        'No assignment returned after update',
        { eventId, userId },
        'updateEventAssignmentCompletion'
      )
      return null
    }

    logger.info(
      'Event assignment completion updated successfully',
      { eventId, userId, status: data.completion_status },
      'updateEventAssignmentCompletion'
    )
    logger.timeEnd(`update-assignment-${eventId}-${userId}`)

    return updatedAssignment
  } catch (error) {
    logger.error(
      'Failed to update event assignment completion',
      logger.errorWithData(error),
      'updateEventAssignmentCompletion'
    )
    return null
  }
}
