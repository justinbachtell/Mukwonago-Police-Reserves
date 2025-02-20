'use server'

import type { RequiredTrainingFields, UpdateTraining } from '@/types/training'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { training, trainingAssignments } from '@/models/Schema'
import { eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'
import { createTrainingNotification } from '@/actions/notification'

const logger = createLogger({
  module: 'training',
  file: 'training.ts'
})

export async function getTrainings() {
  logger.info('Fetching all trainings', undefined, 'getTrainings')
  logger.time('fetch-all-trainings')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'getTrainings'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getTrainings')
      return null
    }

    const trainings = await db.query.training.findMany({
      with: {
        assignments: {
          with: {
            user: true
          }
        },
        instructor: true
      },
      orderBy: (training, { desc }) => [desc(training.training_date)]
    })

    const mappedTrainings = trainings.map(training => ({
      ...training,
      instructor: training.instructor || null,
      training_instructor: training.instructor
        ? training.training_instructor
        : training.training_instructor || null
    }))

    logger.info(
      'Trainings retrieved successfully',
      { count: mappedTrainings.length },
      'getTrainings'
    )
    logger.timeEnd('fetch-all-trainings')
    return mappedTrainings
  } catch (error) {
    logger.error(
      'Failed to fetch trainings',
      logger.errorWithData(error),
      'getTrainings'
    )
    logger.timeEnd('fetch-all-trainings')
    return null
  }
}

export async function getTraining(id: number) {
  logger.info('Fetching training details', { trainingId: id }, 'getTraining')
  logger.time(`fetch-training-${id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'getTraining'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getTraining')
      return null
    }

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

    if (!result) {
      logger.warn('Training not found', { trainingId: id }, 'getTraining')
      return null
    }

    logger.info(
      'Training retrieved successfully',
      { trainingId: id },
      'getTraining'
    )
    logger.timeEnd(`fetch-training-${id}`)
    return result
  } catch (error) {
    logger.error(
      'Failed to fetch training',
      logger.errorWithData(error),
      'getTraining'
    )
    logger.timeEnd(`fetch-training-${id}`)
    return null
  }
}

export async function createTraining(data: RequiredTrainingFields) {
  logger.info('Creating new training', { name: data.name }, 'createTraining')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('Failed to get Supabase user', undefined, 'createTraining')
      return null
    }

    const now = toISOString(new Date())

    // Start a transaction to create training and assignments
    const result = await db.transaction(async tx => {
      // Create the training first
      const [newTraining] = await tx
        .insert(training)
        .values({
          ...data,
          training_date:
            typeof data.training_date === 'string'
              ? data.training_date
              : toISOString(data.training_date),
          training_start_time:
            typeof data.training_start_time === 'string'
              ? data.training_start_time
              : toISOString(data.training_start_time),
          training_end_time:
            typeof data.training_end_time === 'string'
              ? data.training_end_time
              : toISOString(data.training_end_time),
          training_instructor: data.training_instructor,
          created_at: now,
          updated_at: now
        })
        .returning()

      if (!newTraining) {
        throw new Error('Failed to create training')
      }

      // If there are assigned users, create assignments for them
      if (data.assigned_users?.length) {
        const assignmentValues = data.assigned_users.map((userId: string) => ({
          training_id: newTraining.id,
          user_id: userId,
          created_at: now,
          updated_at: now
        }))

        await tx.insert(trainingAssignments).values(assignmentValues)
      }

      return newTraining
    })

    if (result) {
      await createTrainingNotification(result.name, result.id)
    }

    return result
  } catch (error) {
    logger.error(
      'Failed to create training',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'createTraining'
    )
    return null
  }
}

export async function updateTraining(id: number, data: UpdateTraining) {
  logger.info('Updating training', { trainingId: id }, 'updateTraining')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      logger.error('Failed to get Supabase user', undefined, 'updateTraining')
      return null
    }

    // Start a transaction to update training and assignments
    const result = await db.transaction(async tx => {
      // Update the training first
      const [updatedTraining] = await tx
        .update(training)
        .set({
          ...data,
          training_date:
            typeof data.training_date === 'string'
              ? data.training_date
              : data.training_date
                ? toISOString(data.training_date)
                : undefined,
          training_start_time:
            typeof data.training_start_time === 'string'
              ? data.training_start_time
              : data.training_start_time
                ? toISOString(data.training_start_time)
                : undefined,
          training_end_time:
            typeof data.training_end_time === 'string'
              ? data.training_end_time
              : data.training_end_time
                ? toISOString(data.training_end_time)
                : undefined,
          training_instructor: data.training_instructor,
          updated_at: toISOString(new Date())
        })
        .where(eq(training.id, id))
        .returning()

      if (!updatedTraining) {
        throw new Error('Failed to update training')
      }

      // Delete existing assignments
      await tx
        .delete(trainingAssignments)
        .where(eq(trainingAssignments.training_id, id))

      // If there are assigned users, create new assignments
      if (data.assigned_users?.length) {
        const now = toISOString(new Date())
        const assignmentValues = data.assigned_users.map((userId: string) => ({
          training_id: id,
          user_id: userId,
          created_at: now,
          updated_at: now
        }))

        await tx.insert(trainingAssignments).values(assignmentValues)
      }

      return updatedTraining
    })

    if (result) {
      await createTrainingNotification(
        result.name,
        result.id,
        'training_updated'
      )
    }

    return result
  } catch (error) {
    logger.error(
      'Failed to update training',
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'updateTraining'
    )
    return null
  }
}

export async function deleteTraining(id: number) {
  logger.info('Deleting training', { trainingId: id }, 'deleteTraining')
  logger.time(`delete-training-${id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase user',
        logger.errorWithData(userError),
        'deleteTraining'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'deleteTraining')
      return null
    }

    // First, delete all training assignments for this training
    await db
      .delete(trainingAssignments)
      .where(eq(trainingAssignments.training_id, id))

    // Then delete the training itself
    const [deletedTraining] = await db
      .delete(training)
      .where(eq(training.id, id))
      .returning()

    if (!deletedTraining) {
      logger.error(
        'No training returned after delete',
        { trainingId: id },
        'deleteTraining'
      )
      return null
    }

    await createTrainingNotification(
      `${deletedTraining.name} (Cancelled)`,
      deletedTraining.id,
      'training_updated'
    )

    logger.info(
      'Training deleted successfully',
      { trainingId: id },
      'deleteTraining'
    )
    logger.timeEnd(`delete-training-${id}`)
    return deletedTraining
  } catch (error) {
    logger.error(
      'Failed to delete training',
      logger.errorWithData(error),
      'deleteTraining'
    )
    logger.timeEnd(`delete-training-${id}`)
    return null
  }
}
