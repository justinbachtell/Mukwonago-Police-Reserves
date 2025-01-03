'use server';

import type { availabilityEnum, positionsEnum, priorExperienceEnum } from '@/models/Schema';
import { toISOString } from '@/lib/utils';
import { db } from '@/libs/DB';
import { application, user } from '@/models/Schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase credentials are not configured')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

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
  resume?: string
}

export async function uploadResume(
  file: File,
  firstName: string,
  lastName: string
): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    // Create folder name from user's first and last name
    const folderName =
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(
        /[^a-z0-9_]/g,
        ''
      ) // Remove any special characters except underscores

    // Get the original filename without extension and the extension
    const originalName = file.name.split('.').slice(0, -1).join('.')
    const fileExt = file.name.split('.').pop()

    // Format the date as YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0]

    // Create the new filename: originalname-YYYY-MM-DD.ext
    const sanitizedOriginalName = originalName.replace(/[^a-z0-9-]/gi, '_')
    const fileName = `${folderName}/${sanitizedOriginalName}-${date}.${fileExt}`

    // Use the admin client for storage operations
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type // Explicitly set the content type
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw uploadError
    }

    // Instead of returning a public URL, return a signed URL that will expire
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseAdmin.storage
        .from('resumes')
        .createSignedUrl(fileName, 60 * 60) // URL expires in 1 hour

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      throw signedUrlError || new Error('Failed to create signed URL')
    }

    // Store the file path rather than the URL
    return `resumes/${fileName}`
  } catch (error) {
    console.error('Error uploading resume:', error)
    throw new Error('Failed to upload resume')
  }
}

// Add a new function to get a signed URL for admin access
export async function getResumeUrl(filePath: string): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(filePath.replace('resumes/', ''), 60 * 60) // URL expires in 1 hour

    if (urlError || !urlData) {
      throw urlError || new Error('Failed to create signed URL')
    }

    return urlData.signedUrl
  } catch (error) {
    console.error('Error getting resume URL:', error)
    throw new Error('Failed to get resume URL')
  }
}

export async function createApplication(data: CreateApplicationData) {
  try {
    const now = toISOString(new Date())
    await db.insert(application).values({
      ...data,
      created_at: now,
      status: 'pending',
      updated_at: now
    })
  } catch (error) {
    console.error('Error creating application:', error)
    throw new Error('Failed to create application')
  }
}

export async function getAllApplications() {
  try {
    const applications = await db.select().from(application)
    return applications
  } catch (error) {
    console.error('Error getting all applications:', error)
    throw new Error('Failed to get all applications')
  }
}

export async function getUserApplications(userId: number) {
  try {
    const userApplications = await db
      .select()
      .from(application)
      .where(eq(application.user_id, userId))
      .orderBy(application.created_at)

    return userApplications
  } catch (error) {
    console.error('Error getting user applications:', error)
    throw new Error('Failed to get user applications')
  }
}

export async function updateApplicationStatus(
  applicationId: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  try {
    // Start a transaction to ensure both operations succeed or fail together
    await db.transaction(async tx => {
      // Update application status
      const [updatedApplication] = await tx
        .update(application)
        .set({ status })
        .where(eq(application.id, applicationId))
        .returning()

      if (!updatedApplication) {
        throw new Error('Failed to update application status')
      }

      // Update user role and position based on application status
      if (status === 'approved') {
        const result = await tx
          .update(user)
          .set({
            role: 'member',
            position: 'candidate'
          })
          .where(eq(user.id, updatedApplication.user_id))
          .returning()

        if (!result.length) {
          throw new Error('Failed to update user role and position')
        }
      } else if (status === 'rejected') {
        const result = await tx
          .update(user)
          .set({ role: 'guest' })
          .where(eq(user.id, updatedApplication.user_id))
          .returning()

        if (!result.length) {
          throw new Error('Failed to update user role')
        }
      }
    })

    revalidatePath('/admin/applications')
  } catch (error) {
    console.error('Error updating application status:', error)
    throw new Error('Failed to update application status')
  }
}

export async function deleteApplication(applicationId: number): Promise<void> {
  try {
    const [applicationRecord] = await db
      .select()
      .from(application)
      .where(eq(application.id, applicationId))

    if (applicationRecord?.resume) {
      const supabaseAdmin = getSupabaseAdmin()
      // Delete the resume file from storage first
      const { error: deleteStorageError } = await supabaseAdmin.storage
        .from('resumes')
        .remove([applicationRecord.resume])

      if (deleteStorageError) {
        console.error('Error deleting resume file:', deleteStorageError)
      }
    }

    await db.delete(application).where(eq(application.id, applicationId))
    revalidatePath('/admin/applications')
  } catch (error) {
    console.error('Error deleting application:', error)
    throw new Error('Failed to delete application')
  }
}
