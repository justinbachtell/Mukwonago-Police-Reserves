'use server';

import type { DBUser } from '@/types/user'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { application, user } from '@/models/Schema'
import { desc, eq, or } from 'drizzle-orm'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'

const logger = createLogger({
  module: 'users',
  file: 'user.ts'
})

// Helper function to split full name into first and last name
function splitFullName(metadata: any): { firstName: string; lastName: string } {
  const fullName = metadata?.name || metadata?.full_name || ''
  const nameParts = fullName.split(' ')
  return {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || ''
  }
}

export async function getAuthUserFromSupabase() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError?.message === 'Auth session missing!') {
    logger.info('No auth session found', undefined, 'getUserFromSupabase')
    return null
  }

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

    // First try to get the user
    let [dbUser] = await db.select().from(user).where(eq(user.id, authUser.id))

    // Split the full name from metadata only for new users
    const { firstName, lastName } = splitFullName(authUser.user_metadata)

    // If no user exists, try to create one with error handling for race conditions
    if (!dbUser) {
      logger.info(
        'Attempting to create new user in public.user',
        { userId: authUser.id },
        'getCurrentUser'
      )

      try {
        const now = toISOString(new Date())
        // Check if email is from mkpd.org domain
        const isMkpdEmail = authUser.email?.toLowerCase().endsWith('@mkpd.org')
        const defaultRole = isMkpdEmail ? 'member' : 'guest'

        logger.info(
          'Setting user role based on email domain',
          { email: authUser.email, role: defaultRole },
          'getCurrentUser'
        )

        const [newUser] = await db
          .insert(user)
          .values({
            id: authUser.id,
            created_at: now,
            email: authUser.email ?? '',
            first_name: firstName,
            last_name: lastName,
            updated_at: now,
            role: defaultRole,
            position: 'reserve',
            status: 'active'
          })
          .returning()

        if (newUser) {
          logger.info(
            'New user created successfully',
            { id: newUser.id, role: defaultRole },
            'getCurrentUser'
          )
          dbUser = newUser
        }
      } catch (insertError: any) {
        // If error is duplicate key, try to fetch the user again
        if (insertError?.code === '23505') {
          logger.info(
            'User already exists (race condition), fetching existing user',
            { userId: authUser.id },
            'getCurrentUser'
          )
          const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, authUser.id))
          dbUser = existingUser
        } else {
          // If it's a different error, throw it
          throw insertError
        }
      }
    }

    // If we still don't have a user, something went wrong
    if (!dbUser) {
      logger.error(
        'Failed to get or create user',
        { userId: authUser.id },
        'getCurrentUser'
      )
      return null
    }

    // Only update if email changes - don't overwrite manually entered names
    if (dbUser.email !== authUser.email) {
      logger.info(
        'Updating user email',
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

      if (updatedUser) {
        dbUser = updatedUser
      }
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

export async function getDepartmentContacts() {
  logger.info('Getting department contacts', undefined, 'getDepartmentContacts')

  try {
    const users = await db
      .select()
      .from(user)
      .where(or(eq(user.role, 'member'), eq(user.role, 'admin')))
      .orderBy(user.first_name, user.last_name)

    if (!users) {
      logger.error(
        'Failed to fetch contacts',
        undefined,
        'getDepartmentContacts'
      )
      return null
    }

    const contacts = users.map(u => ({
      ...u,
      created_at: toISOString(u.created_at),
      updated_at: toISOString(u.updated_at)
    })) as DBUser[]

    logger.info(
      'Department contacts retrieved',
      { count: contacts.length },
      'getDepartmentContacts'
    )

    return contacts
  } catch (error) {
    logger.error(
      'Failed to get department contacts',
      logger.errorWithData(error),
      'getDepartmentContacts'
    )
    return null
  }
}
