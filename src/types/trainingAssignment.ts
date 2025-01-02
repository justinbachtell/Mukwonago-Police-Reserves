import type { DBUser } from './user'
import type { Training } from './training'

export interface TrainingAssignment {
  id: number
  user_id: number
  training_id: number
  created_at: Date | string
  updated_at: Date | string
  user?: DBUser
  training?: Training
}
