'use server';

import type { DBUser } from '@/types/user';
import { db } from '@/libs/DB';
import { application, user } from '@/models/Schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';

export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    // Fetch both Clerk and DB user
    const [dbUser] = await db
      .select()
      .from(user)
      .where(eq(user.clerk_id, userId));

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error('User not found');
    }

    // If user not in DB, create new user
    if (!dbUser) {
      const [newUser] = await db
        .insert(user)
        .values({
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          first_name: clerkUser.firstName ?? '',
          last_name: clerkUser.lastName ?? '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          clerk_id: userId,
        })
        .returning();

      return newUser as DBUser;
    }

    // Check if Clerk data differs from DB data
    if (
      dbUser.first_name !== clerkUser.firstName
      || dbUser.last_name !== clerkUser.lastName
      || dbUser.email !== clerkUser.emailAddresses[0]?.emailAddress
    ) {
      const [updatedUser] = await db
        .update(user)
        .set({
          first_name: clerkUser.firstName ?? dbUser.first_name,
          last_name: clerkUser.lastName ?? dbUser.last_name,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? dbUser.email,
          updated_at: new Date().toISOString(),
        })
        .where(eq(user.id, dbUser.id))
        .returning();

      return updatedUser as DBUser;
    }

    return dbUser as DBUser;
  } catch (error) {
    console.error('Error fetching current user', error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const [dbUser] = await db.select().from(user).where(eq(user.id, id));
  return dbUser as DBUser;
}

export async function getAllUsers() {
  const users = await db.select().from(user);
  return users as DBUser[];
}

export async function updateUser(
  userId: number,
  data: Pick<DBUser, 'first_name' | 'last_name' | 'phone' | 'street_address' | 'city' | 'state' | 'zip_code' | 'driver_license'>,
) {
  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(user.id, userId))
      .returning();

    console.log('Updated user:', updatedUser?.id);
    return updatedUser as DBUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}
export async function getUserApplications() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not found');
  }

  const applications = await db.query.application.findMany({
    where: eq(application.user_id, user.id),
    orderBy: [desc(application.created_at)],
  });

  return applications;
}
