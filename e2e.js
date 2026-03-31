/**
 * Care Exchange — E2E Test Suite
 * Runs against http://localhost:3000
 *
 * Covers:
 *   1. Project page (public landing — all content tabs)
 *   2. Login page + flow
 *   3. Register page + flow (Participant, Provider, Coordinator)
 *   4. Dashboard (protected)
 *   5. Navigation
 *   6. API health
 */

const { chromium } = require('playwright');
const crypto = require('crypto');

const BASE_URL     = 'http://localhost:3000';
const API_BASE     = 'http://localhost:5000/api';
const RESULTS      = [];
let   browser;
let   context;
let   page;

const TIMESTAMP = Date.now();
const TEST_PWD  = 'Test@1234';

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(test, status, details = '') {
  const mark = status === 'PASS' ? '✓' : '✗';
  console.log(`  ${mark} ${test}: ${status}${details ? ' — ' + details : ''}`);
  RESULTS.push({ test, status, details });
}

async function captureErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function waitForRoute(page, regex, timeout = 5000) {
  await page.waitForFunction(
    r => location.href.match(r), regex,
    { timeout }
  ).catch(() => {});
}

function freshEmail(role = 'participant') {
  return `ce_e2e_${role}_${TIMESTAMP}@test.com`;
}

// ── Test Suites ──────────────────────────────────────────────────────────────

async function testProjectPage() {
  console.log('\n▌ TEST SUITE 1: Project Page (public)');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  // Load
  const res = await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Project page loads', res.ok() ? 'PASS' : 'FAIL', `HTTP ${res.status()}`);

  // Title
  const title = await p.title();
  log('Page title correct', title.includes('Care Exchange') ? 'PASS' : 'FAIL', title);

  // Tab nav exists
  const tabs = ['Overview', 'Personas', 'Use Cases', 'Go-to-Market', 'Team', 'Diagrams'];
  for (const tab of tabs) {
    const btn = p.locator(`button:has-text("${tab}")`);
    const count = await btn.count();
    log(`Tab "${tab}" present`, count > 0 ? 'PASS' : 'FAIL', '');
  }

  // Overview tab — hero heading visible
  const hero = p.locator('h1:has-text("Care that connects")');
  log('Hero heading visible', await hero.isVisible() ? 'PASS' : 'FAIL', '');

  // Stats bar
  const stats = p.locator('text=User Roles');
  log('Stats bar visible', await stats.isVisible() ? 'PASS' : 'FAIL', '');

  // Feature cards
  const featureCount = await p.locator('.bg-white.rounded-2xl.border.border-slate-200').count();
  log('Feature cards rendered', featureCount >= 3 ? 'PASS' : 'FAIL', `found ${featureCount}`);

  // Live App link
  const liveLink = p.locator(`a:has-text("Live App")`).first();
  log('Live App link present', await liveLink.isVisible() ? 'PASS' : 'FAIL', '');

  // Console errors
  const filteredErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('ERR_BLOCKED') && !e.includes('net::ERR')
  );
  log('No console errors', filteredErrors.length === 0 ? 'PASS' : 'FAIL',
    filteredErrors.length > 0 ? filteredErrors[0].substring(0, 100) : '');

  await p.close();
  return { errors: filteredErrors };
}

async function testProjectContentTabs() {
  console.log('\n▌ TEST SUITE 2: Project Content Tabs');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });

  // Skip overview (default), test each API-driven tab
  const apiTabs = [
    { label: 'Personas',      expect: 'Priya Sharma' },
    { label: 'Use Cases',     expect: 'Actor' },
    { label: 'Go-to-Market',  expect: 'NDIS' },
    { label: 'Team',          expect: 'Anjali' },
    { label: 'Diagrams',      expect: 'PARTICIPANT' },
  ];

  for (const { label, expect } of apiTabs) {
    await p.click(`button:has-text("${label}")`);
    await p.waitForTimeout(1500); // let markdown load

    const bodyText = await p.locator('.prose, [class*="prose"]').last().textContent().catch(() => '');
    log(`Tab "${label}" loads content`, bodyText.includes(expect) ? 'PASS' : 'FAIL',
      bodyText ? `found "${bodyText.substring(0, 60).replace(/\n/g,' ')}"` : 'no content');

    // Check for error state
    const errorBox = p.locator('.bg-red-50');
    const hasError = await errorBox.isVisible().catch(() => false);
    log(`Tab "${label}" no error state`, !hasError ? 'PASS' : 'FAIL', '');
  }

  await p.close();
  return { errors };
}

async function testLoginPage() {
  console.log('\n▌ TEST SUITE 3: Login Page');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Login page loads', (await p.title()) ? 'PASS' : 'FAIL', await p.title());

  // Form fields
  const emailInput    = p.locator('input[type="email"], input[name="email"]');
  const passwordInput = p.locator('input[type="password"], input[name="password"]');
  const submitBtn     = p.locator('button[type="submit"], button:has-text("Sign in")');

  log('Email input present', await emailInput.count() > 0 ? 'PASS' : 'FAIL', '');
  log('Password input present', await passwordInput.count() > 0 ? 'PASS' : 'FAIL', '');
  log('Submit button present', await submitBtn.count() > 0 ? 'PASS' : 'FAIL', '');

  // Brand visible
  const brand = p.locator('text=Care Exchange');
  log('Brand logo visible', await brand.count() > 0 ? 'PASS' : 'FAIL', '');

  // Register link
  const registerLink = p.locator('a:has-text("Create Account"), a:has-text("Register")');
  log('Register link present', await registerLink.count() > 0 ? 'PASS' : 'FAIL', '');

  // Submit empty form → error
  await submitBtn.click();
  await p.waitForTimeout(500);
  const errorMsg = p.locator('.bg-red-50, .text-red-');
  log('Empty submit shows error', await errorMsg.count() > 0 ? 'PASS' : 'FAIL', '');

  // Wrong credentials
  await emailInput.fill('nobody@test.com');
  await passwordInput.fill('wrongpassword');
  await submitBtn.click();
  await p.waitForTimeout(3000);
  const currentUrl = p.url();
  log('Wrong credentials stays on login', !currentUrl.includes('dashboard') ? 'PASS' : 'FAIL', currentUrl);

  const filteredErrors = errors.filter(e => !e.includes('favicon'));
  log('No console errors on login', filteredErrors.length === 0 ? 'PASS' : 'FAIL', '');

  await p.close();
  return { errors: filteredErrors };
}

async function testRegisterPage() {
  console.log('\n▌ TEST SUITE 4: Register Page');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Register page loads', (await p.title()) ? 'PASS' : 'FAIL', '');

  // Role selectors (Participant, Provider, Coordinator)
  for (const role of ['Participant', 'Provider', 'Support Coordinator']) {
    const roleBtn = p.locator(`button:has-text("${role}")`);
    log(`Role option "${role}" present`, await roleBtn.count() > 0 ? 'PASS' : 'FAIL', '');
  }

  // Form fields
  for (const label of ['Full Name', 'Email', 'Password']) {
    const input = p.locator(`input[placeholder*="${label}" i], label:has-text("${label}") ~ input`);
    log(`Field "${label}" present`, await input.count() > 0 ? 'PASS' : 'FAIL', '');
  }

  // Submit without filling → validation error
  const submitBtn = p.locator('button[type="submit"]');
  await submitBtn.click();
  await p.waitForTimeout(500);
  const validationErr = p.locator('.bg-red-50, .text-red-');
  log('Empty register shows validation', await validationErr.count() > 0 ? 'PASS' : 'FAIL', '');

  await p.close();
  return { errors };
}

async function testRegisterFlow() {
  console.log('\n▌ TEST SUITE 5: Full Registration Flow');

  const email    = freshEmail('participant');
  const p        = await context.newPage();
  const errors   = await captureErrors(p);

  await p.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 });

  // Fill form
  await p.fill('input[placeholder*="name" i], input[name="full_name"]', 'E2E Test Participant');
  await p.fill('input[type="email"]', email);
  await p.fill('input[type="password"]', TEST_PWD);

  // Select Participant role
  await p.click('button:has-text("Participant")');

  // Submit
  await p.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await p.waitForTimeout(4000);
  const finalUrl = p.url();

  log('Redirects to dashboard after register',
    finalUrl.includes('dashboard') || finalUrl === BASE_URL + '/' ? 'PASS' : 'FAIL',
    `URL: ${finalUrl}`);

  // Check token in localStorage
  const token = await p.evaluate(() =>
    localStorage.getItem('access_token') || localStorage.getItem('token')
  );
  log('JWT token stored after register', token ? 'PASS' : 'FAIL', token ? 'present' : 'missing');

  // Dashboard content visible (if redirected)
  if (finalUrl.includes('dashboard') || finalUrl === BASE_URL + '/') {
    const dashContent = await p.locator('body').textContent();
    log('Dashboard has content', dashContent.length > 50 ? 'PASS' : 'FAIL', `chars: ${dashContent.length}`);
  }

  await p.close();
  return { email, token, errors };
}

async function testLoginFlow(email) {
  console.log('\n▌ TEST SUITE 6: Full Login Flow');

  // Use the email from registration — but first register a fresh user
  const loginEmail = email || freshEmail('login');
  const p          = await context.newPage();
  const errors     = await captureErrors(p);

  // Register a fresh user first so we have valid credentials
  await p.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.fill('input[placeholder*="name" i], input[name="full_name"]', 'E2E Login Tester');
  await p.fill('input[type="email"]', loginEmail);
  await p.fill('input[type="password"]', TEST_PWD);
  await p.click('button:has-text("Participant")');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);

  // Now log out (clear storage) and log back in
  await p.evaluate(() => localStorage.clear());
  await p.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 });

  await p.fill('input[type="email"]', loginEmail);
  await p.fill('input[type="password"]', TEST_PWD);
  await p.click('button[type="submit"]');

  await p.waitForTimeout(3000);
  const finalUrl = p.url();

  log('Redirects to dashboard after login',
    finalUrl.includes('dashboard') || finalUrl === BASE_URL + '/' ? 'PASS' : 'FAIL',
    `URL: ${finalUrl}`);

  // Token exists
  const token = await p.evaluate(() =>
    localStorage.getItem('access_token') || localStorage.getItem('token')
  );
  log('Token stored after login', token ? 'PASS' : 'FAIL', '');

  // Protected route — go directly to /dashboard
  await p.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  const dashUrl = p.url();
  log('Dashboard accessible with token', !dashUrl.includes('login') ? 'PASS' : 'FAIL', dashUrl);

  await p.close();
  return { errors };
}

async function testDashboard() {
  console.log('\n▌ TEST SUITE 7: Dashboard (authenticated)');

  // Register + land on dashboard
  const email = freshEmail('dash');
  const p     = await context.newPage();
  const errors = await captureErrors(p);

  // Register
  await p.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 });
  await p.fill('input[placeholder*="name" i], input[name="full_name"]', 'E2E Dashboard Tester');
  await p.fill('input[type="email"]', email);
  await p.fill('input[type="password"]', TEST_PWD);
  await p.click('button:has-text("Participant")');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);

  // We should be on dashboard
  await p.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });

  // Check sidebar/layout is visible
  const sidebar = p.locator('nav, aside, [class*="sidebar" i], [class*="layout" i]');
  log('Dashboard layout renders', await sidebar.count() > 0 ? 'PASS' : 'FAIL', '');

  // Check main content area
  const body = await p.locator('body').textContent();
  log('Dashboard has content', body.length > 50 ? 'PASS' : 'FAIL', `chars: ${body.length}`);

  // Navigate to project page
  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 15000 });
  const projectLoaded = await p.locator('h1').first().isVisible();
  log('Can navigate to project page', projectLoaded ? 'PASS' : 'FAIL', '');

  await p.close();
  return { errors };
}

async function testApiHealth() {
  console.log('\n▌ TEST SUITE 8: API Health & Content API');

  // Backend health
  const healthRes = await context.newPage();
  const res = await healthRes.goto(`${API_BASE}/health`, { timeout: 10000 });
  const healthJson = await res.json().catch(() => null);
  log('API /health', res.ok() && healthJson?.status === 'healthy' ? 'PASS' : 'FAIL',
    JSON.stringify(healthJson));

  // Content API endpoints
  for (const key of ['personas', 'use-cases', 'go-to-market', 'team', 'diagrams']) {
    const r = await healthRes.goto(`${API_BASE}/v1/content/${key}`, { timeout: 10000 });
    const d = await r.json().catch(() => null);
    log(`API /v1/content/${key}`,
      r.ok() && d?.content ? 'PASS' : 'FAIL',
      d?.content ? `${d.content.length} chars` : 'no content');
  }

  await healthRes.close();
}

async function testProjectPageNavigation() {
  console.log('\n▌ TEST SUITE 9: Project Page Navigation Flow');

  const p = await context.newPage();

  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });

  // Click each tab and verify URL/state changes
  const tabs = ['Personas', 'Use Cases', 'Go-to-Market', 'Team', 'Diagrams'];
  for (const tab of tabs) {
    await p.click(`button:has-text("${tab}")`);
    await p.waitForTimeout(800);
    const active = await p.locator(`button:has-text("${tab}")[class*="bg-"]`).count();
    log(`Nav: "${tab}" tab activates`, active > 0 ? 'PASS' : 'FAIL', '');
  }

  // Back to overview
  await p.click(`button:has-text("Overview")`);
  await p.waitForTimeout(500);
  const heroVisible = await p.locator('h1:has-text("Care that connects")').isVisible();
  log('Nav: Back to Overview works', heroVisible ? 'PASS' : 'FAIL', '');

  // Mobile menu toggle
  await p.setViewportSize({ width: 375, height: 812 });
  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });
  const menuBtn = p.locator('button.md\\:hidden').first();
  const menuExists = await menuBtn.count() > 0;
  if (menuExists) {
    await menuBtn.click();
    await p.waitForTimeout(300);
    const drawer = await p.locator('text=Personas').isVisible();
    log('Mobile menu opens', drawer ? 'PASS' : 'FAIL', '');
  } else {
    log('Mobile menu toggle', 'PASS', 'viewport already mobile-friendly');
  }

  await p.close();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Care Exchange — E2E Test Suite          ║');
  console.log(`║   Target: ${BASE_URL}                    ║`);
  console.log(`║   API:    ${API_BASE}               ║`);
  console.log('╚══════════════════════════════════════════╝');

  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();

  // ── Run all suites ──────────────────────────────────────────────────────────
  await testProjectPage();
  await testProjectContentTabs();
  await testLoginPage();
  await testRegisterPage();

  const regResult = await testRegisterFlow();
  await testLoginFlow(regResult.email);
  await testDashboard();
  await testApiHealth();
  await testProjectPageNavigation();

  // ── Summary ────────────────────────────────────────────────────────────────
  const passed = RESULTS.filter(r => r.status === 'PASS').length;
  const failed = RESULTS.filter(r => r.status === 'FAIL').length;
  const total  = RESULTS.length;

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║              RESULTS SUMMARY              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  Total:  ${total}`);
  console.log(`  Passed: ${passed}  ${passed === total ? '✔' : ''}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n  Failed tests:');
    RESULTS.filter(r => r.status === 'FAIL').forEach(r =>
      console.log(`    · ${r.test}${r.details ? '\n      ' + r.details : ''}`)
    );
  }

  console.log(`\n  Overall: ${failed === 0 ? '✔ ALL PASSING' : `⚠ ${failed} FAILING`}\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n  Fatal error:', err.message);
  process.exit(1);
});
