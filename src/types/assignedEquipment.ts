import type { assignedEquipment } from '@/models/Schema';
import type { Equipment } from './equipment';
import type { DBUser } from './user';

export type EquipmentAssignment = {
  id: number;
  user_id: number;
  equipment_id: number;
  condition: typeof assignedEquipment.$inferSelect.condition;
  checked_out_at: string;
  checked_in_at: string | null;
  expected_return_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: DBUser;
  equipment?: Equipment;
};
