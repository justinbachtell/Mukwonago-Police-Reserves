export interface Policy {
  id: number
  name: string
  description: string | null
  policy_type: string
  policy_number: string
  policy_url: string
  effective_date: Date
  created_at: Date
  updated_at: Date
}
