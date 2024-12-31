import type { DBUser } from './user';

export interface EmergencyContact {
  id: number
  user_id: number
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
  created_at: Date
  updated_at: Date
  user?: DBUser | undefined
}
