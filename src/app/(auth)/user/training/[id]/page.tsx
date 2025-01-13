import { notFound } from 'next/navigation'
import { getTraining } from '@/actions/training'
import { getCurrentUser } from '@/actions/user'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, MapPin, Clock, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'training',
  file: 'user/training/[id]/page.tsx'
})

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TrainingPage({ params }: PageProps) {
  try {
    logger.time('training-page-load')
    const user = await getCurrentUser()
    if (!user) {
      logger.error('No user found', undefined, 'TrainingPage')
      return notFound()
    }

    // Validate and parse the ID before using it
    const { id } = await params
    const trainingId = Number.parseInt(id, 10)
    if (Number.isNaN(trainingId)) {
      logger.error('Invalid training ID', { id }, 'TrainingPage')
      return notFound()
    }

    const training = await getTraining(trainingId)
    if (!training) {
      logger.error('Training not found', { id: trainingId }, 'TrainingPage')
      return notFound()
    }

    logger.timeEnd('training-page-load')

    return (
      <div className='container mx-auto py-8'>
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
                {training.training_type}
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
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    logger.error(
      'Error loading training:',
      logger.errorWithData(error),
      'TrainingPage'
    )
    return notFound()
  }
}

// Add generateMetadata for better SEO and to handle params properly
export async function generateMetadata({ params }: PageProps) {
  try {
    // Validate and parse the ID
    const { id } = await params
    const trainingId = Number.parseInt(id, 10)
    if (Number.isNaN(trainingId)) {
      logger.error('Invalid training ID', { id }, 'generateMetadata')
      return {
        title: 'Training Not Found'
      }
    }

    const training = await getTraining(trainingId)
    if (!training) {
      logger.error('Training not found', { id: trainingId }, 'generateMetadata')
      return {
        title: 'Training Not Found'
      }
    }

    return {
      title: `Training - ${training.name}`,
      description:
        training.description || `Training session for ${training.training_type}`
    }
  } catch (error) {
    logger.error(
      'Error generating metadata',
      logger.errorWithData(error),
      'generateMetadata'
    )
    return {
      title: 'Training Not Found'
    }
  }
}
