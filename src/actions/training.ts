'use server'

import type { TrainingType } from '@/types/training'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { training } from '@/models/Schema'
import { eq } from 'drizzle-orm'

export async function getTrainings() {
  try {
    const trainings = await db.query.training.findMany({
      with: {
        assignments: {
          with: {
            user: true
          }
        },
        instructor: true
      }
    })

    return trainings
  } catch (error) {
    console.error('Error fetching trainings:', error)
    throw new Error('Failed to fetch trainings')
  }
}

export async function getTraining(id: number) {
  try {
    const [result] = await db.query.training.findMany({
      where: eq(training.id, id),
      with: {
        assignments: {
          with: {
            user: true
          }
        },
        instructor: true
      }
    })

    return result
  } catch (error) {
    console.error('Error fetching training:', error)
    throw new Error('Failed to fetch training')
  }
}

interface CreateTrainingInput {
  name: string
  description: string | null
  training_date: Date
  training_location: string
  training_type: TrainingType
  training_instructor: number
  training_start_time: Date
  training_end_time: Date
}

interface UpdateTrainingInput extends Partial<CreateTrainingInput> {}

export async function createTraining(data: CreateTrainingInput) {
  try {
    const now = toISOString(new Date())
    const [newTraining] = await db
      .insert(training)
      .values({
        ...data,
        training_date: toISOString(data.training_date),
        training_start_time: toISOString(data.training_start_time),
        training_end_time: toISOString(data.training_end_time),
        created_at: now,
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

export async function updateTraining(id: number, data: UpdateTrainingInput) {
  try {
    const [updatedTraining] = await db
      .update(training)
      .set({
        ...data,
        training_date: data.training_date
          ? toISOString(data.training_date)
          : undefined,
        training_start_time: data.training_start_time
          ? toISOString(data.training_start_time)
          : undefined,
        training_end_time: data.training_end_time
          ? toISOString(data.training_end_time)
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
