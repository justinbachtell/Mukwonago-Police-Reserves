import type { FullConfig } from '@playwright/test'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

// Test user credentials
const TEST_USERS = {
  admin: 'admin@example.com',
  member: 'member@example.com'
}

async function globalTeardown(_config: FullConfig) {
  try {
    console.log('Starting global teardown...')
    const supabase = createClient(
      process.env.TEST_NEXT_PUBLIC_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all test users
    const { data: users } = await supabase.auth.admin.listUsers()
    const testUsers = users?.users.filter((u: User) =>
      Object.values(TEST_USERS).includes(u.email || '')
    )

    for (const testUser of testUsers || []) {
      if (!testUser) {
        continue
      }

      // Delete from user profile table first
      console.log(`Removing user profile for ${testUser.email}...`)
      const { error: profileError } = await supabase
        .from('user')
        .delete()
        .eq('id', testUser.id)

      if (profileError) {
        console.warn('Error deleting user profile:', profileError)
      }

      // Then delete the auth user
      console.log(`Removing auth user ${testUser.email}...`)
      const { error: authError } = await supabase.auth.admin.deleteUser(
        testUser.id
      )
      if (authError) {
        throw authError
      }
    }

    console.log('All test users removed')
  } catch (error) {
    console.warn('Failed to remove test users:', error)
    throw error
  } finally {
    console.log('Global teardown completed')
  }
}

export default globalTeardown
