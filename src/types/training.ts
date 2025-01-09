import type { DBUser } from './user'
import type { TrainingAssignment } from './trainingAssignment'

// Main interface representing a training session
export interface Training {
  id: number
  name: string
  description: string | null
  training_date: string
  training_location: string
  training_type: string
  training_instructor: string
  training_start_time: string
  training_end_time: string
  created_at: string
  updated_at: string

  // Relations
  assignments?: TrainingAssignment[]
  instructor?: DBUser
}

// Type for creating new training sessions
export type NewTraining = Omit<
  Training,
  'id' | 'created_at' | 'updated_at' | 'assignments' | 'instructor'
>

// Type for updating existing training sessions
export type UpdateTraining = Partial<
  Omit<
    Training,
    'id' | 'created_at' | 'updated_at' | 'assignments' | 'instructor'
  >
>

// Required fields when creating new training sessions
export type RequiredTrainingFields = Pick<
  Training,
  | 'name'
  | 'training_date'
  | 'training_location'
  | 'training_type'
  | 'training_instructor'
  | 'training_start_time'
  | 'training_end_time'
>
