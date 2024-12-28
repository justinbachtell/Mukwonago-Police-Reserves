import type { application } from '@/models/Schema';

export type Application = {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  driver_license: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  prior_experience: typeof application.$inferSelect.prior_experience;
  availability: typeof application.$inferSelect.availability;
  resume: string | null;
  position: typeof application.$inferSelect.position;
  status: typeof application.$inferSelect.status;
  created_at: Date;
  updated_at: Date;
};
