import type { DBUser } from './user'
import type { Training } from './training'

export type CompletionStatus =
  | 'completed'
  | 'incomplete'
  | 'excused'
  | 'unexcused'

export interface TrainingAssignment {
  id: number
  user_id: number
  training_id: number
  completion_status?: CompletionStatus
  completion_notes: string | null
  created_at: string | Date
  updated_at: string | Date
  user?: Partial<DBUser>
  training?: Training
}
