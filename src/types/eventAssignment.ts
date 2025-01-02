import type { DBUser } from './user'
import type { Event } from './event'

export interface EventAssignment {
  id: number
  user_id: number
  event_id: number
  created_at: string
  updated_at: string
  user?: DBUser
  event?: Event
}
