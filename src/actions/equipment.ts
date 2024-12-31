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
      created_at: item.created_at,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      updated_at: item.updated_at,
    }));
  }
 catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}

export async function getAvailableEquipment() {
  try {
    const availableEquipment = await db
      .select({
        assigned_to: equipment.assigned_to,
        created_at: equipment.created_at,
        description: equipment.description,
        id: equipment.id,
        is_assigned: equipment.is_assigned,
        is_obsolete: equipment.is_obsolete,
        name: equipment.name,
        notes: equipment.notes,
        purchase_date: equipment.purchase_date,
        serial_number: equipment.serial_number,
        updated_at: equipment.updated_at,
      })
      .from(equipment)
      .leftJoin(assignedEquipment, eq(equipment.id, assignedEquipment.equipment_id))
      .where(
        and(
          eq(equipment.is_obsolete, false),
          or(isNull(assignedEquipment.id), not(isNull(assignedEquipment.checked_in_at))),
        ),
      );

    return availableEquipment.map(item => ({
      ...item,
      created_at: item.created_at,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      updated_at: item.updated_at,
    }));
  }
 catch (error) {
    console.error('Error fetching available equipment:', error);
    throw new Error('Failed to fetch available equipment');
  }
}

export async function createEquipment(data: {
  name: string
  description?: string | null
  serial_number?: string | null
  purchase_date?: Date | null
  notes?: string | null
}) {
  try {
    const now = toISOString(new Date());

    const [newEquipment] = await db
      .insert(equipment)
      .values({
        created_at: now,
        description: data.description ?? null,
        is_assigned: false,
        is_obsolete: false,
        name: data.name,
        notes: data.notes ?? null,
        purchase_date: data.purchase_date ? toISOString(data.purchase_date) : null,
        serial_number: data.serial_number ?? null,
        updated_at: now,
      })
      .returning();

    if (!newEquipment) {
      throw new Error('Failed to create equipment');
    }

    revalidatePath('/admin/equipment');
    return {
      ...newEquipment,
      created_at: newEquipment.created_at,
      purchase_date: newEquipment.purchase_date ? newEquipment.purchase_date : null,
      updated_at: newEquipment.updated_at,
    };
  }
 catch (error) {
    console.error('Error creating equipment:', error);
    throw new Error('Failed to create equipment');
  }
}

export async function markAsObsolete(id: number) {
  try {
    await db.update(equipment).set({ is_obsolete: true }).where(eq(equipment.id, id));
    revalidatePath('/admin/equipment');
  }
 catch (error) {
    console.error('Error marking equipment as obsolete:', error);
    throw new Error('Failed to mark equipment as obsolete');
  }
}

export async function deleteEquipment(id: number) {
  try {
    await db.delete(equipment).where(eq(equipment.id, id));
    revalidatePath('/admin/equipment');
  }
 catch (error) {
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
      created_at: equipmentItem.created_at,
      purchase_date: equipmentItem.purchase_date ? equipmentItem.purchase_date : null,
      updated_at: equipmentItem.updated_at,
    };
  }
 catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}
