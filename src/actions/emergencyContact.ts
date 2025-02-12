'use server';

import type { EmergencyContact } from '@/types/emergencyContact'
import type { DBUser } from '@/types/user'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { emergencyContact } from '@/models/Schema'
import { and, eq } from 'drizzle-orm'
import { getCurrentUser } from './user'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'

const logger = createLogger({
  module: 'emergency-contact',
  file: 'emergencyContact.ts'
})

export async function getEmergencyContact(user_id: string) {
  logger.info(
    'Fetching emergency contacts',
    { userId: user_id },
    'getEmergencyContact'
  )
  logger.time(`fetch-contacts-${user_id}`)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      logger.error(
        'Failed to get Supabase session',
        logger.errorWithData(userError),
        'getEmergencyContact'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getEmergencyContact')
      return null
    }

    const contacts = await db
      .select()
      .from(emergencyContact)
      .where(eq(emergencyContact.user_id, user_id))

    logger.info(
      'Emergency contacts retrieved',
      { count: contacts.length, userId: user_id },
      'getEmergencyContact'
    )
    logger.timeEnd(`fetch-contacts-${user_id}`)

    return contacts.map(contact => ({
      ...contact,
      created_at: new Date(contact.created_at),
      updated_at: new Date(contact.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch emergency contacts',
      logger.errorWithData(error),
      'getEmergencyContact'
    )
    return null
  }
}

export async function updateEmergencyContact(
  user_id: string,
  data: EmergencyContact
) {
  logger.info(
    'Updating emergency contact',
    { userId: user_id, contactName: `${data.first_name} ${data.last_name}` },
    'updateEmergencyContact'
  )
  logger.time(`update-contact-${user_id}`)

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
        'updateEmergencyContact'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'updateEmergencyContact')
      return null
    }

    const now = toISOString(new Date())

    // First, set all existing emergency contacts to not current
    logger.info(
      'Deactivating existing contacts',
      { userId: user_id },
      'updateEmergencyContact'
    )
    await db
      .update(emergencyContact)
      .set({ is_current: false })
      .where(eq(emergencyContact.user_id, user_id))

    // Prepare the contact data
    const contactData = {
      city: data.city,
      email: data.email,
      first_name: data.first_name,
      is_current: true,
      last_name: data.last_name,
      phone: data.phone,
      relationship: data.relationship,
      state: data.state,
      street_address: data.street_address,
      updated_at: now,
      user_id,
      zip_code: data.zip_code
    }

    let updatedEmergencyContact

    // If we have an existing contact ID and it's not 0, update it
    if (data.id && data.id !== 0) {
      logger.info(
        'Updating existing contact',
        { contactId: data.id },
        'updateEmergencyContact'
      )
      ;[updatedEmergencyContact] = await db
        .update(emergencyContact)
        .set(contactData)
        .where(eq(emergencyContact.id, data.id))
        .returning()
    } else {
      // Otherwise, create a new contact
      logger.info(
        'Creating new contact record',
        { userId: user_id },
        'updateEmergencyContact'
      )
      ;;[updatedEmergencyContact] = await db
        .insert(emergencyContact)
        .values({
          ...contactData,
          created_at: now
        })
        .returning()
    }

    if (!updatedEmergencyContact) {
      logger.error(
        'No contact returned after operation',
        { userId: user_id },
        'updateEmergencyContact'
      )
      return null
    }

    logger.info(
      'Emergency contact updated successfully',
      { contactId: updatedEmergencyContact.id, userId: user_id },
      'updateEmergencyContact'
    )
    logger.timeEnd(`update-contact-${user_id}`)

    return {
      ...updatedEmergencyContact,
      created_at: new Date(updatedEmergencyContact.created_at),
      updated_at: new Date(updatedEmergencyContact.updated_at)
    }
  } catch (error) {
    logger.error(
      'Failed to update emergency contact',
      logger.errorWithData(error),
      'updateEmergencyContact'
    )
    return null
  }
}

export async function getCurrentEmergencyContact() {
  logger.info(
    'Fetching current emergency contact',
    undefined,
    'getCurrentEmergencyContact'
  )
  logger.time('fetch-current-contact')

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
        'getCurrentEmergencyContact'
      )
      return null
    }

    if (!user) {
      logger.warn(
        'No active user found',
        undefined,
        'getCurrentEmergencyContact'
      )
      return null
    }

    const dbUser = await getCurrentUser()
    if (!dbUser) {
      logger.error(
        'Current user not found',
        undefined,
        'getCurrentEmergencyContact'
      )
      return null
    }

    const userId = user.id
    logger.info(
      'Fetching current contact for user',
      { userId },
      'getCurrentEmergencyContact'
    )

    const [currentContact] = await db
      .select()
      .from(emergencyContact)
      .where(
        and(
          eq(emergencyContact.user_id, userId),
          eq(emergencyContact.is_current, true)
        )
      )

    if (!currentContact) {
      logger.info(
        'No current contact found, creating default',
        { userId },
        'getCurrentEmergencyContact'
      )
      logger.timeEnd('fetch-current-contact')
      return createDefaultEmergencyContact(dbUser)
    }

    logger.info(
      'Current contact retrieved',
      { contactId: currentContact.id, userId },
      'getCurrentEmergencyContact'
    )
    logger.timeEnd('fetch-current-contact')

    return {
      city: currentContact.city || '',
      created_at: new Date(currentContact.created_at),
      email: currentContact.email || '',
      first_name: currentContact.first_name,
      id: currentContact.id,
      is_current: currentContact.is_current,
      last_name: currentContact.last_name,
      phone: currentContact.phone,
      relationship: currentContact.relationship,
      state: currentContact.state || '',
      street_address: currentContact.street_address || '',
      updated_at: new Date(currentContact.updated_at),
      user: dbUser,
      user_id: currentContact.user_id,
      zip_code: currentContact.zip_code || ''
    }
  } catch (error) {
    logger.error(
      'Failed to fetch current emergency contact',
      logger.errorWithData(error),
      'getCurrentEmergencyContact'
    )
    logger.timeEnd('fetch-current-contact')
    return null
  }
}

async function createDefaultEmergencyContact(
  dbUser: DBUser
): Promise<EmergencyContact | null> {
  logger.info(
    'Creating default emergency contact',
    { userId: dbUser.id },
    'createDefaultEmergencyContact'
  )
  logger.time(`create-default-contact-${dbUser.id}`)

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
        'createDefaultEmergencyContact'
      )
      return null
    }

    if (!user) {
      logger.warn(
        'No active user found',
        undefined,
        'createDefaultEmergencyContact'
      )
      return null
    }

    const now = toISOString(new Date())
    const defaultContact = {
      created_at: now,
      email: '',
      first_name: '',
      is_current: true,
      last_name: '',
      phone: '',
      relationship: '',
      updated_at: now,
      user_id: dbUser.id
    }

    logger.info(
      'Inserting default contact',
      { userId: dbUser.id },
      'createDefaultEmergencyContact'
    )

    const [newContact] = await db
      .insert(emergencyContact)
      .values(defaultContact)
      .returning()

    if (!newContact) {
      logger.error(
        'No contact returned after insert',
        { userId: dbUser.id },
        'createDefaultEmergencyContact'
      )
      return null
    }

    logger.info(
      'Default contact created',
      { contactId: newContact.id, userId: dbUser.id },
      'createDefaultEmergencyContact'
    )
    logger.timeEnd(`create-default-contact-${dbUser.id}`)

    return {
      city: newContact.city || '',
      created_at: new Date(newContact.created_at),
      email: newContact.email || '',
      first_name: newContact.first_name,
      id: newContact.id,
      is_current: newContact.is_current,
      last_name: newContact.last_name,
      phone: newContact.phone,
      relationship: newContact.relationship,
      state: newContact.state || '',
      street_address: newContact.street_address || '',
      updated_at: new Date(newContact.updated_at),
      user: dbUser,
      user_id: newContact.user_id,
      zip_code: newContact.zip_code || ''
    }
  } catch (error) {
    logger.error(
      'Failed to create default emergency contact',
      logger.errorWithData(error),
      'createDefaultEmergencyContact'
    )
    logger.timeEnd(`create-default-contact-${dbUser.id}`)
    return null
  }
}
