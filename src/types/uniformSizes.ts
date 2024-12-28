import type { DBUser } from './user';

export type UniformSizes = {
  id: number;
  user_id: number;
  shirt_size: string;
  pant_size: string;
  shoe_size: string;
  notes: string | null;
  is_current: boolean;
  created_at: Date;
  updated_at: Date;
  user?: DBUser;
};
