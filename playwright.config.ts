import { defineConfig, devices } from '@playwright/test';

// Port for Next.js dev server (overridden in CI/e2e environments if needed)
const port = process.env.PLAYWRIGHT_TEST_PORT ?? '3000';

// The base URL for running tests (default to local dev server)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${port}`;

// Detect if running in CI (Continuous Integration) environment
const isCI = !!process.env.CI;

// Command used to start the web server depending on environment
// - Use 'start' for production build in CI
// - Use 'dev' for local development
const startCommand = isCI
  ? `npm run start -- -p ${port}`
  : `npm run dev -- -p ${port}`;

export default defineConfig({
  // Directory containing E2E test files
  testDir: './e2e',

  // Allow tests to run in parallel where possible
  fullyParallel: true,

  // Prevent accidental exclusive tests (.only) from being committed on CI
  forbidOnly: isCI,

  // Number of retries on CI (helps with flakiness)
  retries: isCI ? 2 : 0,

  // Limit worker count on CI to ensure serial execution and avoid resource contention
  workers: isCI ? 1 : undefined,

  // Configure reporters for test results:
  // - 'github' reporter for CI integration
  // - HTML for local/CI (open report on failure locally, do not open in CI)
  reporter: isCI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
      ],

  // Default test options applied to every test
  use: {
    baseURL, // Application base URL
    trace: 'on-first-retry', // Capture detailed traces on failure (first retry)
    screenshot: 'only-on-failure', // Only take screenshots when a test fails
    video: 'retain-on-failure', // Only retain videos when a test fails
  },

  expect: {
    timeout: 10_000, // Default timeout for expect assertions (10 seconds)
  },

  timeout: 60_000, // Maximum time each test can run (1 minute)

  // Define which browsers/devices to test in:
  // - On CI: Chromium only for speed/stability
  // - Locally: Chromium, Firefox, and WebKit
  projects: isCI
    ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],

  // Web server configuration for running the application before tests
  webServer: {
    command: startCommand, // How to start the server
    url: baseURL, // Ready when this URL responds
    reuseExistingServer: !isCI, // On CI: always start fresh; locally: reuse if already running
    timeout: 120_000, // Wait up to 2 minutes for server to start
  },
});
