import { getTrainings } from '@/actions/training'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { TrainingTableWrapper } from '@/components/admin/training/TrainingTableWrapper'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'training/page.tsx'
})

export const metadata = {
  description: 'Manage training sessions and participants',
  title: 'Training Management'
}

export default async function TrainingManagementPage() {
  logger.info(
    'Rendering training management page',
    undefined,
    'TrainingManagementPage'
  )
  logger.time('training-page-load')

  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      logger.warn(
        'Unauthorized access attempt',
        { userId: user?.id },
        'TrainingManagementPage'
      )
      redirect('/')
    }

    logger.info('Fetching training data', undefined, 'TrainingManagementPage')
    const trainings = await getTrainings()
    logger.info(
      'Training data loaded',
      { count: trainings?.length },
      'TrainingManagementPage'
    )

    return (
      <div className='container space-y-6 py-6'>
        <TrainingTableWrapper initialData={trainings ?? []} />
      </div>
    )
  } catch (error) {
    logger.error(
      'Error in training management page',
      logger.errorWithData(error),
      'TrainingManagementPage'
    )
    throw error
  } finally {
    logger.timeEnd('training-page-load')
  }
}
