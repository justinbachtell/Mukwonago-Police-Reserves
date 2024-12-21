'use server';

import type { equipmentConditionEnum } from '@/models/Schema';
import { db } from '@/libs/DB';
import { assignedEquipment, equipment } from '@/models/Schema';
import { and, eq } from 'drizzle-orm';

export type CreateEquipmentAssignmentData = {
  equipment_id: number;
  user_id: number;
  condition: typeof equipmentConditionEnum.enumValues[number];
  notes?: string;
  checked_out_at?: string;
  expected_return_date?: string;
};

export async function createEquipmentAssignment(data: CreateEquipmentAssignmentData) {
  try {
    // Check if equipment is already assigned to the user
    const existingAssignment = await db
      .select()
      .from(assignedEquipment)
      .where(
        and(
          eq(assignedEquipment.equipment_id, data.equipment_id),
          eq(assignedEquipment.user_id, data.user_id),
        ),
      );

    if (existingAssignment.length > 0) {
      throw new Error('Equipment is already assigned to this user');
    }

    // Create the equipment assignment
    await db.insert(assignedEquipment).values({
      ...data,
      checked_out_at: data.checked_out_at || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating equipment assignment:', error);
    throw new Error('Failed to create equipment assignment');
  }
}

export async function getAssignedEquipment(userId: number) {
  try {
    const assignments = await db
      .select({
        id: assignedEquipment.id,
        equipment_id: assignedEquipment.equipment_id,
        user_id: assignedEquipment.user_id,
        condition: assignedEquipment.condition,
        notes: assignedEquipment.notes,
        checked_out_at: assignedEquipment.checked_out_at,
        checked_in_at: assignedEquipment.checked_in_at,
        expected_return_date: assignedEquipment.expected_return_date,
        created_at: assignedEquipment.created_at,
        updated_at: assignedEquipment.updated_at,
        equipment: {
          id: equipment.id,
          name: equipment.name,
          description: equipment.description,
          serial_number: equipment.serial_number,
          purchase_date: equipment.purchase_date,
          notes: equipment.notes,
        },
      })
      .from(assignedEquipment)
      .leftJoin(equipment, eq(assignedEquipment.equipment_id, equipment.id))
      .where(eq(assignedEquipment.user_id, userId));

    return assignments;
  } catch (error) {
    console.error('Error getting equipment assignments:', error);
    throw new Error('Failed to get equipment assignments');
  }
}

export async function updateEquipmentAssignment(
  assignmentId: number,
  data: Partial<Omit<CreateEquipmentAssignmentData, 'equipment_id' | 'user_id'>>,
) {
  try {
    await db
      .update(assignedEquipment)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(assignedEquipment.id, assignmentId));
  } catch (error) {
    console.error('Error updating equipment assignment:', error);
    throw new Error('Failed to update equipment assignment');
  }
}

export async function returnEquipment(
  assignmentId: number,
  condition: typeof equipmentConditionEnum.enumValues[number],
  notes?: string,
) {
  try {
    await db
      .update(assignedEquipment)
      .set({
        checked_in_at: new Date().toISOString(),
        condition,
        notes,
        updated_at: new Date().toISOString(),
      })
      .where(eq(assignedEquipment.id, assignmentId));
  } catch (error) {
    console.error('Error returning equipment:', error);
    throw new Error('Failed to return equipment');
  }
}

export async function deleteEquipmentAssignment(assignmentId: number) {
  try {
    await db.delete(assignedEquipment).where(eq(assignedEquipment.id, assignmentId));
  } catch (error) {
    console.error('Error deleting equipment assignment:', error);
    throw new Error('Failed to delete equipment assignment');
  }
}

export async function getCurrentEquipmentAssignment(userId: number) {
  try {
    const assignments = await db
      .select({
        id: assignedEquipment.id,
        equipment_id: assignedEquipment.equipment_id,
        user_id: assignedEquipment.user_id,
        condition: assignedEquipment.condition,
        notes: assignedEquipment.notes,
        checked_out_at: assignedEquipment.checked_out_at,
        checked_in_at: assignedEquipment.checked_in_at,
        expected_return_date: assignedEquipment.expected_return_date,
        created_at: assignedEquipment.created_at,
        updated_at: assignedEquipment.updated_at,
        equipment,
      })
      .from(assignedEquipment)
      .leftJoin(equipment, eq(assignedEquipment.equipment_id, equipment.id))
      .where(eq(assignedEquipment.user_id, userId))
      .limit(1);

    return assignments[0] || null;
  } catch (error) {
    console.error('Error getting equipment assignment:', error);
    return null;
  }
}
