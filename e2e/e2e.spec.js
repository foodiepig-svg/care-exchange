import { test, expect } from '@playwright/test'

const BASE = 'https://care-exchange.onrender.com'
const DEMO_PART = 'participant@demo.com'
const DEMO_COORD = 'coordinator@demo.com'
const DEMO_PROVIDER = 'provider@demo.com'
const DEMO_PASS = 'Demo@1234'

test.describe('Care Exchange E2E', { timeout: 60000 }, () => {

  test('1 - Landing page loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: /care that connects/i })).toBeVisible({ timeout: 15000 })
  })

  test('2 - Participant pages all load', async ({ browser }) => {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await p.locator('input[type="email"]').fill(DEMO_PART)
    await p.locator('input[type="password"]').fill(DEMO_PASS)
    await p.click('button[type="submit"]')
    await p.waitForURL(/dashboard/, { timeout: 30000 })
    await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
    const pages = ['care-team', 'referrals', 'messages', 'documents', 'consent']
    for (const pg of pages) {
      await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)
      const html = await p.locator('body').innerHTML()
      expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
    }
    await ctx.close()
  })

  test('3 - Coordinator pages load', async ({ browser }) => {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await p.locator('input[type="email"]').fill(DEMO_COORD)
    await p.locator('input[type="password"]').fill(DEMO_PASS)
    await p.click('button[type="submit"]')
    await p.waitForURL(/dashboard/, { timeout: 30000 })
    await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
    for (const pg of ['referrals', 'messages']) {
      await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)
      const html = await p.locator('body').innerHTML()
      expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
    }
    await ctx.close()
  })

  test('4 - Provider pages load', async ({ browser }) => {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await p.locator('input[type="email"]').fill(DEMO_PROVIDER)
    await p.locator('input[type="password"]').fill(DEMO_PASS)
    await p.click('button[type="submit"]')
    await p.waitForURL(/dashboard/, { timeout: 30000 })
    await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
    for (const pg of ['referrals', 'updates']) {
      await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
      await p.waitForTimeout(1000)
      const html = await p.locator('body').innerHTML()
      expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
    }
    await ctx.close()
  })
})
