import type { Application } from './application'
import type { AssignedEquipment } from './assignedEquipment'
import type { UniformSizes } from './uniformSizes'

export interface DBUser {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string | null
  driver_license: string | null
  driver_license_state: string | null
  street_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  created_at: Date | string
  updated_at: Date | string
  clerk_id: string
  role: string
  position: string
  callsign: string | null
  radio_number: string | null
  applications?: Application | null
  currentUniformSizes?: UniformSizes
  assignedEquipment?: AssignedEquipment | null
}
