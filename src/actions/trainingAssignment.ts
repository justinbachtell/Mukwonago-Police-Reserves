'use server'

import type {
  RequiredTrainingAssignmentFields,
  UpdateTrainingAssignment
} from '@/types/trainingAssignment'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import {
  training,
  trainingAssignments,
  user as userSchema
} from '@/models/Schema'
import { and, eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'
import {
  createTrainingSignupNotification,
  createTrainingLeaveNotification
} from '@/actions/notification'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/actions/user'

const logger = createLogger({
  module: 'training-assignments',
  file: 'trainingAssignment.ts'
})

export async function getTrainingAssignments(training_id: number) {
  logger.info(
    'Fetching training assignments',
    { trainingId: training_id },
    'getTrainingAssignments'
  )
  logger.time(`fetch-assignments-${training_id}`)

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
        'getTrainingAssignments'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getTrainingAssignments')
      return null
    }

    const assignments = await db.query.trainingAssignments.findMany({
      where: eq(trainingAssignments.training_id, training_id),
      with: {
        user: true,
        training: true
      }
    })

    logger.info(
      'Training assignments retrieved',
      {
        trainingId: training_id,
        count: assignments.length
      },
      'getTrainingAssignments'
    )
    logger.timeEnd(`fetch-assignments-${training_id}`)

    return assignments
  } catch (error) {
    logger.error(
      'Failed to fetch training assignments',
      logger.errorWithData(error),
      'getTrainingAssignments'
    )
    logger.timeEnd(`fetch-assignments-${training_id}`)
    return null
  }
}

export async function createTrainingAssignment(
  data: RequiredTrainingAssignmentFields
) {
  logger.info(
    'Creating training assignment',
    {
      trainingId: data.training_id,
      userId: data.user_id
    },
    'createTrainingAssignment'
  )
  logger.time(`create-assignment-${data.training_id}-${data.user_id}`)

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
        'createTrainingAssignment'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'createTrainingAssignment')
      return null
    }

    const now = toISOString(new Date())
    const [newAssignment] = await db
      .insert(trainingAssignments)
      .values({
        ...data,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!newAssignment) {
      logger.error(
        'No assignment returned after insert',
        {
          trainingId: data.training_id,
          userId: data.user_id
        },
        'createTrainingAssignment'
      )
      return null
    }

    // Get the training details for the notification
    const trainingDetails = await db.query.training.findFirst({
      where: eq(training.id, data.training_id)
    })

    if (trainingDetails) {
      // Get the user details for the notification
      const userDetails = await db.query.user.findFirst({
        where: eq(userSchema.id, data.user_id)
      })

      if (userDetails) {
        await createTrainingSignupNotification(
          userDetails.first_name,
          userDetails.last_name,
          trainingDetails.name
        )
      }
    }

    logger.info(
      'Training assignment created',
      {
        id: newAssignment.id,
        trainingId: newAssignment.training_id,
        userId: newAssignment.user_id
      },
      'createTrainingAssignment'
    )
    logger.timeEnd(`create-assignment-${data.training_id}-${data.user_id}`)

    return newAssignment
  } catch (error) {
    logger.error(
      'Failed to create training assignment',
      logger.errorWithData(error),
      'createTrainingAssignment'
    )
    logger.timeEnd(`create-assignment-${data.training_id}-${data.user_id}`)
    return null
  }
}

export async function updateTrainingAssignmentStatus(
  trainingId: number,
  userId: string,
  data: UpdateTrainingAssignment
) {
  logger.info(
    'Updating training assignment',
    {
      trainingId,
      userId,
      updates: data
    },
    'updateTrainingAssignmentStatus'
  )
  logger.time(`update-assignment-${trainingId}-${userId}`)

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
        'updateTrainingAssignmentStatus'
      )
      return null
    }

    if (!user) {
      logger.warn(
        'No active user found',
        undefined,
        'updateTrainingAssignmentStatus'
      )
      return null
    }

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
      logger.error(
        'No assignment returned after update',
        {
          trainingId,
          userId
        },
        'updateTrainingAssignmentStatus'
      )
      return null
    }

    logger.info(
      'Training assignment updated',
      {
        id: updatedAssignment.id,
        status: updatedAssignment.completion_status
      },
      'updateTrainingAssignmentStatus'
    )
    logger.timeEnd(`update-assignment-${trainingId}-${userId}`)

    return updatedAssignment
  } catch (error) {
    logger.error(
      'Failed to update training assignment',
      logger.errorWithData(error),
      'updateTrainingAssignmentStatus'
    )
    logger.timeEnd(`update-assignment-${trainingId}-${userId}`)
    return null
  }
}

export async function deleteTrainingAssignment(
  training_id: number,
  user_id: string
) {
  logger.info(
    'Deleting training assignment',
    {
      trainingId: training_id,
      userId: user_id
    },
    'deleteTrainingAssignment'
  )
  logger.time(`delete-assignment-${training_id}-${user_id}`)

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
        'deleteTrainingAssignment'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'deleteTrainingAssignment')
      return null
    }

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
      logger.error(
        'No assignment returned after deletion',
        {
          trainingId: training_id,
          userId: user_id
        },
        'deleteTrainingAssignment'
      )
      return null
    }

    logger.info(
      'Training assignment deleted',
      {
        id: deletedAssignment.id
      },
      'deleteTrainingAssignment'
    )
    logger.timeEnd(`delete-assignment-${training_id}-${user_id}`)

    return deletedAssignment
  } catch (error) {
    logger.error(
      'Failed to delete training assignment',
      logger.errorWithData(error),
      'deleteTrainingAssignment'
    )
    logger.timeEnd(`delete-assignment-${training_id}-${user_id}`)
    return null
  }
}

export async function getUserTrainingAssignments(user_id: string) {
  logger.info(
    'Fetching user training assignments',
    { userId: user_id },
    'getUserTrainingAssignments'
  )
  logger.time(`fetch-user-assignments-${user_id}`)

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
        'getUserTrainingAssignments'
      )
      return null
    }

    if (!user) {
      logger.warn(
        'No active session found',
        undefined,
        'getUserTrainingAssignments'
      )
      return null
    }

    const assignments = await db.query.trainingAssignments.findMany({
      where: eq(trainingAssignments.user_id, user_id),
      with: {
        training: true
      }
    })

    logger.info(
      'User training assignments retrieved successfully',
      { userId: user_id, count: assignments.length },
      'getUserTrainingAssignments'
    )
    logger.timeEnd(`fetch-user-assignments-${user_id}`)

    return assignments
  } catch (error) {
    logger.error(
      'Failed to fetch user training assignments',
      logger.errorWithData(error),
      'getUserTrainingAssignments'
    )
    logger.timeEnd(`fetch-user-assignments-${user_id}`)
    return null
  }
}

export async function leaveTraining(trainingId: number) {
  logger.info('Leaving training', { trainingId }, 'leaveTraining')

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('User not found', undefined, 'leaveTraining')
      return null
    }

    const [trainingRecord] = await db.query.training.findMany({
      where: eq(training.id, trainingId)
    })

    if (!trainingRecord) {
      logger.error('Training not found', { trainingId }, 'leaveTraining')
      return null
    }

    const [deletedAssignment] = await db
      .delete(trainingAssignments)
      .where(
        and(
          eq(trainingAssignments.training_id, trainingId),
          eq(trainingAssignments.user_id, currentUser.id)
        )
      )
      .returning()

    if (!deletedAssignment) {
      logger.error(
        'No assignment returned after deletion',
        { trainingId, userId: currentUser.id },
        'leaveTraining'
      )
      return null
    }

    // Create notification for leaving training
    await createTrainingLeaveNotification(
      currentUser.first_name,
      currentUser.last_name,
      trainingRecord.name
    )

    logger.info(
      'Training left successfully',
      { trainingId, userId: currentUser.id },
      'leaveTraining'
    )

    revalidatePath('/training')
    revalidatePath(`/training/${trainingId}`)
    return deletedAssignment
  } catch (error) {
    logger.error(
      'Failed to leave training',
      logger.errorWithData(error),
      'leaveTraining'
    )
    return null
  }
}
