import type { DBUser } from './user'
import type { training } from '@/models/Schema'

export type TrainingType = (typeof training.training_type.enumValues)[number]

export interface Training {
  id: number
  name: string
  description: string | null
  training_date: string | Date
  training_location: string
  training_type: TrainingType
  training_instructor: number
  training_start_time: string | Date
  training_end_time: string | Date
  created_at: string | Date
  updated_at: string | Date
  assignments?: {
    completion_status:
      | 'completed'
      | 'incomplete'
      | 'excused'
      | 'unexcused'
      | null
    created_at: string
    id: number
    updated_at: string
    user_id: number
    completion_notes: string | null
    training_id: number
    user: DBUser
  }[]
  instructor?: Partial<DBUser>
}
