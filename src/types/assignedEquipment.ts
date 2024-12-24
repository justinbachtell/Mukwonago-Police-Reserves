import type { Equipment } from './equipment';

export type AssignedEquipment = {
  id: number;
  equipment_id: number;
  user_id: number;
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged/broken';
  notes: string | null;
  checked_out_at: string;
  checked_in_at: string | null;
  expected_return_date: string | null;
  created_at: string;
  updated_at: string;
  equipment: Equipment | null;
};
