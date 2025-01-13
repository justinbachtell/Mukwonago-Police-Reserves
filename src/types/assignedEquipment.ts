import type { Equipment } from './equipment'

export type EquipmentCondition =
  | 'new'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged/broken'

export interface AssignedEquipment {
  id: number
  user_id: string
  equipment_id: number
  equipment: Equipment | null
  condition: EquipmentCondition
  notes: string | null
  checked_out_at: string
  checked_in_at: string | null
  expected_return_date: string | null
  created_at: string
  updated_at: string
}
