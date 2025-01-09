import type { DBUser } from './user'
import type { Equipment } from './equipment'

// Equipment condition enum from Schema
export type EquipmentCondition = 'new' | 'good' | 'fair' | 'poor' | 'damaged/broken'

// Main interface representing an equipment assignment
export interface AssignedEquipment {
  id: number
  equipment_id: number
  user_id: string
  checked_out_at: string
  checked_in_at: string | null
  expected_return_date: string | null
  condition: EquipmentCondition
  notes: string | null
  created_at: string
  updated_at: string

  // Relation fields
  equipment?: Equipment
  user?: DBUser
}

// Type for creating new equipment assignments
// Excludes auto-generated and optional fields
export type NewAssignedEquipment = Omit<
  AssignedEquipment,
  'id' | 'created_at' | 'updated_at' | 'equipment' | 'user' | 'checked_in_at'
>

// Type for updating existing equipment assignments
// Makes all fields optional except id and timestamps
export type UpdateAssignedEquipment = Partial<
  Omit<
    AssignedEquipment,
    'id' | 'created_at' | 'updated_at' | 'equipment' | 'user'
  >
>

// Required fields when creating a new equipment assignment
export type RequiredAssignedEquipmentFields = Pick<
  AssignedEquipment,
  'equipment_id' | 'user_id' | 'condition' | 'checked_out_at'
>
