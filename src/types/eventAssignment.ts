import type { CompletionStatus } from './trainingAssignment'
import type { DBUser } from './user'

export type { CompletionStatus }

export interface EventAssignment {
  id: number
  event_id: number
  user_id: number
  created_at: string | Date
  updated_at: string | Date
  completion_status: CompletionStatus | null | undefined
  completion_notes: string | null
  user: Partial<DBUser>
}
