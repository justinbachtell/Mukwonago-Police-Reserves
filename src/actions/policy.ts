'use server'

import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { policies, policyCompletion } from '@/models/Schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Policy } from '@/types/policy'
import { getCurrentUser } from '@/actions/user'

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

export async function uploadPolicy(
  file: File,
  policyNumber: string,
  policyName: string
): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const fileExt = file.name.split('.').pop()
    const sanitizedName = policyName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const fileName = `${policyNumber}_${sanitizedName}.${fileExt}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('policies')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw uploadError
    }

    return fileName
  } catch (error) {
    console.error('Error uploading policy:', error)
    throw new Error('Failed to upload policy')
  }
}

export async function getPolicyUrl(fileName: string): Promise<string> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('policies')
      .createSignedUrl(fileName, 60 * 60) // URL expires in 1 hour

    if (urlError || !urlData) {
      throw urlError || new Error('Failed to create signed URL')
    }

    return urlData.signedUrl
  } catch (error) {
    console.error('Error getting policy URL:', error)
    throw new Error('Failed to get policy URL')
  }
}

export async function getAllPolicies(): Promise<Policy[]> {
  try {
    const result = await db.select().from(policies)
    return result.map(policy => ({
      ...policy,
      effective_date: toISOString(policy.effective_date),
      created_at: toISOString(policy.created_at),
      updated_at: toISOString(policy.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching policies:', error)
    throw new Error('Failed to fetch policies')
  }
}

export async function getPolicy(id: number): Promise<Policy | null> {
  try {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id))
    if (!policy) {
      return null
    }

    return {
      ...policy,
      created_at: toISOString(policy.created_at),
      effective_date: toISOString(policy.effective_date),
      updated_at: toISOString(policy.updated_at)
    }
  } catch (error) {
    console.error('Error fetching policy:', error)
    throw new Error('Failed to fetch policy')
  }
}

export async function createPolicy(data: {
  name: string
  policy_number: string
  policy_type: string
  description?: string | null
  effective_date: Date
  policy_url: string
}) {
  try {
    const now = toISOString(new Date())

    const [newPolicy] = await db
      .insert(policies)
      .values({
        name: data.name,
        policy_number: data.policy_number,
        policy_type: data.policy_type,
        description: data.description,
        effective_date: toISOString(data.effective_date),
        policy_url: data.policy_url,
        created_at: now,
        updated_at: now
      })
      .returning()

    if (!newPolicy) {
      throw new Error('Failed to create policy')
    }

    revalidatePath('/policies')
    revalidatePath('/admin/policies')
    return {
      ...newPolicy,
      created_at: new Date(newPolicy.created_at),
      effective_date: new Date(newPolicy.effective_date),
      updated_at: new Date(newPolicy.updated_at)
    }
  } catch (error) {
    console.error('Error creating policy:', error)
    throw new Error('Failed to create policy')
  }
}

export async function updatePolicy(
  id: number,
  data: {
    name?: string
    policy_number?: string
    policy_type?: string
    description?: string | null
    effective_date?: Date
    policy_url?: string
  }
) {
  try {
    const { effective_date, ...rest } = data
    const updateData = {
      ...rest,
      updated_at: toISOString(new Date()),
      ...(effective_date && { effective_date: toISOString(effective_date) })
    }

    const [updatedPolicy] = await db
      .update(policies)
      .set(updateData)
      .where(eq(policies.id, id))
      .returning()

    if (!updatedPolicy) {
      throw new Error('Failed to update policy')
    }

    revalidatePath('/policies')
    revalidatePath('/admin/policies')
    revalidatePath(`/policies/${id}`)
    return {
      ...updatedPolicy,
      created_at: new Date(updatedPolicy.created_at),
      effective_date: new Date(updatedPolicy.effective_date),
      updated_at: new Date(updatedPolicy.updated_at)
    }
  } catch (error) {
    console.error('Error updating policy:', error)
    throw new Error('Failed to update policy')
  }
}

export async function deletePolicy(id: number) {
  try {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id))

    if (policy) {
      const supabaseAdmin = getSupabaseAdmin()
      // Delete the file from storage first
      const { error: deleteStorageError } = await supabaseAdmin.storage
        .from('policies')
        .remove([policy.policy_url])

      if (deleteStorageError) {
        console.error('Error deleting policy file:', deleteStorageError)
      }
    }

    await db.delete(policies).where(eq(policies.id, id))
    revalidatePath('/policies')
    revalidatePath('/admin/policies')
  } catch (error) {
    console.error('Error deleting policy:', error)
    throw new Error('Failed to delete policy')
  }
}

export async function markPolicyAsAcknowledged(policyId: number) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('User not found')
    }

    const result = await db
      .insert(policyCompletion)
      .values({
        policy_id: policyId,
        user_id: currentUser.id
      })
      .returning()

    return result[0]
  } catch (error) {
    console.error('Error marking policy as read:', error)
    throw new Error('Failed to mark policy as read')
  }
}

export async function resetPolicyCompletion(formData: FormData) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const policyId = Number.parseInt(formData.get('policyId') as string, 10)
    const userId = formData.get('userId')
      ? Number.parseInt(formData.get('userId') as string, 10)
      : undefined

    if (userId) {
      // Reset for specific user
      await db
        .delete(policyCompletion)
        .where(
          and(
            eq(policyCompletion.policy_id, policyId),
            eq(policyCompletion.user_id, userId)
          )
        )
    } else {
      // Reset for all users
      await db
        .delete(policyCompletion)
        .where(eq(policyCompletion.policy_id, policyId))
    }

    revalidatePath('/admin/policies')
    revalidatePath(`/admin/policies/${policyId}/completions`)
  } catch (error) {
    console.error('Error resetting policy completion:', error)
    throw new Error('Failed to reset policy completion')
  }
}

export async function getPolicyCompletionStatus(policyId: number) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return false
    }

    const result = await db
      .select()
      .from(policyCompletion)
      .where(
        and(
          eq(policyCompletion.policy_id, policyId),
          eq(policyCompletion.user_id, currentUser.id)
        )
      )
    return result.length > 0
  } catch (error) {
    console.error('Error getting policy completion status:', error)
    throw new Error('Failed to get policy completion status')
  }
}

export async function getPolicyCompletions(policyId: number) {
  try {
    const result = await db
      .select()
      .from(policyCompletion)
      .where(eq(policyCompletion.policy_id, policyId))
    return result
  } catch (error) {
    console.error('Error getting policy completions:', error)
    throw new Error('Failed to get policy completions')
  }
}

export async function getPoliciesWithCompletionStatus() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('User not found')
    }

    const allPolicies = await getAllPolicies()
    const completionStatuses = await Promise.all(
      allPolicies.map(async policy => {
        const isCompleted = await getPolicyCompletionStatus(policy.id)
        return {
          id: policy.id,
          isCompleted
        }
      })
    )

    const completedPolicies = completionStatuses.reduce(
      (acc, { id, isCompleted }) => {
        acc[id] = isCompleted
        return acc
      },
      {} as Record<number, boolean>
    )

    return {
      policies: allPolicies,
      completedPolicies
    }
  } catch (error) {
    console.error('Error fetching policies with completion status:', error)
    throw new Error('Failed to fetch policies with completion status')
  }
}
