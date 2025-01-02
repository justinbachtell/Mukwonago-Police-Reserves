'use server';

import type { EmergencyContact } from '@/types/emergencyContact';
import type { DBUser } from '@/types/user';
import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { emergencyContact } from '@/models/Schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from './user';

export async function getEmergencyContact(user_id: number) {
  const contacts = await db
    .select()
    .from(emergencyContact)
    .where(eq(emergencyContact.user_id, user_id));
  return contacts.map(contact => ({
    ...contact,
    created_at: new Date(contact.created_at),
    updated_at: new Date(contact.updated_at),
  }));
}

export async function updateEmergencyContact(user_id: number, data: EmergencyContact) {
  try {
    // First, set all existing emergency contacts to not current
    await db
      .update(emergencyContact)
      .set({ is_current: false })
      .where(eq(emergencyContact.user_id, user_id));

    const now = toISOString(new Date());
    // Insert new emergency contact
    const [updatedEmergencyContact] = await db
      .insert(emergencyContact)
      .values({
        city: data.city,
        created_at: now,
        email: data.email,
        first_name: data.first_name,
        is_current: true,
        last_name: data.last_name,
        phone: data.phone,
        relationship: data.relationship,
        state: data.state,
        street_address: data.street_address,
        updated_at: now,
        user_id: data.user_id,
        zip_code: data.zip_code,
      })
      .returning();

    if (!updatedEmergencyContact) {
      throw new Error('Failed to update emergency contact');
    }

    return {
      ...updatedEmergencyContact,
      created_at: new Date(updatedEmergencyContact.created_at),
      updated_at: new Date(updatedEmergencyContact.updated_at),
    };
  }
  catch (error) {
    console.error('Error updating emergency contact:', error);
    throw new Error('Failed to update emergency contact');
  }
}

export async function getCurrentEmergencyContact(userId: number): Promise<EmergencyContact> {
  try {
    // Get the user data
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not found');
    }

    // Then get the current emergency contact
    const currentContact = await db.query.emergencyContact.findFirst({
      where: and(eq(emergencyContact.user_id, userId), eq(emergencyContact.is_current, true)),
    });

    if (!currentContact) {
      // If no contact exists, create default contact
      return createDefaultEmergencyContact(user);
    }

    // Transform the result into the expected EmergencyContact type
    const result: EmergencyContact = {
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
      user,
      user_id: currentContact.user_id,
      zip_code: currentContact.zip_code || '',
    };

    return result;
  }
  catch (error) {
    console.error('Error fetching current emergency contact:', error);
    throw new Error('Failed to fetch current emergency contact');
  }
}

async function createDefaultEmergencyContact(dbUser: DBUser): Promise<EmergencyContact> {
  try {
    const now = toISOString(new Date());
    const defaultContact = {
      created_at: now,
      email: '',
      first_name: '',
      is_current: true,
      last_name: '',
      phone: '',
      relationship: '',
      updated_at: now,
      user_id: dbUser.id,
    };

    const [newContact] = await db.insert(emergencyContact).values(defaultContact).returning();

    if (!newContact) {
      throw new Error('Failed to create default emergency contact');
    }

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
      zip_code: newContact.zip_code || '',
    };
  }
  catch (error) {
    console.error('Error creating default emergency contact:', error);
    throw new Error('Failed to create default emergency contact');
  }
}
