import { expect, test } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to sign in page when accessing protected routes', async ({
    page,
  }) => {
    // Try to access protected dashboard route
    await page.goto('/user/dashboard');

    // Should be redirected to sign in page
    expect(page.url()).toContain('/sign-in');
  })

  test('should show sign in and sign up links on home page', async ({ page }) => {
    await page.goto('/');

    // Check for sign in link
    const signInLink = page.getByTitle('Sign in');

    await expect(signInLink).toBeVisible();

    // Updated to specifically target the nav link by its title attribute
    const applyNowLink = page.getByTitle('Apply Now');

    await expect(applyNowLink).toBeVisible();
  })

  test('should navigate through main navigation', async ({ page }) => {
    await page.goto('/');

    // Click About link
    await page.getByTitle('About').click();

    await expect(page).toHaveURL('/about');

    // Check if About page content is visible
    await expect(
      page.getByRole('heading', {
        name: /about our police reserves/i,
      }),
    ).toBeVisible();
  })
});
