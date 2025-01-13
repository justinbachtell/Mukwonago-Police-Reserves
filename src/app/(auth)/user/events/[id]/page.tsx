import { notFound } from 'next/navigation'
import { getEventById } from '@/actions/event'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function EventPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const event = await getEventById(Number.parseInt(id))
  if (!event) {
    return notFound()
  }

  return (
    <div className='container mx-auto py-8'>
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
              {event.event_type}
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
            <div className='flex items-center gap-2'>
              <Users className='size-5 text-gray-500' />
              <span className='text-sm'>
                {event.min_participants} - {event.max_participants} participants
              </span>
            </div>
          </div>

          {/* Notes */}
          {event.notes && (
            <div className='prose prose-gray dark:prose-invert max-w-none'>
              <h3 className='text-lg font-semibold'>Notes</h3>
              <p className='text-gray-600 dark:text-gray-300'>{event.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
