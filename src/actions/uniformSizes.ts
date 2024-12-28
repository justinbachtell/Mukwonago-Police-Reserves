'use server';

import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { uniformSizes } from '@/models/Schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from './user';

export async function getUniformSizes(user_id: number) {
  const sizes = await db.select().from(uniformSizes).where(eq(uniformSizes.user_id, user_id));
  return sizes.map(size => ({
    ...size,
    created_at: new Date(size.created_at),
    updated_at: new Date(size.updated_at),
  }));
}

export async function updateUniformSizes(user_id: number, data: UniformSizes) {
  try {
    // First, set all existing sizes to not current
    await db
      .update(uniformSizes)
      .set({ is_current: false })
      .where(eq(uniformSizes.user_id, user_id));

    const now = toISOString(new Date());

    // Then insert new current sizes
    const [updatedUniformSizes] = await db
      .insert(uniformSizes)
      .values({
        user_id,
        shirt_size: data.shirt_size || '',
        pant_size: data.pant_size || '',
        shoe_size: data.shoe_size || '',
        notes: data.notes || '',
        is_current: true,
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!updatedUniformSizes) {
      throw new Error('Failed to update uniform sizes');
    }

    return {
      ...updatedUniformSizes,
      created_at: new Date(updatedUniformSizes.created_at),
      updated_at: new Date(updatedUniformSizes.updated_at),
    };
  } catch (error) {
    console.error('Error updating uniform sizes:', error);
    throw new Error('Failed to update uniform sizes');
  }
}

export async function getCurrentUniformSizes(userId: number): Promise<UniformSizes> {
  try {
    // Get the user data
    const user = await getCurrentUser();

    if (!user) {
      throw new Error('User not found');
    }

    // Then get the current uniform sizes
    const currentSizes = await db.query.uniformSizes.findFirst({
      where: and(
        eq(uniformSizes.user_id, userId),
        eq(uniformSizes.is_current, true),
      ),
    });

    if (!currentSizes) {
      // If no sizes exist, create default sizes
      return createDefaultUniformSizes(user);
    }

    // Transform the result into the expected UniformSizes type
    const result: UniformSizes = {
      id: currentSizes.id,
      user_id: currentSizes.user_id,
      shirt_size: currentSizes.shirt_size,
      pant_size: currentSizes.pant_size,
      shoe_size: currentSizes.shoe_size,
      notes: currentSizes.notes || '',
      is_current: currentSizes.is_current,
      created_at: new Date(currentSizes.created_at),
      updated_at: new Date(currentSizes.updated_at),
      user,
    };

    return result;
  } catch (error) {
    console.error('Error fetching current uniform sizes:', error);
    throw new Error('Failed to fetch current uniform sizes');
  }
}

async function createDefaultUniformSizes(dbUser: DBUser): Promise<UniformSizes> {
  try {
    const now = toISOString(new Date());

    const [newSizes] = await db
      .insert(uniformSizes)
      .values({
        user_id: dbUser.id,
        shirt_size: '',
        pant_size: '',
        shoe_size: '',
        notes: '',
        is_current: true,
        created_at: now,
        updated_at: now,
      })
      .returning();

    if (!newSizes) {
      throw new Error('Failed to create default uniform sizes');
    }

    return {
      id: newSizes.id,
      user_id: newSizes.user_id,
      shirt_size: newSizes.shirt_size,
      pant_size: newSizes.pant_size,
      shoe_size: newSizes.shoe_size,
      notes: newSizes.notes || '',
      is_current: newSizes.is_current,
      created_at: new Date(newSizes.created_at),
      updated_at: new Date(newSizes.updated_at),
      user: dbUser,
    };
  } catch (error) {
    console.error('Error creating default uniform sizes:', error);
    throw new Error('Failed to create default uniform sizes');
  }
}
