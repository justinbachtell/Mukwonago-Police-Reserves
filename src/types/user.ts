import type { user } from '@/models/Schema';
import type { Application } from './application';
import type { EquipmentAssignment } from './assignedEquipment';
import type { UniformSizes } from './uniformSizes';

export type DBUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  driver_license: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
  clerk_id: string;
  role: typeof user.$inferSelect.role;
  position: typeof user.$inferSelect.position;
  applications?: Application | null;
  currentUniformSizes?: UniformSizes | null;
  assignedEquipment?: EquipmentAssignment | null;
};
