'use server';

import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { assignedEquipment, equipment } from '@/models/Schema'
import { and, eq, isNull, not, or } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'equipment',
  file: 'equipment.ts'
})

export async function getAllEquipment() {
  logger.info('Fetching all equipment', undefined, 'getAllEquipment')
  logger.time('fetch-all-equipment')

  try {
    const equipmentList = await db.select().from(equipment)

    logger.info(
      'Equipment list retrieved successfully',
      { count: equipmentList.length },
      'getAllEquipment'
    )
    logger.timeEnd('fetch-all-equipment')

    return equipmentList.map(item => ({
      ...item,
      created_at: item.created_at,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      updated_at: item.updated_at
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch equipment',
      logger.errorWithData(error),
      'getAllEquipment'
    )
    return null
  }
}

export async function getAvailableEquipment() {
  logger.info(
    'Fetching available equipment',
    undefined,
    'getAvailableEquipment'
  )
  logger.time('fetch-available-equipment')

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
        updated_at: equipment.updated_at
      })
      .from(equipment)
      .leftJoin(
        assignedEquipment,
        eq(equipment.id, assignedEquipment.equipment_id)
      )
      .where(
        and(
          eq(equipment.is_obsolete, false),
          or(
            isNull(assignedEquipment.id),
            not(isNull(assignedEquipment.checked_in_at))
          )
        )
      )

    logger.info(
      'Available equipment retrieved successfully',
      { count: availableEquipment.length },
      'getAvailableEquipment'
    )
    logger.timeEnd('fetch-available-equipment')

    return availableEquipment.map(item => ({
      ...item,
      created_at: item.created_at,
      purchase_date: item.purchase_date ? item.purchase_date : null,
      updated_at: item.updated_at
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch available equipment',
      logger.errorWithData(error),
      'getAvailableEquipment'
    )
    return null
  }
}

export async function createEquipment(data: {
  name: string
  description?: string | null
  serial_number?: string | null
  purchase_date?: Date | null
  notes?: string | null
}) {
  logger.info(
    'Creating new equipment',
    { name: data.name, serialNumber: data.serial_number },
    'createEquipment'
  )
  logger.time('create-equipment')

  try {
    const now = toISOString(new Date())
    const [newEquipment] = await db
      .insert(equipment)
      .values({
        created_at: now,
        description: data.description ?? null,
        is_assigned: false,
        is_obsolete: false,
        name: data.name,
        notes: data.notes ?? null,
        purchase_date: data.purchase_date
          ? toISOString(data.purchase_date)
          : null,
        serial_number: data.serial_number ?? null,
        updated_at: now
      })
      .returning()

    if (!newEquipment) {
      logger.error(
        'No equipment returned after creation',
        { name: data.name },
        'createEquipment'
      )
      return null
    }

    logger.info(
      'Equipment created successfully',
      { id: newEquipment.id, name: newEquipment.name },
      'createEquipment'
    )
    logger.timeEnd('create-equipment')

    revalidatePath('/admin/equipment')
    return {
      ...newEquipment,
      created_at: newEquipment.created_at,
      purchase_date: newEquipment.purchase_date || null,
      updated_at: newEquipment.updated_at
    }
  } catch (error) {
    logger.error(
      'Failed to create equipment',
      logger.errorWithData(error),
      'createEquipment'
    )
    return null
  }
}

export async function updateEquipment(data: {
  id: number
  name: string
  description?: string | null
  serial_number?: string | null
  purchase_date?: Date | null
  notes?: string | null
}) {
  logger.info(
    'Updating equipment',
    { equipmentId: data.id, name: data.name },
    'updateEquipment'
  )
  logger.time('update-equipment')

  try {
    const [updatedEquipment] = await db
      .update(equipment)
      .set({
        description: data.description ?? null,
        name: data.name,
        notes: data.notes ?? null,
        purchase_date: data.purchase_date
          ? toISOString(data.purchase_date)
          : null,
        serial_number: data.serial_number ?? null,
        updated_at: toISOString(new Date())
      })
      .where(eq(equipment.id, data.id))
      .returning()

    if (!updatedEquipment) {
      logger.error(
        'No equipment returned after update',
        { equipmentId: data.id },
        'updateEquipment'
      )
      return null
    }

    logger.info(
      'Equipment updated successfully',
      { equipmentId: data.id, name: data.name },
      'updateEquipment'
    )
    logger.timeEnd('update-equipment')

    revalidatePath('/admin/equipment')
    return { success: true }
  } catch (error) {
    logger.error(
      'Failed to update equipment',
      logger.errorWithData(error),
      'updateEquipment'
    )
    return null
  } finally {
    logger.timeEnd('update-equipment')
  }
}

export async function markAsObsolete(id: number) {
  logger.info(
    'Marking equipment as obsolete',
    { equipmentId: id },
    'markAsObsolete'
  )
  logger.time(`mark-obsolete-${id}`)

  try {
    const [updatedEquipment] = await db
      .update(equipment)
      .set({
        is_obsolete: true,
        updated_at: toISOString(new Date())
      })
      .where(eq(equipment.id, id))
      .returning()

    if (!updatedEquipment) {
      logger.error(
        'No equipment returned after obsolete update',
        { equipmentId: id },
        'markAsObsolete'
      )
      return null
    }

    logger.info(
      'Equipment marked as obsolete',
      { equipmentId: id },
      'markAsObsolete'
    )
    logger.timeEnd(`mark-obsolete-${id}`)

    revalidatePath('/admin/equipment')
    return { success: true }
  } catch (error) {
    logger.error(
      'Failed to mark equipment as obsolete',
      logger.errorWithData(error),
      'markAsObsolete'
    )
    return null
  }
}

export async function deleteEquipment(id: number) {
  logger.info('Deleting equipment', { equipmentId: id }, 'deleteEquipment')

  try {
    await db.delete(equipment).where(eq(equipment.id, id))
    logger.info(
      'Equipment deleted successfully',
      { equipmentId: id },
      'deleteEquipment'
    )
    revalidatePath('/admin/equipment')
    return { success: true }
  } catch (error) {
    logger.error(
      'Failed to delete equipment',
      logger.errorWithData(error),
      'deleteEquipment'
    )
    return null
  }
}

export async function getEquipment(id: number) {
  logger.info('Fetching equipment details', { equipmentId: id }, 'getEquipment')

  try {
    const [equipmentItem] = await db
      .select()
      .from(equipment)
      .where(eq(equipment.id, id))

    if (!equipmentItem) {
      logger.warn('Equipment not found', { equipmentId: id }, 'getEquipment')
      return null
    }

    logger.info(
      'Equipment retrieved successfully',
      { equipmentId: id },
      'getEquipment'
    )
    return {
      ...equipmentItem,
      created_at: equipmentItem.created_at,
      purchase_date: equipmentItem.purchase_date
        ? equipmentItem.purchase_date
        : null,
      updated_at: equipmentItem.updated_at
    }
  } catch (error) {
    logger.error(
      'Failed to fetch equipment',
      logger.errorWithData(error),
      'getEquipment'
    )
    return null
  }
}
