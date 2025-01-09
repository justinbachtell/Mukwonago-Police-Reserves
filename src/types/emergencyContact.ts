import type { DBUser } from './user';

export interface EmergencyContact {
  id: number
  user_id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  relationship: string
  is_current: boolean
  street_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  created_at: Date | string
  updated_at: Date | string

  // Relations
  user?: DBUser
}

// Helper type for creating a new emergency contact
export type NewEmergencyContact = Omit<
  EmergencyContact,
  'id' | 'created_at' | 'updated_at' | 'user'
>

// Helper type for updating an emergency contact
export type UpdateEmergencyContact = Partial<
  Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at' | 'user'>
>

// Helper type for required emergency contact fields
export type RequiredEmergencyContactFields = Pick<
  EmergencyContact,
  'first_name' | 'last_name' | 'phone' | 'relationship' | 'user_id'
>
