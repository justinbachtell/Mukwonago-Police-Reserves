'use client'

import type { TrainingAssignment } from '@/types/trainingAssignment'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, Clock, MapPin, User } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface UserTrainingGridProps {
  data: TrainingAssignment[]
}

export function UserTrainingGrid({ data }: UserTrainingGridProps) {
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'table'

  if (view !== 'grid') {
    return null
  }

  // Sort training: future training first, then past training
  const sortedTraining = [...data].sort((a, b) => {
    if (!a.training || !b.training) {
      return 0
    }
    const now = new Date()
    const aDate = new Date(a.training.training_date)
    const bDate = new Date(b.training.training_date)
    const aIsFuture = aDate >= now
    const bIsFuture = bDate >= now

    if (aIsFuture && !bIsFuture) {
      return -1
    }
    if (!aIsFuture && bIsFuture) {
      return 1
    }

    if (aIsFuture) {
      // Both are future training, sort by closest first
      return aDate.getTime() - bDate.getTime()
    } else {
      // Both are past training, sort by most recent first
      return bDate.getTime() - aDate.getTime()
    }
  })

  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {sortedTraining.map(assignment => (
        <Card
          key={assignment.id}
          className='flex flex-col bg-white/80 shadow-md transition-all hover:shadow-lg dark:bg-white/5'
        >
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  {assignment.training?.name}
                </h3>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {assignment.training?.training_type && (
                    <Badge variant='outline' className='capitalize'>
                      {assignment.training.training_type.replace('_', ' ')}
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
            {assignment.training && (
              <>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <CalendarDays className='size-4' />
                  <span>
                    {format(
                      new Date(assignment.training.training_date),
                      'MMMM d, yyyy'
                    )}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <Clock className='size-4' />
                  <span>
                    {format(
                      new Date(assignment.training.training_start_time),
                      'h:mm a'
                    )}{' '}
                    -{' '}
                    {format(
                      new Date(assignment.training.training_end_time),
                      'h:mm a'
                    )}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                  <MapPin className='size-4' />
                  <span>{assignment.training.training_location}</span>
                </div>
                {assignment.training.instructor && (
                  <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                    <User className='size-4' />
                    <span>
                      {assignment.training.instructor.first_name}{' '}
                      {assignment.training.instructor.last_name}
                    </span>
                  </div>
                )}
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
