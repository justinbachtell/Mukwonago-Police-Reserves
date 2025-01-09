import type { DBUser } from './user'
import type { Event } from './event'

// Completion status enum from Schema
export type CompletionStatus = 'completed' | 'incomplete' | 'excused' | 'unexcused'

// Main interface representing an event assignment
export interface EventAssignment {
  id: number
  event_id: number
  user_id: string
  completion_status: CompletionStatus | null
  completion_notes: string | null
  created_at: string
  updated_at: string

  // Relations
  event?: Event
  user?: DBUser
}

// Type for creating new event assignments
// Excludes auto-generated and relation fields
export type NewEventAssignment = Omit<
  EventAssignment,
  'id' | 'created_at' | 'updated_at' | 'event' | 'user' | 'completion_status'
>

// Type for updating existing event assignments
// Makes all fields optional except id and timestamps
export type UpdateEventAssignment = Partial<
  Omit<EventAssignment, 'id' | 'created_at' | 'updated_at' | 'event' | 'user'>
>

// Required fields when creating new event assignments
export type RequiredEventAssignmentFields = Pick<
  EventAssignment,
  'event_id' | 'user_id'
>
