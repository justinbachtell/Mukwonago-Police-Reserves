import type { DBUser } from './user'

// Main interface representing a policy
export interface Policy {
  id: number
  name: string
  description: string | null
  policy_type: string
  policy_number: string
  policy_url: string
  effective_date: string
  created_at: string
  updated_at: string

  // Relations
  completions?: PolicyCompletion[]
}

// Interface representing a policy completion record
export interface PolicyCompletion {
  id: number
  policy_id: number
  user_id: string
  created_at: string
  updated_at: string

  // Relations
  policy?: Policy
  user?: DBUser
}

// Type for creating new policies
export type NewPolicy = Omit<
  Policy,
  'id' | 'created_at' | 'updated_at' | 'completions'
>

// Type for updating existing policies
export type UpdatePolicy = Partial<
  Omit<Policy, 'id' | 'created_at' | 'updated_at' | 'completions'>
>

// Required fields when creating new policies
export type RequiredPolicyFields = Pick<
  Policy,
  'name' | 'policy_type' | 'policy_number' | 'policy_url' | 'effective_date'
>

// Type for creating new policy completions
export type NewPolicyCompletion = Omit<
  PolicyCompletion,
  'id' | 'created_at' | 'updated_at' | 'policy' | 'user'
>

// Type for updating existing policy completions
export type UpdatePolicyCompletion = Partial<
  Omit<PolicyCompletion, 'id' | 'created_at' | 'updated_at' | 'policy' | 'user'>
>

// Required fields when creating new policy completions
export type RequiredPolicyCompletionFields = Pick<
  PolicyCompletion,
  'policy_id' | 'user_id'
>
