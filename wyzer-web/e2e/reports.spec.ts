/**
 * T-062 — Report view E2E tests
 *
 * Tests the compliance report detail page using mocked API responses.
 * No real backend required — all /api/v1/reports/* calls are intercepted.
 */
import { test, expect } from '@playwright/test';

const API = 'http://localhost:3001/api/v1';

const MOCK_REPORT = {
 id: 'report-e2e-1',
 stackId: 'stack-1',
 status: 'DONE',
 error: null,
 pdfUrl: null,
 shareToken: null,
 shareExpiresAt: null,
 stack: { id: 'stack-1', name: 'My Stack', organisationId: 'org-1' },
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString(),
 result: {
  generatedAt: new Date().toISOString(),
  frameworkScores: { 'SOC 2': 72, 'ISO 27001': 55 },
  gaps: [
   {
    controlRef: 'CC6.1',
    controlTitle: 'Access Control Policy',
    frameworkSlug: 'soc2',
    frameworkName: 'SOC 2',
    severity: 'HIGH',
    technologyName: 'AWS',
    remediation: null,
    isPartial: false,
   },
  ],
  unverified: [],
  satisfiedControls: [
   {
    controlRef: 'CC1.1',
    controlTitle: 'Control Environment',
    frameworkSlug: 'soc2',
    technologyName: 'AWS',
   },
  ],
 },
};

// ── Report detail ─────────────────────────────────────────────────────────────

test.describe('Report detail page', () => {
 test('renders "Compliance Report" heading', async ({ page }) => {
  await page.route(`${API}/reports/${MOCK_REPORT.id}`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_REPORT),
   }),
  );

  await page.goto(`/reports/${MOCK_REPORT.id}`);

  await expect(
   page.locator('h1', { hasText: 'Compliance Report' }),
  ).toBeVisible();
  await expect(page.locator(`text=My Stack`)).toBeVisible();
 });

 test('shows framework scores', async ({ page }) => {
  await page.route(`${API}/reports/${MOCK_REPORT.id}`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_REPORT),
   }),
  );

  await page.goto(`/reports/${MOCK_REPORT.id}`);

  // Score ring labels are the frameworkId strings
  await expect(page.locator('text=SOC 2')).toBeVisible();
  await expect(page.locator('text=ISO 27001')).toBeVisible();
 });

 test('shows gaps section with gap count', async ({ page }) => {
  await page.route(`${API}/reports/${MOCK_REPORT.id}`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(MOCK_REPORT),
   }),
  );

  await page.goto(`/reports/${MOCK_REPORT.id}`);

  await expect(page.locator('text=/Gaps \\(1\\)/i')).toBeVisible();
  await expect(page.locator('text=Access Control Policy')).toBeVisible();
 });

 test('shows "not found" message for unknown report id', async ({ page }) => {
  await page.route(`${API}/reports/nonexistent`, (route) =>
   route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Report not found' }),
   }),
  );
  // Prevent auth refresh loop
  await page.route(`${API}/auth/refresh`, (route) => route.abort());

  await page.goto('/reports/nonexistent');

  await expect(page.locator('text=Report not found')).toBeVisible();
 });

 test('shows pending spinner while report is running', async ({ page }) => {
  const pendingReport = { ...MOCK_REPORT, status: 'PENDING', result: null };

  await page.route(`${API}/reports/${pendingReport.id}`, (route) =>
   route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(pendingReport),
   }),
  );

  await page.goto(`/reports/${pendingReport.id}`);

  // The page should show some loading/pending indicator — React Query refetches,
  // but the page renders the pending report immediately from the first response.
  await expect(
   page.locator('h1', { hasText: 'Compliance Report' }),
  ).toBeVisible();
  // Score section should NOT be visible for pending report
  await expect(page.locator('text=SOC 2')).not.toBeVisible();
 });
});
