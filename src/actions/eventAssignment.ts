"use server";

import type { EventAssignment, CompletionStatus } from '@/types/eventAssignment'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { eventAssignments } from '@/models/Schema'
import { and, eq } from 'drizzle-orm'

export async function getEventAssignments(event_id: number) {
  try {
    const assignments = await db
      .select()
      .from(eventAssignments)
      .where(eq(eventAssignments.event_id, event_id))

    return assignments.map(assignment => ({
      ...assignment,
      created_at: new Date(assignment.created_at),
      updated_at: new Date(assignment.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching event assignments:', error)
    throw new Error('Failed to fetch event assignments')
  }
}

export async function getUserEventAssignments(user_id: number) {
  try {
    const assignments = await db.query.eventAssignments.findMany({
      where: eq(eventAssignments.user_id, user_id),
      with: {
        event: true
      }
    })

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
    console.error('Error fetching user event assignments:', error)
    throw new Error('Failed to fetch user event assignments')
  }
}

export async function createEventAssignment(
  data: Pick<EventAssignment, 'event_id' | 'user_id'>
) {
  try {
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
      throw new Error('Failed to create event assignment')
    }

    return {
      ...newAssignment,
      created_at: new Date(newAssignment.created_at),
      updated_at: new Date(newAssignment.updated_at)
    }
  } catch (error) {
    console.error('Error creating event assignment:', error)
    throw new Error('Failed to create event assignment')
  }
}

export async function deleteEventAssignment(event_id: number, user_id: number) {
  try {
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
      throw new Error('Failed to delete event assignment')
    }

    return deletedAssignment
  } catch (error) {
    console.error('Error deleting event assignment:', error)
    throw new Error('Failed to delete event assignment')
  }
}

export async function updateEventAssignmentCompletion(
  eventId: number,
  userId: number,
  data: {
    completion_status: CompletionStatus
    completion_notes?: string | null
  }
) {
  try {
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
      throw new Error('Failed to update event assignment completion')
    }

    return updatedAssignment
  } catch (error) {
    console.error('Error updating event assignment completion:', error)
    throw new Error('Failed to update event assignment completion')
  }
}
