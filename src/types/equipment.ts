export interface Equipment {
  id: number
  name: string
  description: string | null
  serial_number: string | null
  purchase_date: Date | null
  notes: string | null
  is_assigned: boolean
  assigned_to: number | null
  is_obsolete: boolean
  created_at: Date
  updated_at: Date
}
