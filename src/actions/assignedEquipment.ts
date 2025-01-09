'use server';

import type { equipmentConditionEnum } from '@/models/Schema'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { assignedEquipment, equipment } from '@/models/Schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'equipment',
  file: 'assignedEquipment.ts'
})

export interface CreateAssignedEquipmentData {
  equipment_id: number
  user_id: string
  condition: (typeof equipmentConditionEnum.enumValues)[number]
  notes?: string
  checked_out_at?: string
  checked_in_at?: string
  expected_return_date?: string
}

export async function createAssignedEquipment(
  data: CreateAssignedEquipmentData
) {
  logger.info(
    'Creating equipment assignment',
    {
      equipmentId: data.equipment_id,
      userId: data.user_id
    },
    'createAssignedEquipment'
  )

  try {
    // Check if equipment is already assigned
    const existingAssignment = await db
      .select()
      .from(assignedEquipment)
      .where(
        and(
          eq(assignedEquipment.equipment_id, data.equipment_id),
          eq(assignedEquipment.user_id, data.user_id)
        )
      )

    if (existingAssignment.length > 0) {
      logger.warn(
        'Equipment already assigned',
        {
          equipmentId: data.equipment_id,
          userId: data.user_id
        },
        'createAssignedEquipment'
      )
      return null
    }

    const now = toISOString(new Date())

    logger.info(
      'Starting assignment transaction',
      {
        equipmentId: data.equipment_id,
        userId: data.user_id
      },
      'createAssignedEquipment'
    )

    // Start a transaction
    const [newAssignment] = await db.transaction(async tx => {
      logger.log(
        'Creating assignment record',
        { data },
        'createAssignedEquipment'
      )
      const [assignment] = await tx
        .insert(assignedEquipment)
        .values({
          checked_out_at: data.checked_out_at || now,
          condition: data.condition,
          created_at: now,
          equipment_id: data.equipment_id,
          expected_return_date: data.expected_return_date || null,
          notes: data.notes,
          updated_at: now,
          user_id: data.user_id
        })
        .returning()

      logger.log(
        'Updating equipment status',
        {
          equipmentId: data.equipment_id,
          userId: data.user_id
        },
        'createAssignedEquipment'
      )

      await tx
        .update(equipment)
        .set({
          assigned_to: data.user_id,
          is_assigned: true,
          updated_at: now
        })
        .where(eq(equipment.id, data.equipment_id))

      return [assignment]
    })

    logger.info(
      'Equipment assignment completed',
      {
        assignmentId: newAssignment?.id,
        equipmentId: data.equipment_id,
        userId: data.user_id
      },
      'createAssignedEquipment'
    )

    revalidatePath('/admin/equipment')
    revalidatePath('/admin/users/[id]/equipment')
    revalidatePath(`/admin/users/${data.user_id}/equipment`)

    return newAssignment
  } catch (error) {
    logger.error(
      'Failed to create equipment assignment',
      logger.errorWithData(error),
      'createAssignedEquipment'
    )
    return null
  }
}

export async function getAssignedEquipment(userId: string) {
  logger.info('Fetching assigned equipment', { userId }, 'getAssignedEquipment')
  try {
    const assignments = await db
      .select({
        checked_in_at: assignedEquipment.checked_in_at,
        checked_out_at: assignedEquipment.checked_out_at,
        condition: assignedEquipment.condition,
        created_at: assignedEquipment.created_at,
        equipment: {
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
        },
        equipment_id: assignedEquipment.equipment_id,
        expected_return_date: assignedEquipment.expected_return_date,
        id: assignedEquipment.id,
        notes: assignedEquipment.notes,
        updated_at: assignedEquipment.updated_at,
        user_id: assignedEquipment.user_id
      })
      .from(assignedEquipment)
      .leftJoin(equipment, eq(assignedEquipment.equipment_id, equipment.id))
      .where(
        and(
          eq(assignedEquipment.user_id, userId),
          eq(equipment.is_obsolete, false)
        )
      )
      .orderBy(
        sql`CASE WHEN ${assignedEquipment.checked_in_at} IS NULL THEN 0 ELSE 1 END`,
        desc(assignedEquipment.checked_out_at)
      )

    logger.info(
      'Retrieved assignments',
      {
        count: assignments.length,
        userId
      },
      'getAssignedEquipment'
    )

    return assignments.map(assignment => ({
      ...assignment,
      checked_in_at: assignment.checked_in_at,
      checked_out_at: assignment.checked_out_at,
      created_at: assignment.created_at,
      equipment: assignment.equipment
        ? {
            ...assignment.equipment,
            purchase_date: assignment.equipment.purchase_date,
            created_at: assignment.equipment.created_at,
            updated_at: assignment.equipment.updated_at
          }
        : null,
      expected_return_date: assignment.expected_return_date,
      updated_at: assignment.updated_at
    }))
  } catch (error) {
    logger.error(
      'Failed to get equipment assignments',
      logger.errorWithData(error),
      'getAssignedEquipment'
    )
    return null
  }
}

export async function updateAssignedEquipment(
  assignmentId: number,
  data: Partial<Omit<CreateAssignedEquipmentData, 'equipment_id' | 'user_id'>>
) {
  logger.info(
    'Updating equipment assignment',
    {
      assignmentId,
      updateData: data
    },
    'updateAssignedEquipment'
  )

  try {
    logger.time(`update-${assignmentId}`)
    const [updated] = await db
      .update(assignedEquipment)
      .set({
        checked_in_at: data.checked_in_at || null,
        condition: data.condition,
        notes: data.notes,
        updated_at: toISOString(new Date())
      })
      .where(eq(assignedEquipment.id, assignmentId))
      .returning()

    if (!updated) {
      logger.error(
        'Assignment not found',
        { assignmentId },
        'updateAssignedEquipment'
      )
      return null
    }

    logger.info(
      'Fetching equipment details',
      {
        equipmentId: updated.equipment_id
      },
      'updateAssignedEquipment'
    )

    const [equipmentDetails] = await db
      .select({
        created_at: equipment.created_at,
        description: equipment.description,
        id: equipment.id,
        name: equipment.name,
        notes: equipment.notes,
        purchase_date: equipment.purchase_date,
        serial_number: equipment.serial_number,
        updated_at: equipment.updated_at
      })
      .from(equipment)
      .where(eq(equipment.id, updated.equipment_id))

    logger.timeEnd(`update-${assignmentId}`)
    logger.info(
      'Assignment updated successfully',
      {
        assignmentId,
        equipmentId: updated.equipment_id
      },
      'updateAssignedEquipment'
    )

    return {
      ...updated,
      equipment: equipmentDetails
        ? {
            ...equipmentDetails,
            purchase_date: equipmentDetails.purchase_date,
            created_at: equipmentDetails.created_at,
            updated_at: equipmentDetails.updated_at
          }
        : null
    }
  } catch (error) {
    logger.error(
      'Update failed',
      logger.errorWithData(error),
      'updateAssignedEquipment'
    )
    return null
  }
}

export async function returnEquipment(
  assignmentId: number,
  condition: (typeof equipmentConditionEnum.enumValues)[number],
  notes?: string
) {
  logger.group('Equipment Return', () => {
    logger.info(
      'Processing equipment return',
      {
        assignmentId,
        condition,
        hasNotes: !!notes
      },
      'returnEquipment'
    )
    logger.time(`return-${assignmentId}`)
  })

  try {
    const now = toISOString(new Date())

    const result = await db.transaction(async tx => {
      // Get the equipment ID from the assignment
      const [assignment] = await tx
        .select()
        .from(assignedEquipment)
        .where(eq(assignedEquipment.id, assignmentId))

      if (!assignment) {
        logger.error(
          'Assignment not found',
          { assignmentId },
          'returnEquipment'
        )
        return null
      }

      logger.info(
        'Updating assignment record',
        {
          assignmentId,
          equipmentId: assignment.equipment_id
        },
        'returnEquipment'
      )

      // Update assignment and equipment records
      await Promise.all([
        tx
          .update(assignedEquipment)
          .set({
            checked_in_at: now,
            condition,
            notes,
            updated_at: now
          })
          .where(eq(assignedEquipment.id, assignmentId)),

        tx
          .update(equipment)
          .set({
            assigned_to: null,
            is_assigned: false,
            updated_at: now
          })
          .where(eq(equipment.id, assignment.equipment_id))
      ])

      logger.info(
        'Equipment return completed',
        {
          assignmentId,
          equipmentId: assignment.equipment_id
        },
        'returnEquipment'
      )

      return { success: true }
    })

    logger.timeEnd(`return-${assignmentId}`)
    revalidatePath('/admin/equipment')
    revalidatePath('/admin/users/[id]/equipment')
    revalidatePath(`/admin/users/${assignmentId}/equipment`)

    return result
  } catch (error) {
    logger.error(
      'Failed to return equipment',
      logger.errorWithData(error),
      'returnEquipment'
    )
    return null
  }
}

export async function deleteAssignedEquipment(assignmentId: number) {
  logger.info(
    'Deleting equipment assignment',
    { assignmentId },
    'deleteAssignedEquipment'
  )
  logger.time(`deletion-${assignmentId}`)

  try {
    await db
      .delete(assignedEquipment)
      .where(eq(assignedEquipment.id, assignmentId))
    logger.info(
      'Assignment deleted successfully',
      { assignmentId },
      'deleteAssignedEquipment'
    )
    logger.timeEnd(`deletion-${assignmentId}`)
    return { success: true }
  } catch (error) {
    logger.error(
      'Deletion failed',
      logger.errorWithData(error),
      'deleteAssignedEquipment'
    )
    return null
  }
}

export async function getCurrentAssignedEquipment(userId: string) {
  logger.info(
    'Fetching current equipment assignment',
    { userId },
    'getCurrentAssignedEquipment'
  )

  try {
    const assignments = await db
      .select({
        checked_in_at: assignedEquipment.checked_in_at,
        checked_out_at: assignedEquipment.checked_out_at,
        condition: assignedEquipment.condition,
        created_at: assignedEquipment.created_at,
        equipment,
        equipment_id: assignedEquipment.equipment_id,
        expected_return_date: assignedEquipment.expected_return_date,
        id: assignedEquipment.id,
        notes: assignedEquipment.notes,
        updated_at: assignedEquipment.updated_at,
        user_id: assignedEquipment.user_id
      })
      .from(assignedEquipment)
      .leftJoin(equipment, eq(assignedEquipment.equipment_id, equipment.id))
      .where(eq(assignedEquipment.user_id, userId))
      .limit(1)

    if (!assignments[0]) {
      logger.info(
        'No current assignment found',
        { userId },
        'getCurrentAssignedEquipment'
      )
      return null
    }

    const assignment = assignments[0]
    logger.info(
      'Current assignment retrieved',
      {
        assignmentId: assignment.id,
        equipmentId: assignment.equipment_id,
        userId
      },
      'getCurrentAssignedEquipment'
    )

    return {
      ...assignment,
      checked_in_at: assignment.checked_in_at,
      checked_out_at: assignment.checked_out_at,
      created_at: assignment.created_at,
      equipment: assignment.equipment
        ? {
            ...assignment.equipment,
            purchase_date: assignment.equipment.purchase_date,
            created_at: assignment.equipment.created_at,
            updated_at: assignment.equipment.updated_at
          }
        : null,
      expected_return_date: assignment.expected_return_date,
      updated_at: assignment.updated_at
    }
  } catch (error) {
    logger.error(
      'Failed to get current assignment',
      logger.errorWithData(error),
      'getCurrentAssignedEquipment'
    )
    return null
  }
}
