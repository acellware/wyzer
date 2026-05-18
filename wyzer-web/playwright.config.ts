import { defineConfig, devices } from '@playwright/test';

/**
 * T-062 — Playwright E2E configuration
 *
 * Starts the Vite dev server automatically and runs tests against it.
 * API calls are intercepted and mocked inside each spec via page.route().
 */
export default defineConfig({
 testDir: './e2e',
 fullyParallel: true,
 forbidOnly: !!process.env.CI,
 retries: process.env.CI ? 1 : 0,
 reporter: 'list',
 use: {
  baseURL: 'http://localhost:5173',
  trace: 'on-first-retry',
 },
 projects: [
  {
   name: 'chromium',
   use: { ...devices['Desktop Chrome'] },
  },
 ],
 webServer: {
  command: './node_modules/.bin/vite --port 5173',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 60_000,
 },
});
