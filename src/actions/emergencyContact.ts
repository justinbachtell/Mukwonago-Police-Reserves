'use server';

import type { EmergencyContact } from '@/types/emergencyContact';
import type { DBUser } from '@/types/user';
import { db } from '@/libs/DB';
import { emergencyContact } from '@/models/Schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from './user';

export async function getEmergencyContact(user_id: number) {
  const contact = await db.select().from(emergencyContact).where(eq(emergencyContact.user_id, user_id));
  return contact;
}

export async function updateEmergencyContact(user_id: number, data: EmergencyContact) {
  try {
    // First, set all existing emergency contacts to not current
    await db
      .update(emergencyContact)
      .set({ is_current: false })
      .where(eq(emergencyContact.user_id, user_id));

    // Insert new emergency contact
    const [updatedEmergencyContact] = await db
      .insert(emergencyContact)
      .values({
        user_id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        email: data.email,
        relationship: data.relationship,
        is_current: true,
        street_address: data.street_address,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning();

    return updatedEmergencyContact;
  } catch (error) {
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
      where: and(
        eq(emergencyContact.user_id, userId),
        eq(emergencyContact.is_current, true),
      ),
    });

    if (!currentContact) {
      // If no contact exists, create default contact
      return createDefaultEmergencyContact(user);
    }

    // Transform the result into the expected EmergencyContact type
    const result: EmergencyContact = {
      id: currentContact.id,
      user_id: currentContact.user_id,
      first_name: currentContact.first_name,
      last_name: currentContact.last_name,
      phone: currentContact.phone,
      email: currentContact.email || '',
      relationship: currentContact.relationship,
      is_current: currentContact.is_current,
      street_address: currentContact.street_address || '',
      city: currentContact.city || '',
      state: currentContact.state || '',
      zip_code: currentContact.zip_code || '',
      created_at: currentContact.created_at,
      updated_at: currentContact.updated_at,
      user,
    };

    return result;
  } catch (error) {
    console.error('Error fetching current emergency contact:', error);
    throw new Error('Failed to fetch current emergency contact');
  }
}

async function createDefaultEmergencyContact(dbUser: DBUser): Promise<EmergencyContact> {
  try {
    const defaultContact = {
      user_id: dbUser.id,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      relationship: '',
      is_current: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const [newContact] = await db
      .insert(emergencyContact)
      .values(defaultContact)
      .returning();

    if (!newContact) {
      throw new Error('Failed to create default emergency contact');
    }

    return {
      id: newContact.id,
      user_id: newContact.user_id,
      first_name: newContact.first_name,
      last_name: newContact.last_name,
      phone: newContact.phone,
      email: newContact.email || '',
      relationship: newContact.relationship,
      is_current: newContact.is_current,
      street_address: newContact.street_address || '',
      city: newContact.city || '',
      state: newContact.state || '',
      zip_code: newContact.zip_code || '',
      created_at: newContact.created_at,
      updated_at: newContact.updated_at,
      user: dbUser,
    };
  } catch (error) {
    console.error('Error creating default emergency contact:', error);
    throw new Error('Failed to create default emergency contact');
  }
}
