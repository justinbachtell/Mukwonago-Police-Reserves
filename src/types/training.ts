import type { DBUser } from './user'
import type { TrainingAssignment } from './trainingAssignment'

export const trainingTypes = [
  'firearms',
  'defensive_tactics',
  'emergency_vehicle_operations',
  'first_aid',
  'legal_updates',
  'other'
] as const

export type TrainingType = (typeof trainingTypes)[number]

export type TrainingInstructor = Pick<DBUser, 'id' | 'first_name' | 'last_name'>

export interface Training {
  id: number
  name: string
  description: string | null
  training_date: Date | string
  training_location: string
  training_type: TrainingType
  training_instructor: number
  training_start_time: Date | string
  training_end_time: Date | string
  created_at: Date | string
  updated_at: Date | string
  instructor?: TrainingInstructor | null
  assignments?: TrainingAssignment[]
}
