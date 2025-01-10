import { test, expect } from '@playwright/test'

// Test user credentials
/* const TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_PASSWORD = 'testPassword123!'
const TEST_USER_FIRST_NAME = 'Test'
const TEST_USER_LAST_NAME = 'User'

// Custom 1 minute 30 second timeout for long-running operations
const EXTENDED_TIMEOUT = 90000 */

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/')
  })

  test('navigate to sign up page', async ({ page }) => {
    await test.step('identify sidebar apply now link', async () => {
      await expect(
        page.locator('li').filter({ hasText: 'Apply Now' }).getByRole('link')
      ).toBeVisible()
      await page
        .locator('li')
        .filter({ hasText: 'Apply Now' })
        .getByRole('link')
        .click()
    })

    await test.step('verify sign up page is displayed', async () => {
      await expect(
        page.locator('div').filter({ hasText: /^Create Account$/ })
      ).toBeVisible()
      await expect(page.getByText('First Name')).toBeVisible()
      await expect(page.getByText('Last Name')).toBeVisible()
      await expect(page.getByText('Email Address')).toBeVisible()
      await expect(page.getByText('Password', { exact: true })).toBeVisible()
      await expect(page.getByText('Confirm Password')).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Create Account' })
      ).toBeVisible()
      await expect(
        page.getByRole('link', { name: 'Sign in', exact: true })
      ).toBeVisible()
    })
  })
})
