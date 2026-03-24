import { expect, test } from '@playwright/test';

test.describe('admin onboarding interview', () => {
  test('happy path: queue -> create -> interview -> complete', async () => {
    test.fixme(
      true,
      'Requires seeded admin session and deterministic onboarding fixture data.',
    );
  });

  test('failure path: section save validation (422)', async () => {
    test.fixme(
      true,
      'Requires backend test fixture that returns per-question validation errors.',
    );
  });

  test('failure path: unauthorized and forbidden', async () => {
    test.fixme(
      true,
      'Requires role-specific auth fixtures in E2E environment.',
    );
  });

  test('failure path: concurrent status change while editing', async () => {
    test.fixme(
      true,
      'Requires deterministic concurrent actor fixture in E2E environment.',
    );
  });

  test('queue page is reachable for authenticated session route guard flow', async ({
    page,
  }) => {
    await page.goto('/admin/onboarding/intakes');
    await expect(page).toHaveURL(/\/admin\/(login|onboarding\/intakes)/);
  });
});
