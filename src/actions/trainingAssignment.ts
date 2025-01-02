'use server'

import type { TrainingAssignment } from '@/types/trainingAssignment'
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
    const assignments = await db
      .select()
      .from(trainingAssignments)
      .where(eq(trainingAssignments.user_id, user_id))

    return assignments
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
