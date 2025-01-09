import type { DBUser } from './user'
import type { Training } from './training'

// Completion status enum from Schema
export type CompletionStatus = 'completed' | 'incomplete' | 'excused' | 'unexcused'

// Main interface representing a training assignment
export interface TrainingAssignment {
  id: number
  training_id: number
  user_id: string
  completion_status: CompletionStatus | null
  completion_notes: string | null
  created_at: string
  updated_at: string

  // Relations
  training?: Training
  user?: DBUser & {
    email: string
  }
}

// Type for creating new training assignments
export type NewTrainingAssignment = Omit<
  TrainingAssignment,
  'id' | 'created_at' | 'updated_at' | 'training' | 'user'
>

// Type for updating existing training assignments
export type UpdateTrainingAssignment = Partial<
  Omit<
    TrainingAssignment,
    'id' | 'created_at' | 'updated_at' | 'training' | 'user'
  >
>

// Required fields when creating new training assignments
export type RequiredTrainingAssignmentFields = Pick<
  TrainingAssignment,
  'training_id' | 'user_id'
>
