import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/')
  })

  test('should display the home page and its contents', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Join the Mukwonago Police' })
    ).toBeVisible()
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Apply Now$/ })
        .getByRole('link')
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'About Our Department' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Our Department', exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Reserve Program' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Requirements & Expectations' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Time Commitment' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Qualifications' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Team Integration' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Reserve Officer Program' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Duties & Responsibilities' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Requirements', exact: true })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Benefits' })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Ready to Make a Difference?' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Apply Now' }).nth(1)
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Contact Us' })).toBeVisible()
  })
})
