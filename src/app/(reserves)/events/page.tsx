import { getAllEvents } from '@/actions/event'
import { EventsView } from '@/components/reserves/events/EventsView'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { toISOString } from '@/lib/utils'
import type { eventTypesEnum } from '@/models/Schema'

const logger = createLogger({
  module: 'events',
  file: 'page.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export const metadata = {
  title: 'Events - Mukwonago Police Reserves',
  description: 'View and manage reserve police events and assignments'
}

export default async function EventsPage() {
  logger.info('Rendering events page', undefined, 'EventsPage')
  logger.time('events-page-load')

  try {
    // Ensure only authenticated members and admins can access events
    const user = await getCurrentUser()
    if (
      !user ||
      !user.role ||
      (user.role !== 'admin' && user.role !== 'member')
    ) {
      logger.error('Unauthorized access to events', undefined, 'EventsPage')
      return redirect('/sign-in')
    }

    logger.info('Fetching events', undefined, 'EventsPage')
    const rawEvents = await getAllEvents()
    if (!rawEvents) {
      logger.error('Failed to fetch events', undefined, 'EventsPage')
      throw new Error('Failed to fetch events')
    }

    const events = rawEvents.map(event => ({
      ...event,
      event_type:
        event.event_type as (typeof eventTypesEnum.enumValues)[number],
      created_at: toISOString(event.created_at),
      updated_at: toISOString(event.updated_at),
      event_date: toISOString(event.event_date),
      event_start_time: toISOString(event.event_start_time),
      event_end_time: toISOString(event.event_end_time)
    }))

    const metadata = {
      count: events.length,
      types: [...new Set(events.map(e => e.event_type))]
    }

    logger.info('Events fetched successfully', { metadata }, 'EventsPage')

    return (
      <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
        <EventsView events={events} />
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in events page',
      logger.errorWithData(error),
      'EventsPage'
    )
    throw error
  } finally {
    logger.timeEnd('events-page-load')
  }
}
