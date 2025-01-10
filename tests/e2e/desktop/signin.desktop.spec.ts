import { test, expect } from '@playwright/test'

// Test user credentials
/* const TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_PASSWORD = 'testPassword123!'
const TEST_USER_FIRST_NAME = 'Test'
const TEST_USER_LAST_NAME = 'User'

// Custom 1 minute 30 second timeout for long-running operations
const EXTENDED_TIMEOUT = 90000 */

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/')
  })

  test('navigate to sign in page', async ({ page }) => {
    await test.step('identify sidebar sign in link', async () => {
      await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    })

    await test.step('click sidebar sign in link', async () => {
      await page.getByRole('link', { name: 'Sign In' }).click()
    })

    await test.step('verify sign in page is displayed', async () => {
      await expect(page.getByText('Email Address')).toBeVisible()
      await expect(page.getByText('Password', { exact: true })).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Forgot password?' })
      ).toBeVisible()
      await expect(page.getByText('Remember me')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Passwordless Magic Link' })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Create account' })
      ).toBeVisible()
    })
  })
})
