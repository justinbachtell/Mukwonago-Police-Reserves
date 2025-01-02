import { getAllTraining } from '@/actions/training'
import { TrainingView } from '@/components/reserves/training/TrainingView'
import type { TrainingType } from '@/types/training'

export default async function TrainingPage() {
  const rawTraining = await getAllTraining()

  const training = rawTraining.map(t => ({
    ...t,
    created_at: new Date(t.created_at),
    training_date: new Date(t.training_date),
    training_end_time: new Date(t.training_end_time),
    training_start_time: new Date(t.training_start_time),
    updated_at: new Date(t.updated_at),
    training_type: t.training_type as TrainingType
  }))

  return <TrainingView training={training} />
}
