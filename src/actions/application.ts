'use server'

import type { CreateApplicationData } from '@/types/application'
import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { application, user } from '@/models/Schema'
import { createClient } from '@/lib/server'
import { createLogger } from '@/lib/debug'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

const logger = createLogger({
  module: 'applications',
  file: 'application.ts'
})

export async function uploadResume(
  file: File,
  firstName: string,
  lastName: string
): Promise<string> {
  logger.info(
    'Starting resume upload',
    { fileName: file.name, firstName, lastName },
    'uploadResume'
  )
  logger.time('resume-upload')

  try {
    const supabase = await createClient()
    const folderName =
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`.replace(
        /[^a-z0-9_]/g,
        ''
      )
    const fileName = `${folderName}/${file.name}`

    logger.info(
      'Uploading file to Supabase storage',
      { fileName, contentType: file.type },
      'uploadResume'
    )

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      logger.error(
        'Resume upload failed',
        logger.errorWithData(uploadError),
        'uploadResume'
      )
      throw uploadError
    }

    const filePath = `resumes/${fileName}`
    logger.info('Resume upload successful', { filePath }, 'uploadResume')
    logger.timeEnd('resume-upload')
    return filePath
  } catch (error) {
    logger.error(
      'Resume upload failed',
      logger.errorWithData(error),
      'uploadResume'
    )
    throw new Error('Failed to upload resume')
  }
}

export async function getResumeUrl(filePath: string): Promise<string> {
  logger.info('Getting resume URL', { filePath }, 'getResumeUrl')
  logger.time(`get-resume-url-${filePath}`)

  try {
    const supabase = await createClient()
    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(filePath.replace('resumes/', ''), 60 * 60)

    if (signedUrlError || !urlData) {
      logger.error(
        'Failed to create signed URL',
        logger.errorWithData(signedUrlError),
        'getResumeUrl'
      )
      throw signedUrlError || new Error('Failed to create signed URL')
    }

    logger.info('Signed URL created successfully', undefined, 'getResumeUrl')
    logger.timeEnd(`get-resume-url-${filePath}`)
    return urlData.signedUrl
  } catch (error) {
    logger.error(
      'Failed to get resume URL',
      logger.errorWithData(error),
      'getResumeUrl'
    )
    throw new Error('Failed to get resume URL')
  }
}

export async function createApplication(data: CreateApplicationData) {
  logger.info(
    'Creating new application',
    { email: data.email, position: data.position },
    'createApplication'
  )
  logger.time(`create-application-${data.email}`)

  try {
    const now = toISOString(new Date())
    const [newApplication] = await db
      .insert(application)
      .values({
        ...data,
        created_at: now,
        status: 'pending',
        updated_at: now
      })
      .returning()

    if (!newApplication) {
      logger.error(
        'No application returned after creation',
        { email: data.email },
        'createApplication'
      )
      throw new Error('Failed to create application')
    }

    logger.info(
      'Application created successfully',
      { applicationId: newApplication.id },
      'createApplication'
    )
    logger.timeEnd(`create-application-${data.email}`)
    return newApplication
  } catch (error) {
    logger.error(
      'Failed to create application',
      logger.errorWithData(error),
      'createApplication'
    )
    throw new Error('Failed to create application')
  }
}

export async function getAllApplications() {
  try {
    const applications = await db.select().from(application)
    return applications
  } catch (error) {
    logger.error(
      'Error getting all applications:',
      logger.errorWithData(error),
      'getAllApplications'
    )
    throw new Error('Failed to get all applications')
  }
}

export async function getUserApplications(userId: string) {
  try {
    const userApplications = await db
      .select()
      .from(application)
      .where(eq(application.user_id, userId))
      .orderBy(application.created_at)

    return userApplications
  } catch (error) {
    logger.error(
      'Error getting user applications:',
      logger.errorWithData(error),
      'getUserApplications'
    )
    throw new Error('Failed to get user applications')
  }
}

export async function updateApplicationStatus(
  applicationId: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  logger.info('Updating status', { applicationId, status }, 'application')
  logger.time(`statusUpdate-${applicationId}`)

  try {
    await db.transaction(async tx => {
      logger.log('Starting transaction', { applicationId }, 'application')

      const [updatedApplication] = await tx
        .update(application)
        .set({ status })
        .where(eq(application.id, applicationId))
        .returning()

      if (!updatedApplication) {
        logger.error('Application not found', { applicationId }, 'application')
        throw new Error('Failed to update application status')
      }

      if (status === 'approved') {
        logger.info(
          'Updating user role',
          {
            userId: updatedApplication.user_id,
            newRole: 'member'
          },
          'application'
        )

        const result = await tx
          .update(user)
          .set({ role: 'member', position: 'candidate' })
          .where(eq(user.id, updatedApplication.user_id))
          .returning()

        if (!result.length) {
          logger.error(
            'User role update failed',
            {
              userId: updatedApplication.user_id
            },
            'application'
          )
          throw new Error('Failed to update user role')
        }
      }
    })

    logger.info(
      'Status updated successfully',
      { applicationId, status },
      'application'
    )
    logger.timeEnd(`statusUpdate-${applicationId}`)
    revalidatePath('/admin/applications')
  } catch (error) {
    logger.error(
      'Status update failed',
      logger.errorWithData(error),
      'application'
    )
    throw new Error('Failed to update application status')
  }
}

export async function deleteApplication(applicationId: number): Promise<void> {
  logger.group('Application Deletion', () => {
    logger.info('Starting deletion', { applicationId }, 'application')
    logger.time(`deletion-${applicationId}`)
  })

  try {
    const [applicationRecord] = await db
      .select()
      .from(application)
      .where(eq(application.id, applicationId))

    if (applicationRecord?.resume) {
      logger.info(
        'Deleting resume file',
        {
          resumePath: applicationRecord.resume
        },
        'application'
      )

      const supabase = await createClient()
      const { error: deleteStorageError } = await supabase.storage
        .from('resumes')
        .remove([applicationRecord.resume])

      if (deleteStorageError) {
        logger.warn(
          'Resume deletion failed',
          {
            error: deleteStorageError,
            resumePath: applicationRecord.resume
          },
          'application'
        )
      }
    }

    await db.delete(application).where(eq(application.id, applicationId))
    logger.info('Application deleted', { applicationId }, 'application')
    logger.timeEnd(`deletion-${applicationId}`)
    revalidatePath('/admin/applications')
  } catch (error) {
    logger.error('Deletion failed', logger.errorWithData(error), 'application')
    throw new Error('Failed to delete application')
  }
}
