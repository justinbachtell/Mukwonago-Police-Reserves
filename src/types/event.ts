import type { EventAssignment } from './eventAssignment'

export const eventTypes = [
  'patrol',
  'training',
  'meeting',
  'community_event',
  'special_event'
] as const

export type EventType = (typeof eventTypes)[number]

export interface Event {
  id: number
  event_date: Date | string
  event_type: EventType
  event_location: string
  event_name: string
  event_start_time: Date | string
  event_end_time: Date | string
  notes: string | null
  created_at: Date | string
  updated_at: Date | string
  assignments?: EventAssignment[]
}
