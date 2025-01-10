import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

// Test user credentials
const TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_PASSWORD = 'testPassword123!'
const TEST_USER_FIRST_NAME = 'Test'
const TEST_USER_LAST_NAME = 'User'

// Custom 1 minute 30 second timeout for long-running operations
const EXTENDED_TIMEOUT = 90000

test.describe('Authentication Flow', () => {
  let supabase: ReturnType<typeof createClient>

  test.beforeAll(async () => {
    // Initialize Supabase client for admin operations
    supabase = createClient(
      process.env.TEST_NEXT_PUBLIC_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Clean up any existing test user
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      const testUser = users?.users.find(u => u.email === TEST_USER_EMAIL)
      if (testUser) {
        await supabase.auth.admin.deleteUser(testUser.id)
      }
    } catch (error) {
      console.warn('Failed to clean up test user:', error)
    }
  })

  test.afterEach(async () => {
    // Clean up test user after each test
    try {
      const { data: users } = await supabase.auth.admin.listUsers()
      const testUser = users?.users.find(u => u.email === TEST_USER_EMAIL)
      if (testUser) {
        await supabase.auth.admin.deleteUser(testUser.id)
      }
    } catch (error) {
      console.warn('Failed to clean up test user:', error)
    }
  })

  test('complete auth flow - signup, signout, signin', async ({ page }) => {
    test.setTimeout(EXTENDED_TIMEOUT)

    await test.step('sign up', async () => {
      // Start with signup
      await page.goto('/sign-up')
      await page.waitForLoadState('domcontentloaded')

      // Fill in signup form
      await page.getByLabel('First Name').fill(TEST_USER_FIRST_NAME)
      await page.getByLabel('Last Name').fill(TEST_USER_LAST_NAME)
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL)
      await page.locator('#password').fill(TEST_USER_PASSWORD)
      await page.locator('#password-confirmation').fill(TEST_USER_PASSWORD)

      // Submit form and wait for success toast
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Wait for the signup API response
      const response = await page.waitForResponse(
        response =>
          response.url().includes('/auth/v1/signup') &&
          response.status() === 200,
        { timeout: 12000 }
      )

      // Wait for redirect to sign-in page
      await page.waitForURL('/sign-in')

      // Get the user ID from the signup response
      const responseData = await response.json()
      const userId = responseData.user.id

      // Directly confirm the email using the admin API
      await supabase.auth.admin.updateUserById(userId, { email_confirm: true })
    })

    await test.step('sign in', async () => {
      console.log('Starting sign in process')

      // Sign in with the new account
      await page.getByLabel('Email Address').fill(TEST_USER_EMAIL)
      await page.getByLabel('Password').fill(TEST_USER_PASSWORD)

      // Click sign in and wait for response
      await Promise.all([
        page.getByRole('button', { name: 'Sign In', exact: true }).click(),
        page.waitForResponse(
          response =>
            response.url().includes('/auth/v1/token') &&
            response.status() === 200,
          { timeout: 12000 }
        )
      ])

      console.log('Sign in request completed')

      // Should be redirected to dashboard after successful sign in
      await page.waitForURL('/user/dashboard', { timeout: 12000 })
      console.log('Redirected to dashboard')

      // Wait for the page to load and a small delay for client-side updates
      await page.waitForLoadState('domcontentloaded')

      // Wait for authenticated navigation items
      await expect(
        page.getByRole('link', { name: 'Dashboard', exact: true })
      ).toBeVisible({ timeout: 12000 })
      console.log('Dashboard link visible')

      // Now check for the welcome heading
      await expect(
        page.getByRole('heading', {
          name: new RegExp(`Welcome back, ${TEST_USER_FIRST_NAME}!`, 'i')
        })
      ).toBeVisible({ timeout: 12000 })
      console.log('Welcome heading visible')
    })

    await test.step('sign out', async () => {
      console.log('Starting sign out process')
      // Wait for sign out button to be visible first
      await expect(
        page.getByRole('button', { name: 'Sign Out', exact: true })
      ).toBeVisible({ timeout: 12000 })

      // Click sign out and wait for the logout response
      await Promise.all([
        page.getByRole('button', { name: 'Sign Out', exact: true }).click(),
        page.waitForResponse(
          response =>
            response.url().includes('/auth/v1/logout') &&
            response.status() === 204,
          { timeout: 12000 }
        )
      ])

      console.log('Sign out request completed')

      // Should be redirected to home page after sign out
      await page.waitForURL('/', { timeout: 30000 })
      console.log('Redirected to home page')

      await page.waitForLoadState('domcontentloaded')
      console.log('Page loaded')

      // Verify we're on the home page
      await expect(page).toHaveURL('/')

      // Verify user is logged out by checking for sign in link in the navigation
      await expect(
        page.getByRole('link', { name: 'Sign In', exact: true })
      ).toBeVisible({
        timeout: 10000
      })
    })
  })
})
