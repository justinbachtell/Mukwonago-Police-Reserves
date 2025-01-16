import { getEventById } from '@/actions/event'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { redirect, notFound } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { CalendarDays, Clock, MapPin, PenSquare } from 'lucide-react'
import Link from 'next/link'
import type { Route } from 'next'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'admin',
  file: 'events/[id]/page.tsx'
})

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEventPage({ params }: Props) {
  try {
    const { id } = await params
    const [user, event] = await Promise.all([
      getCurrentUser(),
      getEventById(Number.parseInt(id, 10))
    ])

    if (!user) {
      logger.warn('No user found', undefined, 'AdminEventPage')
      return redirect('/sign-in')
    }

    if (!event) {
      logger.warn('Event not found', { id }, 'AdminEventPage')
      return notFound()
    }

    return (
      <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              Event Details
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              View and manage event information
            </p>
          </div>
          <Link href={`/admin/events/edit/${event.id}` as Route}>
            <Button className='gap-2'>
              <PenSquare className='size-4' />
              Edit Event
            </Button>
          </Link>
        </div>

        <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
          <CardHeader className='border-b border-gray-100 dark:border-gray-800'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
                <CalendarDays className='size-6 text-green-500' />
                {event.event_name}
              </CardTitle>
              <Badge
                variant='secondary'
                className='bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              >
                {formatEnumValueWithMapping(event.event_type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-6 p-6'>
            {/* Event Details */}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-2'>
                <CalendarDays className='size-5 text-gray-500' />
                <span className='text-sm'>
                  {format(new Date(event.event_date), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='size-5 text-gray-500' />
                <span className='text-sm'>
                  {format(new Date(event.event_start_time), 'h:mm a')} -{' '}
                  {format(new Date(event.event_end_time), 'h:mm a')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='size-5 text-gray-500' />
                <span className='text-sm'>{event.event_location}</span>
              </div>
            </div>

            {/* Notes */}
            {event.notes && (
              <div className='prose prose-gray dark:prose-invert max-w-none'>
                <h3 className='text-lg font-semibold'>Notes</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  {event.notes}
                </p>
              </div>
            )}

            {/* Participants */}
            <div className='prose prose-gray dark:prose-invert max-w-none'>
              <h3 className='text-lg font-semibold'>Participants</h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Required: {event.min_participants} - {event.max_participants}{' '}
                participants
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading event page:',
      logger.errorWithData(error),
      'AdminEventPage'
    )
    return notFound()
  }
}
