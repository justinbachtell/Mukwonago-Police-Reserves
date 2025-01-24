'use server'

import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/server'
import { db } from '@/libs/DB'
import { eq, and } from 'drizzle-orm'
import { policies, policyCompletion, policyTypeEnum } from '@/models/Schema'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/actions/user'
import { toISOString } from '@/lib/utils'
import type { Policy, DBPolicy, NewPolicy } from '@/types/policy'
import { createPolicyNotification } from '@/actions/notification'

const logger = createLogger({
  module: 'actions',
  file: 'policy.ts'
})

// Helper function to cast policy_type string to enum value
function castPolicyType(
  type: string
): (typeof policyTypeEnum.enumValues)[number] {
  if (policyTypeEnum.enumValues.includes(type as any)) {
    return type as (typeof policyTypeEnum.enumValues)[number]
  }
  return 'other' // Default fallback
}

// Transform database policy to Policy type
function transformPolicy(dbPolicy: DBPolicy): Policy {
  const policy: Policy = {
    id: dbPolicy.id,
    name: dbPolicy.name,
    description: dbPolicy.description,
    policy_type: castPolicyType(dbPolicy.policy_type),
    policy_number: dbPolicy.policy_number,
    policy_url: dbPolicy.policy_url,
    effective_date: dbPolicy.effective_date,
    created_at: dbPolicy.created_at,
    updated_at: dbPolicy.updated_at
  }

  if (dbPolicy.completions) {
    policy.completions = dbPolicy.completions
  }

  return policy
}

export async function uploadPolicyFile(file: File): Promise<string> {
  logger.info(
    'Starting policy upload',
    { fileName: file.name },
    'uploadPolicyFile'
  )

  try {
    const supabase = await createClient()
    const timestamp = new Date().getTime()
    const cleanFileName = `policy_${timestamp}${file.name.substring(file.name.lastIndexOf('.'))}` // Preserve original file extension

    logger.info(
      'Uploading file to Supabase storage',
      { filePath: cleanFileName, contentType: file.type },
      'uploadPolicyFile'
    )

    const { error: uploadError, data } = await supabase.storage
      .from('policies')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      logger.error(
        'Policy upload failed',
        {
          error: uploadError.message,
          name: uploadError.name,
          cause: uploadError.cause
        },
        'uploadPolicyFile'
      )
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    if (!data?.path) {
      throw new Error('Failed to get uploaded file path')
    }

    return cleanFileName
  } catch (error) {
    logger.error(
      'Policy upload failed',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      'uploadPolicyFile'
    )
    throw error
  }
}

export async function createPolicyRecord(data: {
  name: string
  policy_type: string
  description: string | null
  policy_url: string
  policy_number: string
  effective_date: string
}) {
  try {
    const [newPolicy] = await db
      .insert(policies)
      .values({
        name: data.name,
        policy_type: castPolicyType(data.policy_type),
        description: data.description,
        policy_url: data.policy_url,
        policy_number: data.policy_number,
        effective_date: data.effective_date,
        created_at: toISOString(new Date()),
        updated_at: toISOString(new Date())
      })
      .returning()

    // Add these lines to ensure the tables refresh
    revalidatePath('/policies')
    revalidatePath('/admin/policies')

    return newPolicy
  } catch (error) {
    logger.error(
      'Failed to create policy record',
      logger.errorWithData(error),
      'createPolicyRecord'
    )
    throw error
  }
}

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
  // Remove any leading 'policies/' from the path if it exists
  const cleanFileName = fileName.replace(/^policies\//, '')

  logger.info('Getting policy URL', { fileName: cleanFileName }, 'getPolicyUrl')
  logger.time(`get-policy-url-${cleanFileName}`)

  try {
    const supabase = await createClient()

    const { data: urlData, error: urlError } = await supabase.storage
      .from('policies')
      .createSignedUrl(cleanFileName, 60 * 60)

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
      { fileName: cleanFileName },
      'getPolicyUrl'
    )
    logger.timeEnd(`get-policy-url-${cleanFileName}`)
    return urlData.signedUrl
  } catch (error) {
    logger.error(
      'Failed to get policy URL',
      logger.errorWithData(error),
      'getPolicyUrl'
    )
    logger.timeEnd(`get-policy-url-${cleanFileName}`)
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
    // Use Drizzle instead of Supabase client
    const allPolicies = await db.query.policies.findMany({
      with: {
        completions: {
          with: {
            user: true
          }
        }
      },
      orderBy: (policies, { desc }) => [desc(policies.created_at)]
    })

    logger.info(
      'Policies retrieved successfully',
      { count: allPolicies.length },
      'getAllPolicies'
    )
    logger.timeEnd('fetch-all-policies')

    return allPolicies.map(transformPolicy)
  } catch (error) {
    logger.error(
      'Failed to get policies',
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

    // Get policy details
    const [policy] = await db
      .select()
      .from(policies)
      .where(eq(policies.id, policyId))

    if (policy) {
      // Create notification for policy acknowledgment
      await createPolicyNotification(
        policy.name,
        policy.policy_number,
        policy.id,
        'policy_updated',
        currentUser.first_name,
        currentUser.last_name
      )
    }

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

    // Get all policies with their completions
    const allPolicies = await db.query.policies.findMany({
      with: {
        completions: {
          where: (completions, { eq }) =>
            eq(completions.user_id, currentUser.id)
        }
      },
      orderBy: (policies, { desc }) => [desc(policies.created_at)]
    })

    // Transform policies and create completion status map
    const policies = allPolicies.map(transformPolicy)
    const completedPolicies = allPolicies.reduce(
      (acc, policy) => {
        acc[policy.id] = policy.completions.length > 0
        return acc
      },
      {} as Record<number, boolean>
    )

    logger.info(
      'Policies and completion status retrieved',
      {
        totalPolicies: policies.length,
        completedCount: Object.values(completedPolicies).filter(Boolean).length
      },
      'getPoliciesWithCompletionStatus'
    )
    logger.timeEnd('fetch-policies-completion')

    return { policies, completedPolicies }
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

    const [newPolicy] = await db
      .insert(policies)
      .values({
        ...policy,
        created_at: toISOString(new Date()),
        updated_at: toISOString(new Date())
      })
      .returning()

    if (newPolicy) {
      // Create notification for new policy
      await createPolicyNotification(
        policy.name,
        policy.policy_number,
        newPolicy.id,
        'policy_created'
      )
    }

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

export async function updatePolicy(
  id: number,
  policy: Partial<NewPolicy>
): Promise<boolean> {
  logger.info(
    'Updating policy',
    { policyId: id, policyName: policy.name },
    'updatePolicy'
  )

  try {
    const [updatedPolicy] = await db
      .update(policies)
      .set({
        ...policy,
        updated_at: toISOString(new Date())
      })
      .where(eq(policies.id, id))
      .returning()

    if (updatedPolicy) {
      // Create notification for updated policy
      await createPolicyNotification(
        updatedPolicy.name,
        updatedPolicy.policy_number,
        updatedPolicy.id,
        'policy_updated'
      )
    }

    revalidatePath('/policies')
    revalidatePath('/admin/policies')
    return true
  } catch (error) {
    logger.error(
      'Failed to update policy',
      logger.errorWithData(error),
      'updatePolicy'
    )
    return false
  }
}

export async function getPolicyCompletions(policyId?: number) {
  logger.info(
    'Getting policy completions',
    { policyId },
    'getPolicyCompletions'
  )

  try {
    const query = db.select().from(policyCompletion)

    if (policyId) {
      query.where(eq(policyCompletion.policy_id, policyId))
    }

    const completions = await query

    logger.info(
      'Policy completions retrieved',
      { count: completions.length },
      'getPolicyCompletions'
    )

    return completions
  } catch (error) {
    logger.error(
      'Failed to get policy completions',
      logger.errorWithData(error),
      'getPolicyCompletions'
    )
    return null
  }
}
