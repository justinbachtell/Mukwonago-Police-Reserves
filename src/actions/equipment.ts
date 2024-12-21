'use server';

import { db } from '@/libs/DB';
import { equipment } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getAllEquipment() {
  try {
    const equipmentList = await db.select().from(equipment);
    return equipmentList;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}

export async function createEquipment(data: {
  name: string;
  description: string;
  serial_number: string;
  purchase_date: string;
  notes: string;
}) {
  try {
    const [newEquipment] = await db
      .insert(equipment)
      .values({
        name: data.name,
        description: data.description || null,
        serial_number: data.serial_number || null,
        purchase_date: data.purchase_date ? new Date(data.purchase_date).toISOString() : null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning();

    revalidatePath('/admin/equipment');
    return newEquipment;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw new Error('Failed to create equipment');
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
    return equipmentItem;
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw new Error('Failed to fetch equipment');
  }
}
