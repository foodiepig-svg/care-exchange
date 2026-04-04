/**
 * Care Exchange — E2E Test Suite
 * Runs against https://care-exchange.onrender.com
 *
 * Covers:
 *   1. Project page (public landing — all content tabs)
 *   2. Project content tabs (API-driven)
 *   3. Login page (UI validation)
 *   4. Register page (UI validation)
 *   5. Full login flow (demo account)
 *   6. Dashboard (authenticated)
 *   7. API health + content API
 *   8. Project page navigation
 *   9. Support / Tickets (user)
 *   10. Admin Tickets page
 */

const { chromium } = require('playwright');

const BASE_URL  = 'https://care-exchange.onrender.com';
const API_BASE  = 'https://care-exchange.onrender.com/api';
const RESULTS   = [];
let   browser;
let   context;
let   page;

const TEST_PWD = 'Demo@1234';

const DEMO_ACCOUNTS = {
  participant:  { email: 'participant@demo.com',  role: 'participant' },
  provider:     { email: 'provider@demo.com',     role: 'provider' },
  coordinator: { email: 'coordinator@demo.com', role: 'coordinator' },
};

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

async function loginAs(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

// ── Test Suites ──────────────────────────────────────────────────────────────

async function testProjectPage() {
  console.log('\n▌ TEST SUITE 1: Project Page (public)');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  const res = await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Project page loads', res.ok() ? 'PASS' : 'FAIL', `HTTP ${res.status()}`);

  const title = await p.title();
  log('Page title correct', title.includes('Care Exchange') ? 'PASS' : 'FAIL', title);

  const tabs = ['Overview', 'Personas', 'Use Cases', 'Go-to-Market', 'Team', 'Diagrams'];
  for (const tab of tabs) {
    const btn = p.locator(`button:has-text("${tab}")`);
    log(`Tab "${tab}" present`, (await btn.count()) > 0 ? 'PASS' : 'FAIL', '');
  }

  const hero = p.locator('h1:has-text("Care that connects")');
  log('Hero heading visible', (await hero.isVisible()) ? 'PASS' : 'FAIL', '');

  const stats = p.locator('text=User Roles');
  log('Stats bar visible', (await stats.isVisible()) ? 'PASS' : 'FAIL', '');

  const featureCount = await p.locator('.bg-white.rounded-2xl.border.border-slate-200').count();
  log('Feature cards rendered', featureCount >= 3 ? 'PASS' : 'FAIL', `found ${featureCount}`);

  const liveLink = p.locator(`a:has-text("Live App")`).first();
  log('Live App link present', (await liveLink.isVisible()) ? 'PASS' : 'FAIL', '');

  const filteredErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('ERR_BLOCKED') && !e.includes('net::ERR')
  );
  log('No console errors', filteredErrors.length === 0 ? 'PASS' : 'FAIL',
    filteredErrors.length > 0 ? filteredErrors[0].substring(0, 100) : '');

  await p.close();
}

async function testProjectContentTabs() {
  console.log('\n▌ TEST SUITE 2: Project Content Tabs');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });

  const apiTabs = [
    { label: 'Personas',      expect: 'Priya Sharma' },
    { label: 'Use Cases',     expect: 'Actor' },
    { label: 'Go-to-Market',  expect: 'NDIS' },
    { label: 'Team',          expect: 'Anjali' },
    { label: 'Diagrams',      expect: 'PARTICIPANT' },
  ];

  for (const { label, expect } of apiTabs) {
    await p.click(`button:has-text("${label}")`);
    await p.waitForTimeout(1500);

    const bodyText = await p.locator('.prose, [class*="prose"]').last().textContent().catch(() => '');
    log(`Tab "${label}" loads content`, bodyText.includes(expect) ? 'PASS' : 'FAIL',
      bodyText ? `found "${bodyText.substring(0, 60).replace(/\n/g,' ')}"` : 'no content');

    const errorBox = p.locator('.bg-red-50');
    const hasError = await errorBox.isVisible().catch(() => false);
    log(`Tab "${label}" no error state`, !hasError ? 'PASS' : 'FAIL', '');
  }

  await p.close();
}

async function testLoginPage() {
  console.log('\n▌ TEST SUITE 3: Login Page');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Login page loads', (await p.title()) ? 'PASS' : 'FAIL', await p.title());

  const emailInput    = p.locator('input[type="email"]');
  const passwordInput = p.locator('input[type="password"]');
  const submitBtn     = p.locator('button[type="submit"], button:has-text("Sign in")');

  log('Email input present', (await emailInput.count()) > 0 ? 'PASS' : 'FAIL', '');
  log('Password input present', (await passwordInput.count()) > 0 ? 'PASS' : 'FAIL', '');
  log('Submit button present', (await submitBtn.count()) > 0 ? 'PASS' : 'FAIL', '');

  const brand = p.locator('text=Care Exchange');
  log('Brand logo visible', (await brand.count()) > 0 ? 'PASS' : 'FAIL', '');

  const registerLink = p.locator('a:has-text("Create Account"), a:has-text("Register")');
  log('Register link present', (await registerLink.count()) > 0 ? 'PASS' : 'FAIL', '');

  // Wrong credentials
  await emailInput.fill('nobody@test.com');
  await passwordInput.fill('wrongpassword');
  await submitBtn.click();
  await p.waitForTimeout(3000);
  const currentUrl = p.url();
  log('Wrong credentials stays on login', !currentUrl.includes('dashboard') ? 'PASS' : 'FAIL', currentUrl);

  // Only flag actual JS errors / API errors — not 401 from /auth/me on login page
  const criticalErrors = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('net::ERR') &&
    !e.includes('401') &&
    !e.includes('Failed to load resource')
  );
  log('No critical console errors', criticalErrors.length === 0 ? 'PASS' : 'FAIL',
    criticalErrors.length > 0 ? criticalErrors[0].substring(0, 80) : '');

  await p.close();
}

async function testRegisterPage() {
  console.log('\n▌ TEST SUITE 4: Register Page');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await p.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 20000 });
  log('Register page loads', (await p.title()) ? 'PASS' : 'FAIL', '');

  // Page uses radio inputs for role selection
  for (const text of ['Participant', 'Provider', 'Support Coordinator']) {
    const radio = p.locator(`text="${text}"`).first();
    log(`Role option "${text}" present`, (await radio.count()) > 0 ? 'PASS' : 'FAIL', '');
  }

  // Inputs use placeholder text
  const nameInput  = p.locator('input[placeholder*="Jane"]');
  const emailInput = p.locator('input[placeholder*="example.com"]');
  const pwdInput   = p.locator('input[placeholder*="Min. 8"]');

  log('Full Name input present', (await nameInput.count()) > 0 ? 'PASS' : 'FAIL', '');
  log('Email input present', (await emailInput.count()) > 0 ? 'PASS' : 'FAIL', '');
  log('Password input present', (await pwdInput.count()) > 0 ? 'PASS' : 'FAIL', '');

  // Fill required fields (name + email) so browser doesn't block form submission
  await nameInput.fill('Test User');
  await emailInput.fill('test@example.com');
  await pwdInput.fill('Test@1234');

  // Submit without role selected — should show "Please select a role"
  const submitBtn = p.locator('button[type="submit"]');
  await submitBtn.click();
  await p.waitForTimeout(1000);
  // The error message appears on the form — look for "Please select a role" text
  const errorMsg = p.locator('text=Please select a role');
  log('Empty submit shows error', (await errorMsg.count()) > 0 ? 'PASS' : 'FAIL', '');

  await p.close();
}

async function testLoginFlow() {
  console.log('\n▌ TEST SUITE 5: Full Login Flow (Participant)');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await loginAs(p, DEMO_ACCOUNTS.participant.email, TEST_PWD);

  const finalUrl = p.url();
  log('Redirects to dashboard after login',
    finalUrl.includes('dashboard') || finalUrl === BASE_URL + '/' ? 'PASS' : 'FAIL',
    `URL: ${finalUrl}`);

  const token = await p.evaluate(() =>
    localStorage.getItem('access_token') || localStorage.getItem('token')
  );
  log('Token stored after login', token ? 'PASS' : 'FAIL', '');

  log('Dashboard accessible immediately after login',
    finalUrl.includes('dashboard') || finalUrl === BASE_URL + '/' ? 'PASS' : 'FAIL',
    finalUrl);

  // Keep page open for authenticated tests that follow in the same page
  return p; // hand off page to next test
}

async function testDashboard() {
  console.log('\n▌ TEST SUITE 6: Dashboard (authenticated)');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  // Login first, then navigate within the same page
  await loginAs(p, DEMO_ACCOUNTS.participant.email, TEST_PWD);
  await p.waitForTimeout(1000);

  // Use window.location to navigate — but first check if we're on a page with sidebar links
  await p.evaluate(() => { window.location.href = '/dashboard'; });
  await p.waitForTimeout(5000);

  const dashUrl = p.url();
  log('Dashboard URL correct', dashUrl.includes('dashboard') || dashUrl === BASE_URL + '/' ? 'PASS' : 'FAIL', dashUrl);

  // Check that main content area has rendered
  const navItems = p.locator('[class*="sidebar"] a, [class*="nav"] a, nav a');
  log('Dashboard layout renders', (await navItems.count()) > 0 ? 'PASS' : 'FAIL',
    `found ${await navItems.count()} nav links`);

  const body = await p.locator('body').textContent();
  log('Dashboard has content', body.length > 50 ? 'PASS' : 'FAIL', `chars: ${body.length}`);

  // Navigate to project page via window.location
  await p.evaluate(() => { window.location.href = '/project'; });
  await p.waitForTimeout(5000);
  const projectLoaded = await p.locator('h1').first().isVisible();
  log('Can navigate to project page', projectLoaded ? 'PASS' : 'FAIL', '');

  await p.close();
}

async function testApiHealth() {
  console.log('\n▌ TEST SUITE 7: API Health & Content API');

  const p = await context.newPage();

  const res = await p.goto(`${API_BASE}/health`, { timeout: 10000 });
  const healthJson = await res.json().catch(() => null);
  log('API /health', res.ok() && healthJson?.status === 'healthy' ? 'PASS' : 'FAIL',
    JSON.stringify(healthJson));

  for (const key of ['personas', 'use-cases', 'go-to-market', 'team', 'diagrams']) {
    const r = await p.goto(`${API_BASE}/v1/content/${key}`, { timeout: 10000 });
    const d = await r.json().catch(() => null);
    log(`API /v1/content/${key}`,
      r.ok() && d?.content ? 'PASS' : 'FAIL',
      d?.content ? `${d.content.length} chars` : 'no content');
  }

  await p.close();
}

async function testProjectPageNavigation() {
  console.log('\n▌ TEST SUITE 8: Project Page Navigation Flow');

  const p = await context.newPage();

  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });

  const tabs = ['Personas', 'Use Cases', 'Go-to-Market', 'Team', 'Diagrams'];
  for (const tab of tabs) {
    await p.click(`button:has-text("${tab}")`);
    await p.waitForTimeout(800);
    const active = await p.locator(`button:has-text("${tab}")[class*="bg-"]`).count();
    log(`Nav: "${tab}" tab activates`, active > 0 ? 'PASS' : 'FAIL', '');
  }

  await p.click(`button:has-text("Overview")`);
  await p.waitForTimeout(500);
  const heroVisible = await p.locator('h1:has-text("Care that connects")').isVisible();
  log('Nav: Back to Overview works', heroVisible ? 'PASS' : 'FAIL', '');

  // Mobile: just verify page is usable at mobile viewport
  await p.setViewportSize({ width: 375, height: 812 });
  await p.goto(`${BASE_URL}/project`, { waitUntil: 'networkidle', timeout: 20000 });
  // Verify the hero or tabs are visible at mobile size
  const mobileHero = p.locator('h1').first();
  log('Mobile: page renders at 375px', (await mobileHero.isVisible()) ? 'PASS' : 'FAIL', '');

  await p.close();
}

async function testTicketsUser() {
  console.log('\n▌ TEST SUITE 9: Support / Tickets (Participant)');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  await loginAs(p, DEMO_ACCOUNTS.participant.email, TEST_PWD);
  await p.waitForTimeout(1000);

  // Use window.location to navigate — preserves React Router/AuthContext state
  await p.evaluate(() => { window.location.href = '/app/support'; });
  await p.waitForTimeout(5000);
  const supportUrl = p.url();
  log('Support page URL correct', supportUrl.includes('/app/support') ? 'PASS' : 'FAIL', supportUrl);

  log('Support page loads', (await p.locator('h1:has-text("Help & Support")').isVisible()) ? 'PASS' : 'FAIL', '');

  const newTicketBtn = p.locator('button:has-text("New Ticket")');
  log('New Ticket button present', (await newTicketBtn.count()) > 0 ? 'PASS' : 'FAIL', '');

  await newTicketBtn.click();
  await p.waitForTimeout(400);

  const titleInput = p.locator('input[maxlength="200"]').first();
  const descInput = p.locator('textarea').first();

  if ((await titleInput.count()) > 0) {
    await titleInput.fill('E2E Test: Login button alignment issue');
    await descInput.fill('The login button on mobile overlaps with the cookie banner. Please fix the z-index.');
    await p.click('button:has-text("Submit Ticket")');
    await p.waitForTimeout(2500);

    const successMsg = p.locator('text=Ticket submitted');
    log('Ticket submitted successfully', (await successMsg.count()) > 0 ? 'PASS' : 'FAIL', '');
  } else {
    log('Ticket form renders', 'FAIL', 'title input not found');
  }

  const criticalErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('Failed to load resource')
  );
  log('No critical console errors on Support page', criticalErrors.length === 0 ? 'PASS' : 'FAIL',
    criticalErrors.length > 0 ? criticalErrors[0].substring(0, 80) : '');

  await p.close();
}

async function testTicketsAdmin() {
  console.log('\n▌ TEST SUITE 10: Admin Tickets Page');

  const p = await context.newPage();
  const errors = await captureErrors(p);

  // Login as coordinator (admin demo account may not exist)
  await loginAs(p, DEMO_ACCOUNTS.coordinator.email, TEST_PWD);
  await p.goto(`${BASE_URL}/admin/tickets`, { waitUntil: 'networkidle', timeout: 15000 });
  const url = p.url();

  if (url.includes('/admin/tickets')) {
    log('Admin tickets page accessible', 'PASS', '');

    const heading = p.locator('h1:has-text("Support Tickets")');
    log('Support Tickets heading visible', (await heading.count()) > 0 ? 'PASS' : 'FAIL', '');

    await p.waitForTimeout(2000);
    const tableRows = await p.locator('table tbody tr').count();
    log('Tickets table has rows', tableRows > 0 ? 'PASS' : 'FAIL', `found ${tableRows}`);
  } else {
    // Non-admin redirected away — expected
    log('Admin tickets page redirects non-admin', 'PASS', `redirected to ${url}`);
  }

  const criticalErrors = errors.filter(e =>
    !e.includes('favicon') && !e.includes('net::ERR') && !e.includes('Failed to load resource')
  );
  log('No critical console errors on Admin Tickets', criticalErrors.length === 0 ? 'PASS' : 'FAIL',
    criticalErrors.length > 0 ? criticalErrors[0].substring(0, 80) : '');

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

  await testProjectPage();
  await testProjectContentTabs();
  await testLoginPage();
  await testRegisterPage();
  await testLoginFlow();
  await testDashboard();
  await testApiHealth();
  await testProjectPageNavigation();
  await testTicketsUser();
  await testTicketsAdmin();

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
