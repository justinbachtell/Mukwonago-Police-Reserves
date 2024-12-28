import type { equipmentConditionEnum } from '@/models/Schema';

export type CreateAssignedEquipmentData = {
  equipment_id: number;
  user_id: number;
  condition: typeof equipmentConditionEnum.enumValues[number];
  notes?: string;
  checked_out_at?: string;
  expected_return_date?: string;
};

export type AssignedEquipment = {
  id: number;
  user_id: number;
  equipment_id: number;
  condition: typeof equipmentConditionEnum.enumValues[number];
  checked_out_at: Date;
  checked_in_at: Date | null;
  expected_return_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  equipment?: {
    id: number;
    name: string;
    description: string | null;
    serial_number: string | null;
    purchase_date: Date | null;
    notes: string | null;
    is_assigned: boolean;
    assigned_to: number | null;
    created_at: Date;
    updated_at: Date;
    is_obsolete: boolean;
  } | null;
};
