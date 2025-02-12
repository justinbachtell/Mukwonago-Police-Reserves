'use server'

import type { RequiredTrainingFields, UpdateTraining } from '@/types/training'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { training } from '@/models/Schema'
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
  logger.info(
    'Creating new training',
    {
      name: data.name,
      type: data.training_type,
      date: data.training_date,
      instructor: data.training_instructor || 'none'
    },
    'createTraining'
  )
  logger.time(`create-training-${data.name}`)

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
        'createTraining'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'createTraining')
      return null
    }

    const now = toISOString(new Date())
    const [newTraining] = await db
      .insert(training)
      .values({
        ...data,
        training_date: toISOString(data.training_date),
        training_start_time: toISOString(data.training_start_time),
        training_end_time: toISOString(data.training_end_time),
        training_instructor: data.training_instructor,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!newTraining) {
      logger.error(
        'No training returned after insert',
        { name: data.name },
        'createTraining'
      )
      return null
    }

    await createTrainingNotification(newTraining.name, newTraining.id)

    logger.info(
      'Training created successfully',
      {
        id: newTraining.id,
        name: newTraining.name
      },
      'createTraining'
    )
    logger.timeEnd(`create-training-${data.name}`)

    return {
      ...newTraining,
      created_at: new Date(newTraining.created_at),
      training_date: new Date(newTraining.training_date),
      training_end_time: new Date(newTraining.training_end_time),
      training_start_time: new Date(newTraining.training_start_time),
      updated_at: new Date(newTraining.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to create training',
      logger.errorWithData(error),
      'createTraining'
    )
    logger.timeEnd(`create-training-${data.name}`)
    return null
  }
}

export async function updateTraining(id: number, data: UpdateTraining) {
  logger.info(
    'Updating training',
    {
      trainingId: id,
      updates: {
        ...data,
        instructor: data.training_instructor || 'none'
      }
    },
    'updateTraining'
  )
  logger.time(`update-training-${id}`)

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
        'updateTraining'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'updateTraining')
      return null
    }

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
        training_instructor: data.training_instructor,
        updated_at: toISOString(new Date())
      })
      .where(eq(training.id, id))
      .returning()

    if (!updatedTraining) {
      logger.error(
        'No training returned after update',
        { trainingId: id },
        'updateTraining'
      )
      return null
    }

    await createTrainingNotification(
      updatedTraining.name,
      updatedTraining.id,
      'training_updated'
    )

    logger.info(
      'Training updated successfully',
      {
        id: updatedTraining.id,
        name: updatedTraining.name
      },
      'updateTraining'
    )
    logger.timeEnd(`update-training-${id}`)

    return {
      ...updatedTraining,
      created_at: new Date(updatedTraining.created_at),
      training_date: new Date(updatedTraining.training_date),
      training_end_time: new Date(updatedTraining.training_end_time),
      training_start_time: new Date(updatedTraining.training_start_time),
      updated_at: new Date(updatedTraining.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to update training',
      logger.errorWithData(error),
      'updateTraining'
    )
    logger.timeEnd(`update-training-${id}`)
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
