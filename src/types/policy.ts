export type Policy = {
  id: number
  name: string
  description: string | null
  policy_type: string
  policy_number: string
  policy_url: string
  effective_date: string
  created_at: string
  updated_at: string
}

export type PolicyCompletion = {
  id: number
  policy_id: number
  user_id: number
  created_at: string
  updated_at: string
}
