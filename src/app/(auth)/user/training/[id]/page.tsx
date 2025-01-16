import {
  createTrainingAssignment,
  leaveTraining
} from '@/actions/trainingAssignment'
import { getCurrentUser } from '@/actions/user'
import { getTraining } from '@/actions/training'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { revalidatePath } from 'next/cache'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CalendarDays, MapPin, Clock, GraduationCap } from 'lucide-react'
import { formatEnumValueWithMapping } from '@/lib/format-enums'

const logger = createLogger({
  module: 'training',
  file: 'training/[id]/page.tsx'
})

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function TrainingPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const training = await getTraining(Number(id))
  if (!training) {
    return notFound()
  }

  const isAssigned = training.assignments?.some(
    assignment => assignment.user?.id === user.id
  )
  const isLocked = training.is_locked
  const canSignUp = !isLocked || (isLocked && isAssigned)

  return (
    <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
      <Card className='border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-white/5'>
        <CardHeader className='border-b border-gray-100 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
              <GraduationCap className='size-6 text-purple-500' />
              {training.name}
            </CardTitle>
            <div className='flex items-center gap-4'>
              <Badge
                variant='secondary'
                className='bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              >
                {formatEnumValueWithMapping(training.training_type)}
              </Badge>
              <form
                action={async () => {
                  'use server'

                  try {
                    if (isAssigned) {
                      // Leave training
                      const result = await leaveTraining(training.id)
                      if (!result) {
                        throw new Error('Failed to leave training')
                      }
                    } else {
                      // Sign up for training
                      const result = await createTrainingAssignment({
                        training_id: training.id,
                        user_id: user.id
                      })
                      if (!result) {
                        throw new Error('Failed to sign up for training')
                      }
                    }

                    // Revalidate both pages
                    revalidatePath(`/user/training/${training.id}`)
                    revalidatePath('/user/training')
                  } catch (error: any) {
                    logger.error(
                      'Failed to update training assignment',
                      logger.errorWithData(error),
                      'TrainingPage'
                    )

                    // Check if this is a duplicate signup error
                    if (
                      error.message?.includes('duplicate key value') ||
                      error.code === '23505'
                    ) {
                      throw new Error(
                        'You are already signed up for this training'
                      )
                    }

                    throw error
                  }
                }}
              >
                <Button
                  type='submit'
                  variant={isAssigned ? 'destructive' : 'default'}
                  disabled={!isAssigned && !canSignUp}
                >
                  {isAssigned
                    ? 'Leave Training'
                    : isLocked
                      ? 'Restricted Training'
                      : 'Sign Up'}
                </Button>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6 p-6'>
          {/* Training Details */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='flex items-center gap-2'>
              <CalendarDays className='size-5 text-gray-500' />
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
        </CardContent>
      </Card>
    </div>
  )
}
