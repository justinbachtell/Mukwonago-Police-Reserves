import type { FullConfig } from '@playwright/test'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

// Test user credentials
const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'adminPassword123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  member: {
    email: 'member@example.com',
    password: 'memberPassword123!',
    firstName: 'Member',
    lastName: 'User',
    role: 'member'
  }
}

// Maximum retries for database operations
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation. Attempts remaining: ${retries - 1}`)
      await delay(RETRY_DELAY)
      return retryOperation(operation, retries - 1)
    }
    throw error
  }
}

async function createTestUser(
  supabase: SupabaseClient,
  userConfig: typeof TEST_USERS.admin
) {
  console.log(`Creating test ${userConfig.role} user...`)

  // First check if user profile exists and delete it
  const { data: existingUserProfile } = await supabase
    .from('user')
    .select()
    .eq('email', userConfig.email)
    .single()

  if (existingUserProfile) {
    await supabase.from('user').delete().eq('email', userConfig.email)
  }

  // First sign up the user
  const { data: signUpData, error: signUpError } = await retryOperation(
    async () => {
      return await supabase.auth.signUp({
        email: userConfig.email,
        password: userConfig.password,
        options: {
          data: {
            first_name: userConfig.firstName,
            last_name: userConfig.lastName,
            role: userConfig.role
          }
        }
      })
    }
  )

  if (signUpError || !signUpData.user) {
    throw (
      signUpError || new Error(`Failed to create test ${userConfig.role} user`)
    )
  }

  console.log(
    `Created test ${userConfig.role} user in auth.users:`,
    signUpData.user
  )

  // Verify the email immediately since this is a test user
  await retryOperation(async () => {
    const { error } = await supabase.auth.admin.updateUserById(
      signUpData.user!.id,
      { email_confirm: true }
    )
    if (error) {
      throw error
    }
  })

  console.log(`Verified test ${userConfig.role} user email`)

  // Add a small delay to ensure auth user is fully registered
  await delay(1000)

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('user')
    .select()
    .eq('id', signUpData.user!.id)
    .single()

  if (existingProfile) {
    console.log(
      `User profile already exists for ${userConfig.role}, skipping creation`
    )
    return
  }

  // Create user profile
  await retryOperation(async () => {
    const { error } = await supabase.from('user').insert({
      id: signUpData.user!.id,
      email: signUpData.user!.email,
      first_name: userConfig.firstName,
      last_name: userConfig.lastName
    })

    if (error) {
      throw error
    }
  })

  console.log(`Created test ${userConfig.role} user profile`)
}

async function cleanupTestUser(supabase: SupabaseClient, email: string) {
  console.log(`Cleaning up existing test user: ${email}...`)
  await retryOperation(async () => {
    // First find the user
    const { data: users } = await supabase.auth.admin.listUsers()
    const testUser = users?.users.find((u: User) => u.email === email)

    if (testUser) {
      // Delete from user profile table first
      console.log('Removing existing user profile...')
      const { error: profileError } = await supabase
        .from('user')
        .delete()
        .eq('id', testUser.id)

      if (profileError) {
        console.warn('Error deleting user profile:', profileError)
      }

      // Then delete the auth user
      console.log('Removing auth user...')
      const { error: authError } = await supabase.auth.admin.deleteUser(
        testUser.id
      )

      if (authError) {
        throw authError
      }
    }
  })
}

async function globalSetup(_config: FullConfig) {
  console.log('Starting global setup...')

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

  // Clean up any existing test users
  try {
    await Promise.all([
      cleanupTestUser(supabase, TEST_USERS.admin.email),
      cleanupTestUser(supabase, TEST_USERS.member.email)
    ])
  } catch (error) {
    console.warn('Failed to clean up test users:', error)
  }

  try {
    // Create users sequentially to avoid race conditions
    await createTestUser(supabase, TEST_USERS.admin)
    await createTestUser(supabase, TEST_USERS.member)
  } catch (error) {
    console.error('Failed to set up test users:', error)
    throw error
  }

  console.log('Global setup completed successfully')
}

export default globalSetup
