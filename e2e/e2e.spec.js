import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

const env = Object.fromEntries(
  readFileSync(join(__dirname, '.env'), 'utf8').trim().split('\n').map(l => l.split('='))
)

const BASE = 'https://care-exchange.onrender.com'
const { PART_EMAIL, COORD_EMAIL, PROVIDER_EMAIL, PASS } = env

test.describe('Care Exchange E2E', { timeout: 60000 }, () => {

  test('1 - Landing page loads', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { name: /care that connects/i })).toBeVisible({ timeout: 15000 })
  })

  test('2 - Participant pages all load', async ({ browser }) => {
    const ctx = await browser.newContext()
    const p = await ctx.newPage()
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
    await p.locator('input[type="email"]').fill(PART_EMAIL)
    await p.locator('input[type="password"]').fill(PASS)
    await p.click('button[type="submit"]')
    await p.waitForURL(/dashboard/, { timeout: 30000 })
    // Wait for React to finish hydrating
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
    await p.locator('input[type="email"]').fill(COORD_EMAIL)
    await p.locator('input[type="password"]').fill(PASS)
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
    await p.locator('input[type="email"]').fill(PROVIDER_EMAIL)
    await p.locator('input[type="password"]').fill(PASS)
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
