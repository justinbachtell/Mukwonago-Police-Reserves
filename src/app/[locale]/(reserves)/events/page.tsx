import { getAllEvents } from '@/actions/event'
import { EventsView } from '@/components/reserves/events/EventsView'
import type { Event, EventType } from '@/types/event'
import type { EventAssignment } from '@/types/eventAssignment'

interface RawEvent extends Omit<Event, 'event_type'> {
  event_type: string
}

export default async function EventsPage() {
  const rawEvents = await getAllEvents()

  const events = rawEvents.map((e: RawEvent) => ({
    ...e,
    created_at: new Date(e.created_at),
    event_date: new Date(e.event_date),
    event_end_time: new Date(e.event_end_time),
    event_start_time: new Date(e.event_start_time),
    updated_at: new Date(e.updated_at),
    event_type: e.event_type as EventType,
    assignments: e.assignments?.map((a: EventAssignment) => ({
      ...a,
      created_at: new Date(a.created_at),
      updated_at: new Date(a.updated_at),
      completion_status: a.completion_status
    }))
  })) satisfies Event[]

  return <EventsView events={events} />
}
