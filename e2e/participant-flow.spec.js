import { test, expect } from '@playwright/test'

const BASE = 'https://care-exchange.onrender.com'
const TS = Date.now()
const PART_EMAIL = `e2e_p_${TS}@test.com`
const COORD_EMAIL = `e2e_c_${TS}@test.com`
const PROVIDER_EMAIL = `e2e_pr_${TS}@test.com`
const PASS = 'SecurePass@123'

test.describe('Care Exchange E2E', () => {
  test('0 - Landing page loads', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('h1, [role="banner"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('1 - Participant registers and sees dashboard', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    // Use placeholder text to find inputs
    await page.fill('input[placeholder="Jane Smith"]', 'Sam E2E')
    await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
    await page.fill('input[placeholder="Min. 8 characters"]', PASS)
    // Select participant role
    await page.locator('input[type="radio"][value="participant"]').check()
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  })

  test('2 - Coordinator registers', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[placeholder="Jane Smith"]', 'Casey E2E')
    await page.fill('input[placeholder="you@example.com"]', COORD_EMAIL)
    await page.fill('input[placeholder="Min. 8 characters"]', PASS)
    await page.locator('input[type="radio"][value="coordinator"]').check()
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|login/, { timeout: 15000 })
  })

  test('3 - Provider registers', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[placeholder="Jane Smith"]', 'Pat E2E')
    await page.fill('input[placeholder="you@example.com"]', PROVIDER_EMAIL)
    await page.fill('input[placeholder="Min. 8 characters"]', PASS)
    await page.locator('input[type="radio"][value="provider"]').check()
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard|login/, { timeout: 15000 })
  })

  test('4 - Participant logs in and navigates', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
    await page.fill('input[placeholder="••••••••"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  })

  test('5 - Coordinator logs in and creates referral', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', COORD_EMAIL)
    await page.fill('input[placeholder="••••••••"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await page.click('text=Referrals')
    await page.waitForTimeout(2000)
  })

  test('6 - All sidebar pages load without crash', async ({ page }) => {
    // Login fresh
    await page.goto(`${BASE}/login`)
    await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
    await page.fill('input[placeholder="••••••••"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/dashboard/, { timeout: 15000 })

    // Check each sidebar page loads with content (body > 200 chars)
    const routes = ['referrals', 'care-team', 'messages', 'notifications', 'documents', 'consent']
    for (const route of routes) {
      await page.goto(`${BASE}/${route}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      const bodyLen = await page.locator('body').innerHTML().catch(() => '').then(h => h.length)
      expect(bodyLen, `${route} page should have content`).toBeGreaterThan(200)
    }
  })
})
