import type { DBUser } from './user'

// Enum types from Schema
export type PriorExperience =
  | 'none'
  | 'less_than_1_year'
  | '1_to_3_years'
  | 'more_than_3_years'
export type Availability = 'weekdays' | 'weekends' | 'both' | 'flexible'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type Position = 'candidate' | 'officer' | 'reserve' | 'admin' | 'staff'

export interface Application {
  id: number
  availability: Availability
  city: string
  created_at: string
  driver_license: string
  driver_license_state: string
  email: string
  first_name: string
  last_name: string
  phone: string
  position: Position
  prior_experience: PriorExperience
  resume: string | null
  state: string
  status: ApplicationStatus
  street_address: string
  updated_at: string
  user_id: string
  zip_code: string

  // Relations
  user?: DBUser
}

// Helper type for creating a new application
export type NewApplication = Omit<
  Application,
  'id' | 'created_at' | 'updated_at' | 'user' | 'status'
>

// Helper type for updating an application
export type UpdateApplication = Partial<NewApplication>

// Helper type for required application fields
export type RequiredApplicationFields = Pick<
  Application,
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'driver_license'
  | 'driver_license_state'
  | 'street_address'
  | 'city'
  | 'state'
  | 'zip_code'
  | 'prior_experience'
  | 'availability'
  | 'position'
>

// Type for creating new applications with required data
export type CreateApplicationData = RequiredApplicationFields & {
  user_id: string
  resume?: string
}
