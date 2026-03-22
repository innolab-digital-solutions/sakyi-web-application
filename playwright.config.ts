import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 *
 * This configuration establishes a reliable and maintainable end-to-end (E2E) testing environment for the Next.js application using Playwright.
 *
 * Key Behaviors:
 * - Supports both local development and CI environments by configuring server ports, URLs, and test runners dynamically.
 * - Ensures deterministic testing and CI-friendliness (e.g., prevents accidental .only, serializes workers in CI, retries flakey tests).
 * - Provides clear reporting (GitHub reporter on CI, HTML/list locally) and preserves logs/artifacts only as needed.
 * - Consistently spins up the correct web server command for each environment (dev or production build).
 * - Runs all tests in the dedicated ./e2e directory.
 *
 * Variables:
 *   - `port`: Determines the port for the Next.js dev server. Controlled by $PLAYWRIGHT_TEST_PORT.
 *   - `baseURL`: The base URL used by Playwright; can be overridden with $PLAYWRIGHT_BASE_URL.
 *   - `isCI`: Detects if running in a CI environment by checking $CI.
 *   - `startCommand`: Selects the proper npm script (start for CI, dev for local) to boot the app for testing.
 *
 * Editing Guidance:
 * - If you add e2e directories, update `testDir`.
 * - If you change app port logic, update $PLAYWRIGHT_TEST_PORT handling.
 * - If new browsers/devices should be tested, adjust the `projects` section.
 * - To adjust timeouts, edit the respective `timeout` fields.
 *
 * @see https://playwright.dev/docs/test-configuration
 * @see https://playwright.dev/docs/ci-intro
 */

const port = process.env.PLAYWRIGHT_TEST_PORT ?? '3000';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;

const isCI = !!process.env.CI;

// Use 'npm run start' for production build in CI; 'npm run dev' for local workflow.
const startCommand = isCI
  ? `npm run start -- -p ${port}`
  : `npm run dev -- -p ${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
      ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    timeout: 10_000,
  },
  timeout: 60_000,
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],

  webServer: {
    command: startCommand,
    url: baseURL,
    reuseExistingServer: !isCI, // Reuse server locally for faster dev; always fresh boot in CI
    timeout: 120_000, // Allow up to 2 mins for server boot (accommodate slow CI cold starts)
  },
});
