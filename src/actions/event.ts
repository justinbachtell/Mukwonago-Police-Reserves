'use server'

import type { Event } from '@/types/event'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { events } from '@/models/Schema'
import { eq } from 'drizzle-orm'

export async function getAllEvents() {
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

    return allEvents.map(event => ({
      ...event,
      created_at: new Date(event.created_at),
      event_date: new Date(event.event_date),
      event_end_time: new Date(event.event_end_time),
      event_start_time: new Date(event.event_start_time),
      updated_at: new Date(event.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }
}

export async function getEventById(id: number) {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, id))
    if (!event) {
      return null
    }

    return {
      ...event,
      created_at: new Date(event.created_at),
      event_date: new Date(event.event_date),
      event_end_time: new Date(event.event_end_time),
      event_start_time: new Date(event.event_start_time),
      updated_at: new Date(event.updated_at)
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    throw new Error('Failed to fetch event')
  }
}

export async function createEvent(
  data: Omit<Event, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const now = toISOString(new Date())
    const [newEvent] = await db
      .insert(events)
      .values({
        ...data,
        created_at: now,
        event_date: toISOString(data.event_date),
        event_end_time: toISOString(data.event_end_time),
        event_start_time: toISOString(data.event_start_time),
        updated_at: now
      })
      .returning()

    if (!newEvent) {
      throw new Error('Failed to create event')
    }

    return {
      ...newEvent,
      created_at: new Date(newEvent.created_at),
      event_date: new Date(newEvent.event_date),
      event_end_time: new Date(newEvent.event_end_time),
      event_start_time: new Date(newEvent.event_start_time),
      updated_at: new Date(newEvent.updated_at)
    }
  } catch (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event')
  }
}

export async function updateEvent(
  id: number,
  data: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...data,
        event_date: data.event_date ? toISOString(data.event_date) : undefined,
        event_end_time: data.event_end_time
          ? toISOString(data.event_end_time)
          : undefined,
        event_start_time: data.event_start_time
          ? toISOString(data.event_start_time)
          : undefined,
        updated_at: toISOString(new Date())
      })
      .where(eq(events.id, id))
      .returning()

    if (!updatedEvent) {
      throw new Error('Failed to update event')
    }

    return {
      ...updatedEvent,
      created_at: new Date(updatedEvent.created_at),
      event_date: new Date(updatedEvent.event_date),
      event_end_time: new Date(updatedEvent.event_end_time),
      event_start_time: new Date(updatedEvent.event_start_time),
      updated_at: new Date(updatedEvent.updated_at)
    }
  } catch (error) {
    console.error('Error updating event:', error)
    throw new Error('Failed to update event')
  }
}

export async function deleteEvent(id: number) {
  try {
    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning()
    if (!deletedEvent) {
      throw new Error('Failed to delete event')
    }
    return deletedEvent
  } catch (error) {
    console.error('Error deleting event:', error)
    throw new Error('Failed to delete event')
  }
}
