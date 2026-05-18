/**
 * T-062 — Auth flow E2E tests
 *
 * Tests the register and login pages using mocked API responses.
 * No real backend required — all /api/v1/auth/* calls are intercepted.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api/v1';

// ── Register ──────────────────────────────────────────────────────────────────

test.describe('Register page', () => {
 test('shows validation errors when form is submitted empty', async ({
  page,
 }) => {
  await page.goto('/register');
  await page.click('button[type="submit"]');

  // react-hook-form + zod should surface at least one error
  const errors = page.locator('p', { hasText: /required|valid email/i });
  await expect(errors.first()).toBeVisible();
 });

 test('successful registration redirects to verify-email page', async ({
  page,
 }) => {
  // Mock POST /api/v1/auth/register → 201
  await page.route(`${API}/auth/register`, (route) =>
   route.fulfill({
    status: 201,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Verification email sent' }),
   }),
  );

  await page.goto('/register');

  await page.fill('input[name="firstName"]', 'Alice');
  await page.fill('input[name="lastName"]', 'Smith');
  await page.fill('input[name="email"]', 'alice@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="jobTitle"]', 'CTO');
  await page.fill('input[name="country"]', 'US');
  await page.fill('input[name="orgName"]', 'Acme Inc');
  await page.selectOption('select[name="companySize"]', 'MICRO');

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/auth\/verify-email/);
 });

 test('shows server error when registration fails', async ({ page }) => {
  await page.route(`${API}/auth/register`, (route) =>
   route.fulfill({
    status: 409,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Email already in use' }),
   }),
  );

  await page.goto('/register');

  await page.fill('input[name="firstName"]', 'Alice');
  await page.fill('input[name="lastName"]', 'Smith');
  await page.fill('input[name="email"]', 'existing@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="jobTitle"]', 'CTO');
  await page.fill('input[name="country"]', 'US');
  await page.fill('input[name="orgName"]', 'Acme Inc');
  await page.selectOption('select[name="companySize"]', 'MICRO');

  await page.click('button[type="submit"]');

  await expect(page.locator('text=Email already in use')).toBeVisible();
 });
});

// ── Login ─────────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
 test('shows validation errors when submitted empty', async ({ page }) => {
  await page.goto('/login');
  await page.click('button[type="submit"]');

  const errors = page.locator('p', { hasText: /required|valid email/i });
  await expect(errors.first()).toBeVisible();
 });

 test('successful login redirects to dashboard', async ({ page }) => {
  // Mock refresh so interceptor doesn't loop; mock login itself
  await page.route(`${API}/auth/login`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ accessToken: 'mock-access-token' }),
   }),
  );
  // Stub the dashboard data so the page doesn't hang
  await page.route(`${API}/**`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([]),
   }),
  );

  await page.goto('/login');

  await page.fill('input[name="email"]', 'alice@example.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
 });

 test('shows error message on invalid credentials', async ({ page }) => {
  // Use 400 (Bad Request) so the axios 401-interceptor does not kick in
  // and redirect away before the component can display the error message.
  await page.route(`${API}/auth/login`, (route) =>
   route.fulfill({
    status: 400,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Invalid email or password' }),
   }),
  );

  await page.goto('/login');

  await page.fill('input[name="email"]', 'wrong@example.com');
  await page.fill('input[name="password"]', 'badpass');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Invalid email or password')).toBeVisible();
 });
});
