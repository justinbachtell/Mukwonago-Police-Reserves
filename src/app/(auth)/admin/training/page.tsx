import { Suspense } from 'react'
import { AdminTrainingContent } from './content'
import { getTrainings } from '@/actions/training'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'training/page.tsx'
})

export default async function AdminTrainingPage() {
  try {
    const trainings = await getTrainings()
    logger.info(
      'Fetched trainings for page',
      { count: trainings?.length ?? 0 },
      'AdminTrainingPage'
    )

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminTrainingContent initialTrainings={trainings ?? []} />
      </Suspense>
    )
  } catch (error) {
    logger.error(
      'Error fetching trainings for page',
      logger.errorWithData(error),
      'AdminTrainingPage'
    )
    throw error
  }
}
