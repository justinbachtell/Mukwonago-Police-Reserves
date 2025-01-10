import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv'
import path from 'node:path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

// Ensure environment variables are string type
const env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: process.env.TEST_NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.TEST_NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || '',
  DATABASE_URL: process.env.TEST_DATABASE_URL || ''
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Look for files with the .spec.js or .e2e.js extension
  testMatch: '*.@(spec|e2e).?(c|m)[jt]s?(x)',

  // Snapshot directory
  snapshotDir: './tests/e2e/snapshots',

  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  // Run tests in parallel
  fullyParallel: true,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests for auth tests
  workers: process.env.CI ? 4 : undefined,

  // Reporter to use
  reporter: process.env.CI ? 'github' : 'list',

  // Timeout for each test
  timeout: 60 * 1000,

  // Shared settings for all the projects below
  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Run in headless mode
    headless: true,

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/Chicago',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Set ignoreHTTPSErrors to true to ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Automatically handle dialogs
    acceptDownloads: true,

    // Time to wait for each navigation action in milliseconds
    navigationTimeout: 10 * 1000,

    // Time to wait for each action in milliseconds
    actionTimeout: 10 * 1000,

    // Record videos when retrying the failed test
    video: 'on-first-retry'
  },

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Projects to run
  projects: [
    // Setup project that runs before all other projects
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      teardown: 'teardown'
    },
    {
      name: 'teardown',
      testMatch: /global\.teardown\.ts/
    },

    // Authentication tests with setup dependency
    {
      name: 'Authentication - Desktop Chrome - 1366x768',
      testMatch: ['/authentication/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        isMobile: false
      },
      dependencies: ['setup'],
      retries: 1
    },

    // Desktop tests with setup dependency
    {
      name: 'Dashboard - Desktop Chrome - 1366x768',
      testMatch: ['/desktop/**/*.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 },
        isMobile: false
      },
      dependencies: ['setup'],
      retries: 1
    },
    {
      name: 'Dashboard - Desktop Firefox - 1920x1080',
      testMatch: ['/desktop/**/*.spec.ts'],
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        isMobile: false
      },
      dependencies: ['setup'],
      retries: 1
    },

    // Tablet tests with setup dependency
    {
      name: 'Dashboard - Tablet Safari - 768x1024',
      testMatch: ['/tablet/**/*.spec.ts'],
      use: {
        ...devices['Tablet Safari'],
        viewport: { width: 768, height: 1024 },
        isMobile: false
      },
      dependencies: ['setup'],
      retries: 1
    },

    // Mobile tests with setup dependency
    {
      name: 'Dashboard - Mobile Safari - 390x844',
      testMatch: ['/mobile/**/*.spec.ts'],
      use: {
        ...devices['Mobile Safari'],
        viewport: { width: 390, height: 844 },
        isMobile: true
      },
      dependencies: ['setup'],
      retries: 1
    },
    {
      name: 'Dashboard - Mobile Chrome - 390x844',
      testMatch: ['/mobile/**/*.spec.ts'],
      use: {
        ...devices['Mobile Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true
      },
      dependencies: ['setup'],
      retries: 1
    }
  ],

  // Expect settings
  expect: {
    // Maximum time expect() should wait for the condition to be met in milliseconds
    timeout: 60 * 1000,

    // To have the screenshot of the page
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixelRatio: 0.1,
      stylePath: ['./tests/e2e/style.css'],
      animations: 'disabled',
      scale: 'device',
      caret: 'hide'
    },

    toMatchSnapshot: {
      threshold: 0.1,
      maxDiffPixelRatio: 0.1,
      maxDiffPixels: 100
    }
  },

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
    url: baseURL,
    env
  }
})
