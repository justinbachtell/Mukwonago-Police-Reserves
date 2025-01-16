import { getTrainings } from '@/actions/training'
import { TrainingView } from '@/components/reserves/training/TrainingView'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'training',
  file: 'page.tsx'
})

// export const dynamic = 'force-dynamic'
// export const revalidate = 0

export const metadata = {
  title: 'Training - Mukwonago Police Reserves',
  description: 'View and manage reserve police training sessions'
}

export default async function TrainingPage() {
  logger.info('Rendering training page', undefined, 'TrainingPage')
  logger.time('training-page-load')

  try {
    logger.info('Fetching trainings', undefined, 'TrainingPage')
    const trainings = await getTrainings()
    logger.info(
      'Trainings fetched',
      { count: trainings?.length },
      'TrainingPage'
    )
    return (
      <div className='container relative mx-auto overflow-hidden bg-white dark:bg-gray-950'>
        <TrainingView training={trainings ?? []} />
      </div>
    )
  } catch (error) {
    logger.error(
      'Error fetching trainings',
      logger.errorWithData(error),
      'TrainingPage'
    )
    throw error
  } finally {
    logger.timeEnd('training-page-load')
  }
}
