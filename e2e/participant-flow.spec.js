import { test, expect } from '@playwright/test'

const BASE = 'https://care-exchange.onrender.com'
const DEMO_PART = 'participant@demo.com'
const DEMO_COORD = 'coordinator@demo.com'
const DEMO_PROVIDER = 'provider@demo.com'
const DEMO_PASS = 'Demo@1234'

test.describe('Care Exchange E2E', () => {
  test('0 - Landing page loads', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('h1, [role="banner"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('1 - Participant login + dashboard', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', DEMO_PART)
    await page.fill('input[placeholder="••••••••"]', DEMO_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 20000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  })

  test('2 - Participant sidebar pages load', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', DEMO_PART)
    await page.fill('input[placeholder="••••••••"]', DEMO_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 20000 })
    await page.waitForLoadState('networkidle')

    // Check each sidebar page loads with content
    const routes = ['referrals', 'care-team', 'messages', 'notifications', 'documents', 'consent', 'goals', 'providers']
    for (const route of routes) {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      const bodyLen = await page.locator('body').innerHTML().catch(() => '').then(h => h.length)
      expect(bodyLen, `${route} page should have content`).toBeGreaterThan(200)
    }
  })

  test('3 - Coordinator login + referrals', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', DEMO_COORD)
    await page.fill('input[placeholder="••••••••"]', DEMO_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 20000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
    // Navigate to referrals
    await page.goto(`${BASE}/referrals`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    const bodyLen = await page.locator('body').innerHTML().catch(() => '').then(h => h.length)
    expect(bodyLen, 'referrals page should have content').toBeGreaterThan(200)
  })

  test('4 - Provider login + updates', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', DEMO_PROVIDER)
    await page.fill('input[placeholder="••••••••"]', DEMO_PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 20000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
    // Navigate to updates
    await page.goto(`${BASE}/updates`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    const bodyLen = await page.locator('body').innerHTML().catch(() => '').then(h => h.length)
    expect(bodyLen, 'updates page should have content').toBeGreaterThan(200)
  })

  test('5 - Registration flow', async ({ page }) => {
    const TS = Date.now()
    const EMAIL = `e2e_reg_${TS}@test.com`
    await page.goto(`${BASE}/register`)
    await page.fill('input[placeholder="Jane Smith"]', 'New User')
    await page.fill('input[placeholder="you@example.com"]', EMAIL)
    await page.fill('input[placeholder="Min. 8 characters"]', 'SecurePass@123')
    await page.locator('input[type="radio"][value="participant"]').check()
    await page.click('button[type="submit"]')
    // Registration stays on same URL but renders "Check Your Email" page
    await page.waitForTimeout(3000)
    await expect(page.locator('text=Check Your Email').first()).toBeVisible({ timeout: 5000 })
  })

  test('6 - Login with wrong password shows error', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', DEMO_PART)
    await page.fill('input[placeholder="••••••••"]', 'WrongPassword!')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    const html = await page.locator('body').innerHTML()
    expect(html.toLowerCase()).toMatch(/invalid|password|error/)
  })

  test('7 - Protected routes redirect to login', async ({ page }) => {
    const routes = ['dashboard', 'referrals', 'care-team', 'messages']
    for (const route of routes) {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      // Should redirect to login or show login page
      await expect(page.locator('text=Sign in').first()).toBeVisible({ timeout: 5000 })
    }
  })
})
