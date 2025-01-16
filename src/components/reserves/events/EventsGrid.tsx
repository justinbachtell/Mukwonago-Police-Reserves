'use client'

import type { Event } from '@/types/event'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { EventSignUpButton } from './EventSignUpButton'
import Link from 'next/link'

interface EventsGridProps {
  data: Event[]
}

export function EventsGrid({ data }: EventsGridProps) {
  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {data.map(event => (
        <Card key={event.id} className='flex flex-col'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='flex flex-col'>
                <Link
                  href={`/user/events/${event.id}`}
                  className='text-xl font-semibold text-gray-900 hover:underline dark:text-white'
                >
                  {event.event_name}
                </Link>
                <Badge variant='outline' className='mt-2 w-fit capitalize'>
                  {event.event_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='grow space-y-4'>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <CalendarDays className='size-4' />
              <span>{format(new Date(event.event_date), 'MMMM d, yyyy')}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <Clock className='size-4' />
              <span>
                {format(new Date(event.event_start_time), 'h:mm a')} -{' '}
                {format(new Date(event.event_end_time), 'h:mm a')}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <MapPin className='size-4' />
              <span>{event.event_location}</span>
            </div>
            {event.notes && (
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                {event.notes}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <EventSignUpButton event={event} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
