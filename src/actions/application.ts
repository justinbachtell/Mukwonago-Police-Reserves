'use server';

import type { availabilityEnum, positionsEnum, priorExperienceEnum } from '@/models/Schema';
import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { application } from '@/models/Schema';
import { eq } from 'drizzle-orm';

export interface CreateApplicationData {
  first_name: string
  last_name: string
  email: string
  phone: string
  driver_license: string
  street_address: string
  city: string
  state: string
  zip_code: string
  prior_experience: (typeof priorExperienceEnum.enumValues)[number]
  availability: (typeof availabilityEnum.enumValues)[number]
  position: (typeof positionsEnum.enumValues)[number]
  user_id: number
}

export async function createApplication(data: CreateApplicationData) {
  try {
    const now = toISOString(new Date());
    await db.insert(application).values({
      ...data,
      created_at: now,
      status: 'pending',
      updated_at: now,
    });
  }
 catch (error) {
    console.error('Error creating application:', error);
    throw new Error('Failed to create application');
  }
}

export async function getAllApplications() {
  try {
    const applications = await db.select().from(application);
    return applications;
  }
 catch (error) {
    console.error('Error getting all applications:', error);
    throw new Error('Failed to get all applications');
  }
}

export async function getUserApplications(userId: number) {
  try {
    const userApplications = await db
      .select()
      .from(application)
      .where(eq(application.user_id, userId))
      .orderBy(application.created_at);

    return userApplications;
  }
 catch (error) {
    console.error('Error getting user applications:', error);
    throw new Error('Failed to get user applications');
  }
}

export async function updateApplicationStatus(
  applicationId: number,
  status: 'pending' | 'approved' | 'rejected',
) {
  try {
    await db.update(application).set({ status }).where(eq(application.id, applicationId));
  }
 catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
}

export async function deleteApplication(applicationId: number) {
  try {
    await db.delete(application).where(eq(application.id, applicationId));
  }
 catch (error) {
    console.error('Error deleting application:', error);
    throw new Error('Failed to delete application');
  }
}
