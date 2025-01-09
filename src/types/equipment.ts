import type { DBUser } from './user'
import type { AssignedEquipment } from './assignedEquipment'

// Main interface representing equipment
export interface Equipment {
  id: number
  name: string
  description: string | null
  serial_number: string | null
  purchase_date: string | null
  notes: string | null
  is_assigned: boolean
  assigned_to: string | null
  is_obsolete: boolean
  created_at: string
  updated_at: string

  // Relation fields
  assignedTo?: DBUser
  assignments?: AssignedEquipment[]
}

// Type for creating new equipment
// Excludes auto-generated and relation fields
export type NewEquipment = {
  name: string
  description?: string | null
  serial_number?: string | null
  purchase_date?: Date | null
  notes?: string | null
  is_obsolete: boolean
  is_assigned: boolean
  assigned_to?: string | null
}

// Type for updating existing equipment
// Makes all fields optional except id and timestamps
export type UpdateEquipment = Partial<
  Omit<
    Equipment,
    'id' | 'created_at' | 'updated_at' | 'assignedTo' | 'assignments'
  >
>

// Required fields when creating new equipment
export type RequiredEquipmentFields = Pick<
  Equipment,
  'name' | 'is_assigned' | 'is_obsolete'
>
