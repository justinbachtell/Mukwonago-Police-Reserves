import type { Application } from './application'
import type { AssignedEquipment } from './assignedEquipment'
import type { EmergencyContact } from './emergencyContact'
import type { EventAssignment } from './eventAssignment'
import type { TrainingAssignment } from './trainingAssignment'
import type { UniformSizes } from './uniformSizes'

// Enum types from Schema
export type Role = 'admin' | 'member' | 'guest'
export type Position = 'candidate' | 'officer' | 'reserve' | 'admin' | 'staff'
export type Status = 'active' | 'inactive' | 'denied'

export interface DBUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  position: Position
  radio_number: string | null
  role: Role
  driver_license: string | null
  driver_license_state: string | null
  state: string | null
  street_address: string | null
  callsign: string | null
  city: string | null
  created_at: string
  updated_at: string
  zip_code: string | null
  status: Status
  // Relations
  applications?: Application[]
  assignedEquipment?: AssignedEquipment[]
  currentAssignedEquipment?: AssignedEquipment
  currentUniformSizes?: UniformSizes
  emergencyContacts?: EmergencyContact[]
  eventAssignments?: EventAssignment[]
  trainingAssignments?: TrainingAssignment[]
}
// Helper type for creating a new user
export type NewUser = Omit<
  DBUser,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'applications'
  | 'assignedEquipment'
  | 'currentAssignedEquipment'
  | 'currentUniformSizes'
  | 'emergencyContacts'
  | 'eventAssignments'
  | 'trainingAssignments'
>

// Helper type for user with required fields only
export type RequiredUserFields = Pick<DBUser, 'first_name' | 'last_name'>

// Auth session user (subset of DBUser used in auth context)
export interface AuthUser {
  id: string
  email: string
  role: Role
  position: Position
  status: Status
}

// Type for updating user data
export type UpdateUser = Partial<
  Omit<DBUser, 'id' | 'created_at' | 'updated_at'>
>

// Type for updating user settings
export interface UpdateSettingsData {
  email: string
  currentPassword?: string
  newPassword?: string
}

export function toDBUser(supabaseUser: any): DBUser | null {
  if (!supabaseUser) {
    return null
  }

  return {
    id: supabaseUser.id,
    first_name:
      supabaseUser.user_metadata?.given_name ||
      supabaseUser.user_metadata?.first_name ||
      '',
    last_name:
      supabaseUser.user_metadata?.family_name ||
      supabaseUser.user_metadata?.last_name ||
      '',
    email: supabaseUser.email,
    phone: supabaseUser.user_metadata?.phone || null,
    position: supabaseUser.user_metadata?.position || 'candidate',
    radio_number: supabaseUser.user_metadata?.radio_number || null,
    role: supabaseUser.user_metadata?.role || 'guest',
    driver_license: null,
    driver_license_state: null,
    state: null,
    street_address: null,
    callsign: null,
    city: null,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at || supabaseUser.created_at,
    zip_code: null,
    status: 'active'
  }
}