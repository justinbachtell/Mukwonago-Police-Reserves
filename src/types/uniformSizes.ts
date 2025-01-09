import type { DBUser } from './user';

// Main interface representing uniform sizes
export interface UniformSizes {
  id: number
  user_id: string
  shirt_size: string
  pant_size: string
  shoe_size: string
  notes: string | null
  is_current: boolean
  created_at: string
  updated_at: string

  // Relations
  user?: DBUser
}

// Type for creating new uniform sizes record
export type NewUniformSizes = Omit<
  UniformSizes,
  'id' | 'created_at' | 'updated_at' | 'user'
>

// Type for updating existing uniform sizes
export type UpdateUniformSizes = Partial<
  Omit<UniformSizes, 'id' | 'created_at' | 'updated_at' | 'user'>
>

// Required fields when creating new uniform sizes record
export type RequiredUniformSizesFields = Pick<
  UniformSizes,
  'user_id' | 'shirt_size' | 'pant_size' | 'shoe_size'
>
