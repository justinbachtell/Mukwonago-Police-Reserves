import type { EventAssignment } from './eventAssignment'
import type { eventTypesEnum } from '@/models/Schema'

// Main interface representing an event in the system
export interface Event {
  id: number
  event_date: string
  event_type: (typeof eventTypesEnum.enumValues)[number]
  event_location: string
  event_name: string
  event_start_time: string
  event_end_time: string
  notes: string | null
  min_participants: number
  max_participants: number
  created_at: string
  updated_at: string

  // Relations
  assignments?: EventAssignment[]
}

// Type for creating new events
// Excludes auto-generated and relation fields
export type NewEvent = {
  event_name: string
  event_type: (typeof eventTypesEnum.enumValues)[number]
  event_location: string
  event_date: Date
  event_start_time: Date
  event_end_time: Date
  notes: string | null
  min_participants: number
  max_participants: number
}

// Type for updating existing events
export type UpdateEvent = Partial<{
  event_name: string
  event_type: (typeof eventTypesEnum.enumValues)[number]
  event_location: string
  event_date: Date
  event_start_time: Date
  event_end_time: Date
  notes: string | null
  min_participants: number
  max_participants: number
}>

// Required fields when creating new events
export type RequiredEventFields = Pick<
  Event,
  | 'event_date'
  | 'event_type'
  | 'event_location'
  | 'event_name'
  | 'event_start_time'
  | 'event_end_time'
  | 'min_participants'
  | 'max_participants'
>
