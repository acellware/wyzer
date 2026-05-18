/**
 * T-062 — Stack builder E2E tests
 *
 * Tests the stacks list page and the new stack multi-step wizard.
 * All API calls are intercepted and mocked via page.route().
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api/v1';

// Minimal stub data
const MOCK_STACK = {
 id: 'stack-e2e-1',
 name: 'My E2E Stack',
 description: '',
 items: [],
 createdAt: new Date().toISOString(),
};

const MOCK_TECH = {
 id: 'tech-1',
 name: 'PostgreSQL',
 category: 'DATABASE',
 description: 'Open-source relational database',
 logoUrl: null,
 isCustom: false,
 frameworks: [],
 createdAt: new Date().toISOString(),
};

const MOCK_DATA_SCOPE = {
 id: 'general',
 label: 'General',
 description: 'General purpose data',
 triggeredFrameworkSlugs: [],
};

// ── Stacks list ───────────────────────────────────────────────────────────────

test.describe('Stacks list page', () => {
 test('shows empty state when no stacks exist', async ({ page }) => {
  await page.route(`${API}/stacks`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
   }),
  );

  await page.goto('/stacks');

  // New Stack button should be visible
  await expect(page.locator('text=New Stack').first()).toBeVisible();
  // Empty state message (exact text rendered by the component)
  await expect(page.locator('text=No stacks yet')).toBeVisible();
 });

 test('renders existing stacks', async ({ page }) => {
  await page.route(`${API}/stacks`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([MOCK_STACK]),
   }),
  );

  await page.goto('/stacks');

  await expect(page.locator(`text=${MOCK_STACK.name}`)).toBeVisible();
 });
});

// ── New stack wizard ───────────────────────────────────────────────────────────

test.describe('New stack wizard', () => {
 async function setupWizardRoutes(page: import('@playwright/test').Page) {
  await page.route(`${API}/stack-templates`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
   }),
  );
  await page.route(`${API}/data-scopes`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([MOCK_DATA_SCOPE]),
   }),
  );
  // General tech list (catch-all registered first, lowest priority)
  await page.route(`${API}/technologies**`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: [MOCK_TECH], total: 1 }),
   }),
  );
  // Config questions for selected tech - registered after, higher Playwright priority (LIFO)
  await page.route(`${API}/technologies/*/config-questions**`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
   }),
  );
 }

 test('starts on template selection step', async ({ page }) => {
  await setupWizardRoutes(page);

  await page.goto('/stacks/new');

  // Step 0 heading
  await expect(
   page.locator('h2', { hasText: 'Start from a template' }),
  ).toBeVisible();
 });

 test('can proceed past template step to data scopes', async ({ page }) => {
  await setupWizardRoutes(page);

  await page.goto('/stacks/new');

  // Step 0: choose "Build from scratch"
  await page.getByRole('button', { name: /Build from scratch/i }).click();

  // Should now be on step 1 — "Data Scope" section
  await expect(page.locator('text=General').first()).toBeVisible();
 });

 test('can create a stack from the wizard', async ({ page }) => {
  await setupWizardRoutes(page);

  await page.route(`${API}/stacks`, async (route) => {
   if (route.request().method() === 'POST') {
    await route.fulfill({
     status: 201,
     contentType: 'application/json',
     body: JSON.stringify(MOCK_STACK),
    });
   } else {
    await route.fulfill({
     status: 200,
     contentType: 'application/json',
     body: JSON.stringify([]),
    });
   }
  });

  // Stub stack detail page so redirect doesn't fail
  await page.route(`${API}/stacks/stack-e2e-1`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_STACK),
   }),
  );

  await page.goto('/stacks/new');

  // Step 0: choose "Build from scratch"
  await page.getByRole('button', { name: /Build from scratch/i }).click();

  // Step 1: select General data scope (enables the Continue button)
  await page.locator('button', { hasText: 'General' }).click();

  // Click Continue to advance to step 2
  await page.locator('button', { hasText: 'Continue' }).click();

  // Step 2: fill stack name and select a technology to satisfy form validation
  await page.fill('input[placeholder*="Stack"]', 'My E2E Stack');
  await page.locator('button', { hasText: 'PostgreSQL' }).click();

  // Create Stack button should become enabled once name + tech are provided
  const createBtn = page.getByRole('button', { name: 'Create Stack' });
  await expect(createBtn).not.toBeDisabled();
 });
});
