'use server';

import type { equipmentConditionEnum } from '@/models/Schema';
import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { assignedEquipment, equipment } from '@/models/Schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type CreateAssignedEquipmentData = {
  equipment_id: number;
  user_id: number;
  condition: typeof equipmentConditionEnum.enumValues[number];
  notes?: string;
  checked_out_at?: string;
  checked_in_at?: string;
  expected_return_date?: string;
};

export async function createAssignedEquipment(data: CreateAssignedEquipmentData) {
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

    const now = toISOString(new Date());

    // Start a transaction to ensure both operations succeed or fail together
    const [newAssignment] = await db.transaction(async (tx) => {
      // Create the equipment assignment
      const [assignment] = await tx
        .insert(assignedEquipment)
        .values({
          equipment_id: data.equipment_id,
          user_id: data.user_id,
          condition: data.condition,
          notes: data.notes,
          checked_out_at: data.checked_out_at || now,
          expected_return_date: data.expected_return_date || null,
          created_at: now,
          updated_at: now,
        })
        .returning();

      // Update the equipment record to mark it as assigned
      await tx
        .update(equipment)
        .set({
          is_assigned: true,
          assigned_to: data.user_id,
          updated_at: now,
        })
        .where(eq(equipment.id, data.equipment_id));

      return [assignment];
    });

    // Revalidate the equipment pages
    revalidatePath('/admin/equipment');
    revalidatePath('/admin/users/[id]/equipment');
    revalidatePath(`/admin/users/${data.user_id}/equipment`);

    return newAssignment;
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
          is_assigned: equipment.is_assigned,
          assigned_to: equipment.assigned_to,
          created_at: equipment.created_at,
          updated_at: equipment.updated_at,
          is_obsolete: equipment.is_obsolete,
        },
      })
      .from(assignedEquipment)
      .leftJoin(equipment, eq(assignedEquipment.equipment_id, equipment.id))
      .where(
        and(
          eq(assignedEquipment.user_id, userId),
          eq(equipment.is_obsolete, false),
        ),
      )
      .orderBy(
        sql`CASE WHEN ${assignedEquipment.checked_in_at} IS NULL THEN 0 ELSE 1 END`,
        desc(assignedEquipment.checked_out_at),
      );

    return assignments.map(assignment => ({
      ...assignment,
      checked_out_at: assignment.checked_out_at,
      checked_in_at: assignment.checked_in_at,
      expected_return_date: assignment.expected_return_date,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      equipment: assignment.equipment
        ? {
            ...assignment.equipment,
            purchase_date: assignment.equipment.purchase_date,
            created_at: assignment.equipment.created_at,
            updated_at: assignment.equipment.updated_at,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error getting equipment assignments:', error);
    throw new Error('Failed to get equipment assignments');
  }
}

export async function updateAssignedEquipment(
  assignmentId: number,
  data: Partial<Omit<CreateAssignedEquipmentData, 'equipment_id' | 'user_id'>>,
) {
  try {
    const [updated] = await db
      .update(assignedEquipment)
      .set({
        condition: data.condition,
        checked_in_at: data.checked_in_at || null,
        notes: data.notes,
        updated_at: toISOString(new Date()),
      })
      .where(eq(assignedEquipment.id, assignmentId))
      .returning();

    if (!updated) {
      throw new Error('Failed to update equipment assignment');
    }

    // Get equipment details
    const [equipmentDetails] = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        description: equipment.description,
        serial_number: equipment.serial_number,
        purchase_date: equipment.purchase_date,
        notes: equipment.notes,
        created_at: equipment.created_at,
        updated_at: equipment.updated_at,
      })
      .from(equipment)
      .where(eq(equipment.id, updated.equipment_id));

    return {
      ...updated,
      equipment: equipmentDetails
        ? {
            ...equipmentDetails,
            purchase_date: equipmentDetails.purchase_date,
            created_at: equipmentDetails.created_at,
            updated_at: equipmentDetails.updated_at,
          }
        : null,
    };
  } catch (error) {
    console.error('Error updating equipment assignment:', error);
    return null;
  }
}

export async function returnEquipment(
  assignmentId: number,
  condition: typeof equipmentConditionEnum.enumValues[number],
  notes?: string,
) {
  try {
    const now = toISOString(new Date());

    // Start a transaction to ensure both operations succeed or fail together
    await db.transaction(async (tx) => {
      // Get the equipment ID from the assignment
      const [assignment] = await tx
        .select()
        .from(assignedEquipment)
        .where(eq(assignedEquipment.id, assignmentId));

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Update the assignment to mark it as returned
      await tx
        .update(assignedEquipment)
        .set({
          checked_in_at: now,
          condition,
          notes,
          updated_at: now,
        })
        .where(eq(assignedEquipment.id, assignmentId));

      // Update the equipment record to mark it as unassigned
      await tx
        .update(equipment)
        .set({
          is_assigned: false,
          assigned_to: null,
          updated_at: now,
        })
        .where(eq(equipment.id, assignment.equipment_id));
    });

    revalidatePath('/admin/equipment');
    revalidatePath('/admin/users/[id]/equipment');
    revalidatePath(`/admin/users/${assignmentId}/equipment`);
  } catch (error) {
    console.error('Error returning equipment:', error);
    throw new Error('Failed to return equipment');
  }
}

export async function deleteAssignedEquipment(assignmentId: number) {
  try {
    await db.delete(assignedEquipment).where(eq(assignedEquipment.id, assignmentId));
  } catch (error) {
    console.error('Error deleting equipment assignment:', error);
    throw new Error('Failed to delete equipment assignment');
  }
}

export async function getCurrentAssignedEquipment(userId: number) {
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

    if (!assignments[0]) {
      return null;
    }

    const assignment = assignments[0];
    return {
      ...assignment,
      checked_out_at: assignment.checked_out_at,
      checked_in_at: assignment.checked_in_at,
      expected_return_date: assignment.expected_return_date,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      equipment: assignment.equipment
        ? {
            ...assignment.equipment,
            purchase_date: assignment.equipment.purchase_date,
            created_at: assignment.equipment.created_at,
            updated_at: assignment.equipment.updated_at,
          }
        : null,
    };
  } catch (error) {
    console.error('Error getting equipment assignment:', error);
    return null;
  }
}
