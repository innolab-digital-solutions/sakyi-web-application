import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SaKyi/i);
  });

  test('admin login page loads', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();
  });
});
