'use server'

import type {
  TrainingAssignment,
  CompletionStatus
} from '@/types/trainingAssignment'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { trainingAssignments } from '@/models/Schema'
import { and, eq } from 'drizzle-orm'

export async function getTrainingAssignments(training_id: number) {
  try {
    const assignments = await db
      .select()
      .from(trainingAssignments)
      .where(eq(trainingAssignments.training_id, training_id))

    return assignments
  } catch (error) {
    console.error('Error fetching training assignments:', error)
    throw new Error('Failed to fetch training assignments')
  }
}

export async function getUserTrainingAssignments(user_id: number) {
  try {
    const assignments = await db.query.trainingAssignments.findMany({
      where: eq(trainingAssignments.user_id, user_id),
      with: {
        training: true
      }
    })

    return assignments.map(assignment => ({
      ...assignment,
      created_at: new Date(assignment.created_at),
      updated_at: new Date(assignment.updated_at),
      training: assignment.training
        ? {
            ...assignment.training,
            training_date: new Date(assignment.training.training_date),
            training_start_time: new Date(
              assignment.training.training_start_time
            ),
            training_end_time: new Date(assignment.training.training_end_time),
            created_at: new Date(assignment.training.created_at),
            updated_at: new Date(assignment.training.updated_at)
          }
        : null
    }))
  } catch (error) {
    console.error('Error fetching user training assignments:', error)
    throw new Error('Failed to fetch user training assignments')
  }
}

export async function createTrainingAssignment(
  data: Pick<TrainingAssignment, 'training_id' | 'user_id'>
) {
  try {
    const [newAssignment] = await db
      .insert(trainingAssignments)
      .values(data)
      .returning()

    if (!newAssignment) {
      throw new Error('Failed to create training assignment')
    }

    return newAssignment
  } catch (error) {
    console.error('Error creating training assignment:', error)
    throw new Error('Failed to create training assignment')
  }
}

export async function deleteTrainingAssignment(
  training_id: number,
  user_id: number
) {
  try {
    const [deletedAssignment] = await db
      .delete(trainingAssignments)
      .where(
        and(
          eq(trainingAssignments.training_id, training_id),
          eq(trainingAssignments.user_id, user_id)
        )
      )
      .returning()

    if (!deletedAssignment) {
      throw new Error('Failed to delete training assignment')
    }

    return deletedAssignment
  } catch (error) {
    console.error('Error deleting training assignment:', error)
    throw new Error('Failed to delete training assignment')
  }
}

export async function updateTrainingAssignmentCompletion(
  trainingId: number,
  userId: number,
  data: {
    completion_status: CompletionStatus
    completion_notes?: string | null
  }
) {
  try {
    const [updatedAssignment] = await db
      .update(trainingAssignments)
      .set({
        ...data,
        updated_at: toISOString(new Date())
      })
      .where(
        and(
          eq(trainingAssignments.training_id, trainingId),
          eq(trainingAssignments.user_id, userId)
        )
      )
      .returning()

    if (!updatedAssignment) {
      throw new Error('Failed to update training assignment completion')
    }

    return updatedAssignment
  } catch (error) {
    console.error('Error updating training assignment completion:', error)
    throw new Error('Failed to update training assignment completion')
  }
}
