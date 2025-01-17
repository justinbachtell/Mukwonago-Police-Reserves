import { getAllEvents } from '@/actions/event'
import { EventsView } from '@/components/reserves/events/EventsView'
import { createLogger } from '@/lib/debug'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { toISOString } from '@/lib/utils'
import type { eventTypesEnum } from '@/models/Schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

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

    // Calculate event statistics
    const now = new Date()
    const upcomingEvents = events.filter(
      event => new Date(event.event_date) > now
    ).length
    const pastEvents = events.filter(
      event => new Date(event.event_date) <= now
    ).length
    const totalEvents = events.length

    const metadata = {
      count: events.length,
      types: [...new Set(events.map(e => e.event_type))]
    }

    logger.info('Events fetched successfully', { metadata }, 'EventsPage')

    return (
      <div className='container mx-auto min-h-screen px-4 pt-4 md:px-6 lg:px-10'>
        {/* Stats Card */}
        <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarDays className='size-5 text-green-500' />
              Event Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4 sm:grid-cols-3'>
            <div>
              <p className='text-sm text-muted-foreground'>Total Events</p>
              <p className='mt-1 text-2xl font-bold'>{totalEvents}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Upcoming Events</p>
              <p className='mt-1 text-2xl font-bold'>{upcomingEvents}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Past Events</p>
              <p className='mt-1 text-2xl font-bold'>{pastEvents}</p>
            </div>
          </CardContent>
        </Card>

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
