'use server';

import type { DBUser } from '@/types/user'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { application, user } from '@/models/Schema'
import { desc, eq } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'

const logger = createLogger({
  module: 'users',
  file: 'user.ts'
})

export async function getAuthUserFromSupabase() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (!user || userError) {
    logger.error(
      'Failed to get Supabase user',
      logger.errorWithData(userError),
      'getUserFromSupabase'
    )
    return null
  }

  return user
}

export async function getCurrentUser() {
  logger.info('Fetching current user', undefined, 'getCurrentUser')

  const authUser = await getAuthUserFromSupabase()

  try {
    if (!authUser) {
      logger.warn('No active user found', undefined, 'getCurrentUser')
      return null
    }

    logger.time(`fetch-user-${authUser.id}`)
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, authUser.id))

    // If user not in public.user, create new user
    if (!dbUser) {
      logger.info(
        'Creating new user in public.user',
        { userId: authUser.id },
        'getCurrentUser'
      )
      const now = toISOString(new Date())
      const [newUser] = await db
        .insert(user)
        .values({
          id: authUser.id,
          created_at: now,
          email: authUser.email ?? '',
          first_name: authUser.user_metadata.first_name ?? '',
          last_name: authUser.user_metadata.last_name ?? '',
          updated_at: now,
          role: 'guest',
          position: 'reserve',
          status: 'active'
        })
        .returning()

      if (!newUser) {
        logger.error(
          'Failed to create new user',
          { id: authUser.id },
          'getCurrentUser'
        )
        return null
      }

      logger.info(
        'New user created successfully',
        { id: newUser.id },
        'getCurrentUser'
      )
      logger.timeEnd(`fetch-user-${authUser.id}`)

      return {
        ...newUser
      } as DBUser
    }

    // Check if Supabase email differs from DB
    if (dbUser.email !== authUser.email) {
      logger.info(
        'Updating user with Supabase email',
        {
          userId: dbUser.id,
          oldEmail: dbUser.email,
          newEmail: authUser.email
        },
        'getCurrentUser'
      )

      const [updatedUser] = await db
        .update(user)
        .set({
          email: authUser.email ?? '',
          updated_at: toISOString(new Date())
        })
        .where(eq(user.id, dbUser.id))
        .returning()

      if (!updatedUser) {
        logger.error(
          'Failed to update user with Supabase email',
          { userId: dbUser.id },
          'getCurrentUser'
        )
        return null
      }

      logger.info(
        'User updated with Supabase email',
        {
          userId: updatedUser.id,
          email: updatedUser.email
        },
        'getCurrentUser'
      )
      logger.timeEnd(`fetch-user-${authUser.id}`)

      return {
        ...updatedUser
      } as DBUser
    }

    logger.info(
      'User retrieved successfully',
      { userId: dbUser.id },
      'getCurrentUser'
    )
    logger.timeEnd(`fetch-user-${authUser.id}`)

    return {
      ...dbUser
    } as DBUser
  } catch (error) {
    logger.error(
      'Failed to fetch current user',
      logger.errorWithData(error),
      'getCurrentUser'
    )
    return null
  }
}

export async function getUserById(userId: string) {
  logger.info('Fetching user by ID', { userId }, 'getUserById')

  try {
    logger.time(`fetch-user-${userId}`)
    const [dbUser] = await db.select().from(user).where(eq(user.id, userId))

    if (!dbUser) {
      logger.warn('User not found', { userId }, 'getUserById')
      return null
    }

    logger.info('User retrieved successfully', { userId }, 'getUserById')
    logger.timeEnd(`fetch-user-${userId}`)

    return {
      ...dbUser
    } as DBUser
  } catch (error) {
    logger.error(
      'Failed to fetch user by ID',
      logger.errorWithData(error),
      'getUserById'
    )
    return null
  }
}

export async function getAllUsers() {
  logger.info('Fetching all users', undefined, 'getAllUsers')

  try {
    logger.time('fetch-all-users')
    const users = await db.select().from(user).orderBy(desc(user.created_at))

    logger.info(
      'Users retrieved successfully',
      { count: users.length },
      'getAllUsers'
    )
    logger.timeEnd('fetch-all-users')

    return users.map(u => ({
      ...u
    })) as DBUser[]
  } catch (error) {
    logger.error(
      'Failed to fetch all users',
      logger.errorWithData(error),
      'getAllUsers'
    )
    return []
  }
}

export async function updateUser(
  userId: string,
  data: Partial<
    Pick<
      DBUser,
      | 'first_name'
      | 'last_name'
      | 'email'
      | 'phone'
      | 'street_address'
      | 'city'
      | 'state'
      | 'zip_code'
      | 'driver_license'
      | 'driver_license_state'
      | 'callsign'
      | 'radio_number'
      | 'status'
    >
  >
) {
  logger.info('Updating user', { userId, updates: data }, 'updateUser')

  try {
    logger.time(`update-user-${userId}`)
    const [updatedUser] = await db
      .update(user)
      .set({
        ...data,
        updated_at: toISOString(new Date())
      })
      .where(eq(user.id, userId))
      .returning()

    if (!updatedUser) {
      logger.error('No user returned after update', { userId }, 'updateUser')
      return null
    }

    logger.info('User updated successfully', { userId }, 'updateUser')
    logger.timeEnd(`update-user-${userId}`)

    return {
      ...updatedUser
    } as DBUser
  } catch (error) {
    logger.error(
      'Failed to update user',
      logger.errorWithData(error),
      'updateUser'
    )
    return null
  }
}

export async function getUserApplications() {
  logger.info('Fetching user applications', undefined, 'getUserApplications')

  try {
    const currentUserData = await getCurrentUser()
    if (!currentUserData) {
      logger.error('User not found', undefined, 'getUserApplications')
      return null
    }

    logger.time(`fetch-applications-${currentUserData.id}`)
    const applications = await db.query.application.findMany({
      orderBy: [desc(application.created_at)],
      where: eq(application.user_id, currentUserData.id)
    })

    logger.info(
      'User applications retrieved',
      {
        userId: currentUserData.id,
        count: applications.length
      },
      'getUserApplications'
    )
    logger.timeEnd(`fetch-applications-${currentUserData.id}`)

    return applications.map(app => ({
      ...app,
      created_at: new Date(app.created_at),
      updated_at: new Date(app.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch user applications',
      logger.errorWithData(error),
      'getUserApplications'
    )
    return null
  }
}

export async function updateUserRole(userId: string, role: DBUser['role']) {
  logger.info('Updating user role', { userId, role }, 'updateUserRole')

  try {
    logger.time(`update-user-role-${userId}`)
    const [updatedUser] = await db
      .update(user)
      .set({
        role,
        updated_at: toISOString(new Date())
      })
      .where(eq(user.id, userId))
      .returning()

    if (!updatedUser) {
      logger.error(
        'No user returned after role update',
        { userId },
        'updateUserRole'
      )
      return null
    }

    logger.info(
      'User role updated successfully',
      { userId, role },
      'updateUserRole'
    )
    logger.timeEnd(`update-user-role-${userId}`)

    return {
      ...updatedUser
    } as DBUser
  } catch (error) {
    logger.error(
      'Failed to update user role',
      logger.errorWithData(error),
      'updateUserRole'
    )
    return null
  }
}

interface UpdateSettingsData {
  email: string
  currentPassword?: string
  newPassword?: string
}

export async function updateUserSettings(
  userId: string,
  data: UpdateSettingsData
) {
  logger.info('Updating user settings', { userId }, 'updateUserSettings')

  try {
    logger.time(`update-settings-${userId}`)
    const supabase = await createClient()

    // If password change is requested
    if (data.currentPassword && data.newPassword) {
      logger.info('Updating password', { userId }, 'updateUserSettings')
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (passwordError) {
        logger.error(
          'Failed to update password',
          logger.errorWithData(passwordError),
          'updateUserSettings'
        )
        return {
          success: false,
          message:
            'Failed to update password. Please check your current password.'
        }
      }
    }

    // If email change is requested
    if (data.email) {
      logger.info('Updating email', { userId }, 'updateUserSettings')
      const { error: emailError } = await supabase.auth.updateUser({
        email: data.email
      })

      if (emailError) {
        logger.error(
          'Failed to update email',
          logger.errorWithData(emailError),
          'updateUserSettings'
        )
        return {
          success: false,
          message: 'Failed to update email. Please try again.'
        }
      }

      // Update email in database
      const [updatedUser] = await db
        .update(user)
        .set({
          email: data.email,
          updated_at: toISOString(new Date())
        })
        .where(eq(user.id, userId))
        .returning()

      if (!updatedUser) {
        logger.error(
          'Failed to update user email in database',
          { userId },
          'updateUserSettings'
        )
        return {
          success: false,
          message: 'Failed to update email in database.'
        }
      }
    }

    logger.info(
      'Settings updated successfully',
      { userId },
      'updateUserSettings'
    )
    logger.timeEnd(`update-settings-${userId}`)

    return {
      success: true,
      message: 'Settings updated successfully'
    }
  } catch (error) {
    logger.error(
      'Failed to update user settings',
      logger.errorWithData(error),
      'updateUserSettings'
    )
    return {
      success: false,
      message: 'An unexpected error occurred'
    }
  }
}
