'use server'

import type { Training, TrainingType } from '@/types/training'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { training } from '@/models/Schema'
import { eq } from 'drizzle-orm'

export async function getAllTraining() {
  try {
    const training = await db.query.training.findMany({
      with: {
        instructor: {
          columns: {
            id: true,
            first_name: true,
            last_name: true
          }
        },
        assignments: {
          with: {
            user: true
          }
        }
      }
    })

    return training.map(t => ({
      ...t,
      training_type: t.training_type as TrainingType
    }))
  } catch (error) {
    console.error('Error fetching training:', error)
    throw new Error('Failed to fetch training')
  }
}

export async function getTrainingById(id: number) {
  try {
    const [trainingSession] = await db
      .select()
      .from(training)
      .where(eq(training.id, id))
    if (!trainingSession) {
      return null
    }

    return {
      ...trainingSession,
      created_at: new Date(trainingSession.created_at),
      training_date: new Date(trainingSession.training_date),
      training_end_time: new Date(trainingSession.training_end_time),
      training_start_time: new Date(trainingSession.training_start_time),
      updated_at: new Date(trainingSession.updated_at)
    }
  } catch (error) {
    console.error('Error fetching training:', error)
    throw new Error('Failed to fetch training')
  }
}

export async function createTraining(
  data: Omit<Training, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const now = toISOString(new Date())
    const [newTraining] = await db
      .insert(training)
      .values({
        ...data,
        created_at: now,
        training_date: toISOString(data.training_date),
        training_end_time: toISOString(data.training_end_time),
        training_start_time: toISOString(data.training_start_time),
        updated_at: now
      })
      .returning()

    if (!newTraining) {
      throw new Error('Failed to create training')
    }

    return {
      ...newTraining,
      created_at: new Date(newTraining.created_at),
      training_date: new Date(newTraining.training_date),
      training_end_time: new Date(newTraining.training_end_time),
      training_start_time: new Date(newTraining.training_start_time),
      updated_at: new Date(newTraining.updated_at)
    }
  } catch (error) {
    console.error('Error creating training:', error)
    throw new Error('Failed to create training')
  }
}

export async function updateTraining(
  id: number,
  data: Partial<Omit<Training, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const [updatedTraining] = await db
      .update(training)
      .set({
        ...data,
        training_date: data.training_date
          ? toISOString(data.training_date)
          : undefined,
        training_end_time: data.training_end_time
          ? toISOString(data.training_end_time)
          : undefined,
        training_start_time: data.training_start_time
          ? toISOString(data.training_start_time)
          : undefined,
        updated_at: toISOString(new Date())
      })
      .where(eq(training.id, id))
      .returning()

    if (!updatedTraining) {
      throw new Error('Failed to update training')
    }

    return {
      ...updatedTraining,
      created_at: new Date(updatedTraining.created_at),
      training_date: new Date(updatedTraining.training_date),
      training_end_time: new Date(updatedTraining.training_end_time),
      training_start_time: new Date(updatedTraining.training_start_time),
      updated_at: new Date(updatedTraining.updated_at)
    }
  } catch (error) {
    console.error('Error updating training:', error)
    throw new Error('Failed to update training')
  }
}

export async function deleteTraining(id: number) {
  try {
    const [deletedTraining] = await db
      .delete(training)
      .where(eq(training.id, id))
      .returning()
    if (!deletedTraining) {
      throw new Error('Failed to delete training')
    }
    return deletedTraining
  } catch (error) {
    console.error('Error deleting training:', error)
    throw new Error('Failed to delete training')
  }
}
