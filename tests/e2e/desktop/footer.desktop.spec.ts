import { test, expect } from '@playwright/test'

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/')
  })

  test('should display the footer', async ({ page }) => {
    // get footer element
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // verify footer contains credits
    await expect(
      page.getByRole('link', { name: 'Justin Bachtell' })
    ).toBeVisible()
  })
})
