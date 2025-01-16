import { getTraining } from '@/actions/training'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { redirect, notFound } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { GraduationCap, Clock, MapPin, Calendar, PenSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import type { Route } from 'next'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'admin',
  file: 'training/[id]/page.tsx'
})

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function AdminTrainingPage({ params }: Props) {
  try {
    const { id } = await params
    const [user, training] = await Promise.all([
      getCurrentUser(),
      getTraining(Number.parseInt(id, 10))
    ])

    if (!user) {
      logger.warn('No user found', undefined, 'AdminTrainingPage')
      return redirect('/sign-in')
    }

    if (!training) {
      logger.warn('Training not found', { id }, 'AdminTrainingPage')
      return notFound()
    }

    return (
      <div className='container mx-auto py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
              Training Details
            </h1>
            <p className='text-gray-600 dark:text-gray-300'>
              View and manage training information
            </p>
          </div>
          <Link href={`/admin/training/edit/${training.id}` as Route}>
            <Button className='gap-2'>
              <PenSquare className='size-4' />
              Edit Training
            </Button>
          </Link>
        </div>

        <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
          <CardHeader className='border-b border-gray-100 dark:border-gray-800'>
            <div className='flex items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
                <GraduationCap className='size-6 text-purple-500' />
                {training.name}
              </CardTitle>
              <Badge
                variant='secondary'
                className='bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              >
                {formatEnumValueWithMapping(training.training_type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-6 p-6'>
            {/* Training Details */}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex items-center gap-2'>
                <Calendar className='size-5 text-gray-500' />
                <span className='text-sm'>
                  {format(new Date(training.training_date), 'MMMM d, yyyy')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='size-5 text-gray-500' />
                <span className='text-sm'>
                  {format(new Date(training.training_start_time), 'h:mm a')} -{' '}
                  {format(new Date(training.training_end_time), 'h:mm a')}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='size-5 text-gray-500' />
                <span className='text-sm'>{training.training_location}</span>
              </div>
            </div>

            {/* Description */}
            {training.description && (
              <div className='prose prose-gray dark:prose-invert max-w-none'>
                <h3 className='text-lg font-semibold'>Description</h3>
                <p className='text-gray-600 dark:text-gray-300'>
                  {training.description}
                </p>
              </div>
            )}

            {/* Instructor */}
            {training.instructor && (
              <div className='prose prose-gray dark:prose-invert max-w-none'>
                <h3 className='text-lg font-semibold'>Instructor</h3>
                <div className='flex items-center gap-2'>
                  <Avatar>
                    <AvatarFallback>
                      {training.instructor.first_name[0]}
                      {training.instructor.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-gray-600 dark:text-gray-300'>
                    {training.instructor.first_name}{' '}
                    {training.instructor.last_name}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading training page:',
      logger.errorWithData(error),
      'AdminTrainingPage'
    )
    return notFound()
  }
}
