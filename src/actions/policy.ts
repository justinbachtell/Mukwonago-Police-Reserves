'use server'

import { toISOString } from '@/lib/utils'
import { db } from '@/libs/DB'
import { policies } from '@/models/Schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Policy } from '@/types/policy'

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
    const policyList = await db.select().from(policies)
    return policyList.map(policy => ({
      ...policy,
      created_at: new Date(policy.created_at),
      effective_date: new Date(policy.effective_date),
      updated_at: new Date(policy.updated_at)
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
      created_at: new Date(policy.created_at),
      effective_date: new Date(policy.effective_date),
      updated_at: new Date(policy.updated_at)
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
