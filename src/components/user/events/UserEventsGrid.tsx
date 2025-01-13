'use client'

import type { EventAssignment } from '@/types/eventAssignment'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface UserEventsGridProps {
  data: EventAssignment[]
}

export function UserEventsGrid({ data }: UserEventsGridProps) {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'table'

  if (view !== 'grid') {
    return null
  }

  // Sort events: future events first, then past events
  const sortedEvents = [...data].sort((a, b) => {
    if (!a.event || !b.event) {
      return 0
    }
    const now = new Date()
    const aDate = new Date(a.event.event_date)
    const bDate = new Date(b.event.event_date)
    const aIsFuture = aDate >= now
    const bIsFuture = bDate >= now

    if (aIsFuture && !bIsFuture) {
      return -1
    }
    if (!aIsFuture && bIsFuture) {
      return 1
    }

    if (aIsFuture) {
      // Both are future events, sort by closest first
      return aDate.getTime() - bDate.getTime()
    } else {
      // Both are past events, sort by most recent first
      return bDate.getTime() - aDate.getTime()
    }
  })

  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {sortedEvents.map(assignment => (
        <Card
          key={assignment.id}
          className='flex flex-col bg-white/80 shadow-md transition-all hover:shadow-lg dark:bg-white/5'
        >
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  {assignment.event?.event_name}
                </h3>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {assignment.event?.event_type && (
                    <Badge variant='outline' className='capitalize'>
                      {assignment.event.event_type.replace('_', ' ')}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      assignment.completion_status === 'completed'
                        ? 'default'
                        : 'secondary'
                    }
                    className='capitalize'
                  >
                    {assignment.completion_status || 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex grow flex-col space-y-4'>
            {assignment.event && (
              <>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <CalendarDays className='size-4' />
                  <span>
                    {format(
                      new Date(assignment.event.event_date),
                      'MMMM d, yyyy'
                    )}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <Clock className='size-4' />
                  <span>
                    {format(
                      new Date(assignment.event.event_start_time),
                      'h:mm a'
                    )}{' '}
                    -{' '}
                    {format(
                      new Date(assignment.event.event_end_time),
                      'h:mm a'
                    )}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <MapPin className='size-4' />
                  <span>{assignment.event.event_location}</span>
                </div>
              </>
            )}
            {assignment.completion_notes && (
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                {assignment.completion_notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
