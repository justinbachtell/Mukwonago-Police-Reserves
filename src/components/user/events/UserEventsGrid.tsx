'use client'

import type { EventAssignment } from '@/types/eventAssignment'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

interface UserEventsGridProps {
  data: EventAssignment[]
}

export function UserEventsGrid({ data }: UserEventsGridProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {data.map(assignment => (
        <Card
          key={assignment.id}
          className='bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'
        >
          <CardHeader className='border-b border-gray-100 dark:border-gray-800'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>
                {assignment.event?.event_name}
              </h3>
              <Badge variant='secondary' className='font-medium'>
                {formatEnumValueWithMapping(assignment.event?.event_type || '')}
              </Badge>
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
