'use client'

import type { Training } from '@/types/training'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { TrainingSignUpButton } from './TrainingSignUpButton'

interface TrainingGridProps {
  data: Training[]
}

export function TrainingGrid({ data }: TrainingGridProps) {
  return (
    <div className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {data.map(training => (
        <Card key={training.id} className='flex flex-col'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  {training.name}
                </h3>
                <Badge variant='outline' className='mt-2 capitalize'>
                  {training.training_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex-grow space-y-4'>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <CalendarDays className='size-4' />
              <span>
                {format(new Date(training.training_date), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <Clock className='size-4' />
              <span>
                {format(new Date(training.training_start_time), 'h:mm a')} -{' '}
                {format(new Date(training.training_end_time), 'h:mm a')}
              </span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
              <MapPin className='size-4' />
              <span>{training.training_location}</span>
            </div>
            {training.description && (
              <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                {training.description}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <TrainingSignUpButton training={training} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
