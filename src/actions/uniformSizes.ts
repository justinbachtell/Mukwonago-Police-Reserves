'use server';

import type { RequiredUniformSizesFields } from '@/types/uniformSizes'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { uniformSizes } from '@/models/Schema'
import { and, eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'

const logger = createLogger({
  module: 'uniform-sizes',
  file: 'uniformSizes.ts'
})

export async function getUniformSizes(user_id: string) {
  logger.info('Fetching uniform sizes', { userId: user_id }, 'getUniformSizes')
  logger.time(`fetch-uniform-sizes-${user_id}`)

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
        'getUniformSizes'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getUniformSizes')
      return null
    }

    const sizes = await db
      .select()
      .from(uniformSizes)
      .where(eq(uniformSizes.user_id, user_id))

    logger.info(
      'Uniform sizes retrieved',
      {
        userId: user_id,
        count: sizes.length
      },
      'getUniformSizes'
    )
    logger.timeEnd(`fetch-uniform-sizes-${user_id}`)

    return sizes.map(size => ({
      ...size,
      created_at: new Date(size.created_at),
      updated_at: new Date(size.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch uniform sizes',
      logger.errorWithData(error),
      'getUniformSizes'
    )
    logger.timeEnd(`fetch-uniform-sizes-${user_id}`)
    return null
  }
}

export async function getCurrentUniformSizes(user_id: string) {
  logger.info(
    'Fetching current uniform sizes',
    { userId: user_id },
    'getCurrentUniformSizes'
  )
  logger.time(`fetch-current-sizes-${user_id}`)

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
        'getCurrentUniformSizes'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getCurrentUniformSizes')
      return null
    }

    const [currentSizes] = await db
      .select()
      .from(uniformSizes)
      .where(
        and(
          eq(uniformSizes.user_id, user_id),
          eq(uniformSizes.is_current, true)
        )
      )

    if (!currentSizes) {
      logger.warn(
        'No current uniform sizes found',
        { userId: user_id },
        'getCurrentUniformSizes'
      )
      logger.timeEnd(`fetch-current-sizes-${user_id}`)
      return null
    }

    logger.info(
      'Current uniform sizes retrieved',
      { userId: user_id },
      'getCurrentUniformSizes'
    )
    logger.timeEnd(`fetch-current-sizes-${user_id}`)

    return {
      ...currentSizes,
      created_at: new Date(currentSizes.created_at),
      updated_at: new Date(currentSizes.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to fetch current uniform sizes',
      logger.errorWithData(error),
      'getCurrentUniformSizes'
    )
    logger.timeEnd(`fetch-current-sizes-${user_id}`)
    return null
  }
}

export async function updateUniformSizes(
  user_id: string,
  data: RequiredUniformSizesFields
) {
  logger.info(
    'Updating uniform sizes',
    { userId: user_id, sizes: data },
    'updateUniformSizes'
  )
  logger.time(`update-uniform-sizes-${user_id}`)

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
        'updateUniformSizes'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'updateUniformSizes')
      return null
    }

    // First, set all existing sizes to not current
    await db
      .update(uniformSizes)
      .set({ is_current: false })
      .where(eq(uniformSizes.user_id, user_id))

    const now = toISOString(new Date())

    // Then insert new current sizes
    const [updatedUniformSizes] = await db
      .insert(uniformSizes)
      .values({
        created_at: now,
        is_current: true,
        notes: '',
        pant_size: data.pant_size,
        shirt_size: data.shirt_size,
        shoe_size: data.shoe_size,
        updated_at: now,
        user_id
      })
      .returning()

    if (!updatedUniformSizes) {
      logger.error(
        'No sizes returned after update',
        { userId: user_id },
        'updateUniformSizes'
      )
      logger.timeEnd(`update-uniform-sizes-${user_id}`)
      return null
    }

    logger.info(
      'Uniform sizes updated successfully',
      {
        userId: user_id,
        sizesId: updatedUniformSizes.id
      },
      'updateUniformSizes'
    )
    logger.timeEnd(`update-uniform-sizes-${user_id}`)

    return {
      ...updatedUniformSizes,
      created_at: new Date(updatedUniformSizes.created_at),
      updated_at: new Date(updatedUniformSizes.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to update uniform sizes',
      logger.errorWithData(error),
      'updateUniformSizes'
    )
    logger.timeEnd(`update-uniform-sizes-${user_id}`)
    return null
  }
}
