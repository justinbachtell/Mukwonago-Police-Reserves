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
        created_at: now,
        is_current: true,
        notes: data.notes || '',
        pant_size: data.pant_size || '',
        shirt_size: data.shirt_size || '',
        shoe_size: data.shoe_size || '',
        updated_at: now,
        user_id,
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
  }
 catch (error) {
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
      where: and(eq(uniformSizes.user_id, userId), eq(uniformSizes.is_current, true)),
    });

    if (!currentSizes) {
      // If no sizes exist, create default sizes
      return createDefaultUniformSizes(user);
    }

    // Transform the result into the expected UniformSizes type
    const result: UniformSizes = {
      created_at: new Date(currentSizes.created_at),
      id: currentSizes.id,
      is_current: currentSizes.is_current,
      notes: currentSizes.notes || '',
      pant_size: currentSizes.pant_size,
      shirt_size: currentSizes.shirt_size,
      shoe_size: currentSizes.shoe_size,
      updated_at: new Date(currentSizes.updated_at),
      user,
      user_id: currentSizes.user_id,
    };

    return result;
  }
 catch (error) {
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
        created_at: now,
        is_current: true,
        notes: '',
        pant_size: '',
        shirt_size: '',
        shoe_size: '',
        updated_at: now,
        user_id: dbUser.id,
      })
      .returning();

    if (!newSizes) {
      throw new Error('Failed to create default uniform sizes');
    }

    return {
      created_at: new Date(newSizes.created_at),
      id: newSizes.id,
      is_current: newSizes.is_current,
      notes: newSizes.notes || '',
      pant_size: newSizes.pant_size,
      shirt_size: newSizes.shirt_size,
      shoe_size: newSizes.shoe_size,
      updated_at: new Date(newSizes.updated_at),
      user: dbUser,
      user_id: newSizes.user_id,
    };
  }
 catch (error) {
    console.error('Error creating default uniform sizes:', error);
    throw new Error('Failed to create default uniform sizes');
  }
}
