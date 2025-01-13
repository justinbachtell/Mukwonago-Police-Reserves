'use server'

import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'
import { db } from '@/libs/DB'
import { eq, and } from 'drizzle-orm'
import { policies, policyCompletion } from '@/models/Schema'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/actions/user'
import { toISOString } from '@/lib/utils'
import type { Policy, NewPolicy } from '@/types/policy'

const logger = createLogger({
  module: 'policies',
  file: 'policy.ts'
})

export async function getPolicyById(
  id: number
): Promise<{ policy: Policy | null; url: string | null }> {
  logger.info('Getting policy by ID', { id }, 'getPolicyById')
  logger.time(`get-policy-by-id-${id}`)

  try {
    const supabase = await createClient()

    if (!supabase) {
      logger.error(
        'Failed to create Supabase client',
        undefined,
        'getPolicyById'
      )
      return { policy: null, url: null }
    }

    const policy = await db.query.policies.findFirst({
      where: eq(policies.id, id)
    })

    if (!policy) {
      logger.error('Policy not found', { id }, 'getPolicyById')
      return { policy: null, url: null }
    }

    const { data: urlData, error: urlError } = await supabase.storage
      .from('policies')
      .createSignedUrl(policy.name, 60 * 60)

    if (urlError || !urlData) {
      logger.error(
        'Failed to create signed URL',
        logger.errorWithData(urlError),
        'getPolicyUrl'
      )
      return { policy, url: null }
    }

    logger.info('Policy URL generated successfully', { id }, 'getPolicyById')
    logger.timeEnd(`get-policy-by-id-${id}`)

    return { policy, url: urlData.signedUrl }
  } catch (error) {
    logger.error(
      'Failed to get policy by ID',
      logger.errorWithData(error),
      'getPolicyById'
    )
    logger.timeEnd(`get-policy-by-id-${id}`)
    return { policy: null, url: null }
  }
}

export async function getPolicyUrl(fileName: string): Promise<string | null> {
  logger.info('Getting policy URL', { fileName }, 'getPolicyUrl')
  logger.time(`get-policy-url-${fileName}`)

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
        'getPolicyUrl'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'getPolicyUrl')
      return null
    }

    const { data: urlData, error: urlError } = await supabase.storage
      .from('policies')
      .createSignedUrl(fileName, 60 * 60)

    if (urlError || !urlData) {
      logger.error(
        'Failed to create signed URL',
        logger.errorWithData(urlError),
        'getPolicyUrl'
      )
      return null
    }

    logger.info(
      'Policy URL generated successfully',
      { fileName },
      'getPolicyUrl'
    )
    logger.timeEnd(`get-policy-url-${fileName}`)
    return urlData.signedUrl
  } catch (error) {
    logger.error(
      'Failed to get policy URL',
      logger.errorWithData(error),
      'getPolicyUrl'
    )
    logger.timeEnd(`get-policy-url-${fileName}`)
    return null
  }
}

export async function uploadPolicy(
  file: File,
  policyNumber: string,
  policyName: string
): Promise<string | null> {
  logger.info(
    'Uploading policy file',
    { policyNumber, policyName, fileName: file.name },
    'uploadPolicy'
  )
  logger.time(`upload-policy-${policyNumber}`)

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
        'uploadPolicy'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'uploadPolicy')
      return null
    }

    const fileExt = file.name.split('.').pop()
    const sanitizedName = policyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const fileName = `${policyNumber}_${sanitizedName}.${fileExt}`

    logger.info(
      'Uploading file to storage',
      { fileName, fileType: file.type },
      'uploadPolicy'
    )

    const { error: uploadError } = await supabase.storage
      .from('policies')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      logger.error(
        'Upload error',
        logger.errorWithData(uploadError),
        'uploadPolicy'
      )
      return null
    }

    logger.info(
      'Policy file uploaded successfully',
      { fileName },
      'uploadPolicy'
    )
    logger.timeEnd(`upload-policy-${policyNumber}`)
    return fileName
  } catch (error) {
    logger.error(
      'Failed to upload policy',
      logger.errorWithData(error),
      'uploadPolicy'
    )
    logger.timeEnd(`upload-policy-${policyNumber}`)
    return null
  }
}

export async function deletePolicy(id: number) {
  logger.info('Deleting policy', { policyId: id }, 'deletePolicy')
  logger.time(`delete-policy-${id}`)

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
        'deletePolicy'
      )
      return null
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'deletePolicy')
      return null
    }

    const [policy] = await db.select().from(policies).where(eq(policies.id, id))

    if (policy?.policy_url) {
      logger.info(
        'Deleting policy file from storage',
        { policyUrl: policy.policy_url },
        'deletePolicy'
      )

      const { error: deleteStorageError } = await supabase.storage
        .from('policies')
        .remove([policy.policy_url])

      if (deleteStorageError) {
        logger.error(
          'Failed to delete policy file',
          logger.errorWithData(deleteStorageError),
          'deletePolicy'
        )
      }
    }

    await db.delete(policies).where(eq(policies.id, id))
    logger.info('Policy deleted successfully', { policyId: id }, 'deletePolicy')
    logger.timeEnd(`delete-policy-${id}`)

    revalidatePath('/policies')
    revalidatePath('/admin/policies')
    return true
  } catch (error) {
    logger.error(
      'Failed to delete policy',
      logger.errorWithData(error),
      'deletePolicy'
    )
    return null
  }
}

export async function getAllPolicies(): Promise<Policy[]> {
  logger.info('Fetching all policies', undefined, 'getAllPolicies')
  logger.time('fetch-all-policies')

  try {
    const policyRecords = await db.query.policies.findMany({
      with: {
        completions: {
          with: {
            user: true
          }
        }
      }
    })

    logger.info(
      'Policies retrieved',
      {
        count: policyRecords.length,
        withCompletions: policyRecords.filter(
          p => p.completions && p.completions.length > 0
        ).length,
        firstPolicy: policyRecords[0]?.name,
        lastPolicy: policyRecords[policyRecords.length - 1]?.name
      },
      'getAllPolicies'
    )
    logger.timeEnd('fetch-all-policies')

    return policyRecords.map(policy => ({
      ...policy,
      completions: policy.completions || [],
      effective_date: toISOString(policy.effective_date),
      created_at: toISOString(policy.created_at),
      updated_at: toISOString(policy.updated_at)
    }))
  } catch (error) {
    logger.error(
      'Failed to fetch policies',
      logger.errorWithData(error),
      'getAllPolicies'
    )
    logger.timeEnd('fetch-all-policies')
    return []
  }
}

export async function markPolicyAsAcknowledged(policyId: number) {
  logger.info(
    'Marking policy as acknowledged',
    { policyId },
    'markPolicyAsAcknowledged'
  )
  logger.time(`mark-policy-as-acknowledged-${policyId}`)

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error('User not found', undefined, 'markPolicyAsAcknowledged')
      return false
    }

    await db.insert(policyCompletion).values({
      policy_id: policyId,
      user_id: currentUser.id
    })

    logger.info(
      'Policy marked as acknowledged',
      { policyId },
      'markPolicyAsAcknowledged'
    )
    logger.timeEnd(`mark-policy-as-acknowledged-${policyId}`)
    return true
  } catch (error) {
    logger.error(
      'Failed to mark policy as acknowledged',
      logger.errorWithData(error),
      'markPolicyAsAcknowledged'
    )
    logger.timeEnd(`mark-policy-as-acknowledged-${policyId}`)
    return false
  }
}

export async function getPoliciesWithCompletionStatus() {
  logger.info(
    'Fetching policies with completion status',
    undefined,
    'getPoliciesWithCompletionStatus'
  )
  logger.time('fetch-policies-completion')

  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      logger.error(
        'User not found',
        undefined,
        'getPoliciesWithCompletionStatus'
      )
      return null
    }

    const allPolicies = await getAllPolicies()
    const completionStatuses = await Promise.all(
      allPolicies.map(async policy => {
        const isCompleted = await getPolicyCompletionStatus(policy.id)
        return { id: policy.id, isCompleted }
      })
    )

    const completedPolicies = completionStatuses.reduce(
      (acc, { id, isCompleted }) => {
        acc[id] = isCompleted
        return acc
      },
      {} as Record<number, boolean>
    )

    logger.info(
      'Policies and completion status retrieved',
      {
        totalPolicies: allPolicies.length,
        completedCount: Object.values(completedPolicies).filter(Boolean).length
      },
      'getPoliciesWithCompletionStatus'
    )
    logger.timeEnd('fetch-policies-completion')

    return { policies: allPolicies, completedPolicies }
  } catch (error) {
    logger.error(
      'Failed to fetch policies with completion status',
      logger.errorWithData(error),
      'getPoliciesWithCompletionStatus'
    )
    return null
  }
}

export async function resetPolicyCompletion(
  formData: FormData
): Promise<boolean> {
  logger.info('Resetting policy completion', undefined, 'resetPolicyCompletion')

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
        'resetPolicyCompletion'
      )
      return false
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'resetPolicyCompletion')
      return false
    }

    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.error(
        'Unauthorized access attempt',
        { userId: currentUser?.id },
        'resetPolicyCompletion'
      )
      return false
    }

    const policyId = Number.parseInt(formData.get('policyId') as string, 10)
    const userId = formData.get('userId')
      ? (formData.get('userId') as string)
      : undefined

    logger.info(
      'Processing reset request',
      { policyId, targetUserId: userId },
      'resetPolicyCompletion'
    )

    if (userId) {
      await db
        .delete(policyCompletion)
        .where(
          and(
            eq(policyCompletion.policy_id, policyId),
            eq(policyCompletion.user_id, userId)
          )
        )
      logger.info(
        'Reset completion for specific user',
        { policyId, userId },
        'resetPolicyCompletion'
      )
    } else {
      await db
        .delete(policyCompletion)
        .where(eq(policyCompletion.policy_id, policyId))
      logger.info(
        'Reset completion for all users',
        { policyId },
        'resetPolicyCompletion'
      )
    }

    revalidatePath('/admin/policies')
    revalidatePath(`/admin/policies/${policyId}/completions`)
    return true
  } catch (error) {
    logger.error(
      'Failed to reset policy completion',
      logger.errorWithData(error),
      'resetPolicyCompletion'
    )
    return false
  }
}

export async function getPolicyCompletionStatus(
  policyId: number
): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return false
    }

    const [completion] = await db
      .select()
      .from(policyCompletion)
      .where(
        and(
          eq(policyCompletion.policy_id, policyId),
          eq(policyCompletion.user_id, currentUser.id)
        )
      )

    return !!completion
  } catch (error) {
    logger.error(
      'Failed to check policy completion status',
      logger.errorWithData(error),
      'getPolicyCompletionStatus'
    )
    return false
  }
}

export async function createPolicy(policy: NewPolicy): Promise<boolean> {
  logger.info(
    'Creating new policy',
    { policyName: policy.name },
    'createPolicy'
  )
  logger.time(`create-policy-${policy.policy_number}`)

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
        'createPolicy'
      )
      return false
    }

    if (!user) {
      logger.warn('No active user found', undefined, 'createPolicy')
      return false
    }

    await db.insert(policies).values({
      ...policy,
      created_at: toISOString(new Date()),
      updated_at: toISOString(new Date())
    })

    logger.info(
      'Policy created successfully',
      { policyNumber: policy.policy_number },
      'createPolicy'
    )
    logger.timeEnd(`create-policy-${policy.policy_number}`)

    revalidatePath('/policies')
    revalidatePath('/admin/policies')
    return true
  } catch (error) {
    logger.error(
      'Failed to create policy',
      logger.errorWithData(error),
      'createPolicy'
    )
    logger.timeEnd(`create-policy-${policy.policy_number}`)
    return false
  }
}
