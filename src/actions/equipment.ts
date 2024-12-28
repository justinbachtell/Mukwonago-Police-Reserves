'use server';

import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { assignedEquipment, equipment } from '@/models/Schema';
import { and, eq, isNull, not, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAllEquipment() {
  try {
    const equipmentList = await db.select().from(equipment);
    return equipmentList.map(item => ({
      ...item,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}

export async function getAvailableEquipment() {
  try {
    const availableEquipment = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        description: equipment.description,
        serial_number: equipment.serial_number,
        purchase_date: equipment.purchase_date,
        notes: equipment.notes,
        is_assigned: equipment.is_assigned,
        assigned_to: equipment.assigned_to,
        is_obsolete: equipment.is_obsolete,
        created_at: equipment.created_at,
        updated_at: equipment.updated_at,
      })
      .from(equipment)
      .leftJoin(
        assignedEquipment,
        eq(equipment.id, assignedEquipment.equipment_id),
      )
      .where(
        and(
          eq(equipment.is_obsolete, false),
          or(
            isNull(assignedEquipment.id),
            not(isNull(assignedEquipment.checked_in_at)),
          ),
        ),
      );

    return availableEquipment.map(item => ({
      ...item,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching available equipment:', error);
    throw new Error('Failed to fetch available equipment');
  }
}

export async function createEquipment(data: {
  name: string;
  description?: string;
  serial_number?: string;
  purchase_date?: string;
  notes?: string;
}) {
  try {
    const now = toISOString(new Date());

    const [newEquipment] = await db
      .insert(equipment)
      .values({
        name: data.name,
        description: data.description || null,
        serial_number: data.serial_number || null,
        purchase_date: data.purchase_date || null,
        notes: data.notes || null,
        created_at: now,
        updated_at: now,
        is_assigned: false,
        is_obsolete: false,
      })
      .returning();

    if (!newEquipment) {
      throw new Error('Failed to create equipment');
    }

    revalidatePath('/admin/equipment');
    return {
      ...newEquipment,
      purchase_date: newEquipment.purchase_date ? newEquipment.purchase_date : null,
      created_at: newEquipment.created_at,
      updated_at: newEquipment.updated_at,
    };
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw new Error('Failed to create equipment');
  }
}

export async function markAsObsolete(id: number) {
  try {
    await db.update(equipment).set({ is_obsolete: true }).where(eq(equipment.id, id));
    revalidatePath('/admin/equipment');
  } catch (error) {
    console.error('Error marking equipment as obsolete:', error);
    throw new Error('Failed to mark equipment as obsolete');
  }
}

export async function deleteEquipment(id: number) {
  try {
    await db.delete(equipment).where(eq(equipment.id, id));
    revalidatePath('/admin/equipment');
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw new Error('Failed to delete equipment');
  }
}

export async function getEquipment(id: number) {
  try {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    if (!equipmentItem) {
      return null;
    }

    return {
      ...equipmentItem,
      purchase_date: equipmentItem.purchase_date ? equipmentItem.purchase_date : null,
      created_at: equipmentItem.created_at,
      updated_at: equipmentItem.updated_at,
    };
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}
