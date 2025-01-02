import { getAllEvents } from '@/actions/event'
import { EventsView } from '@/components/reserves/events/EventsView'
import type { EventType } from '@/types/event'

export default async function EventsPage() {
  const rawEvents = await getAllEvents()

  const events = rawEvents.map(event => ({
    ...event,
    created_at: new Date(event.created_at),
    event_date: new Date(event.event_date),
    event_end_time: new Date(event.event_end_time),
    event_start_time: new Date(event.event_start_time),
    updated_at: new Date(event.updated_at),
    event_type: event.event_type as EventType
  }))

  return <EventsView events={events} />
}
