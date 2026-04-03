# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/e2e.spec.js >> Care Exchange E2E >> 1 - Landing page loads
- Location: e2e/e2e.spec.js:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /care that connects/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /care that connects/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]: "Error: [Errno 2] No such file or directory: '/app/workspace/dist/index.html'"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { readFileSync } from 'fs'
  3  | import { join } from 'path'
  4  | 
  5  | const env = Object.fromEntries(
  6  |   readFileSync(join(__dirname, '.env'), 'utf8').trim().split('\n').map(l => l.split('='))
  7  | )
  8  | 
  9  | const BASE = 'https://care-exchange.onrender.com'
  10 | const { PART_EMAIL, COORD_EMAIL, PROVIDER_EMAIL, PASS } = env
  11 | 
  12 | test.describe('Care Exchange E2E', { timeout: 60000 }, () => {
  13 | 
  14 |   test('1 - Landing page loads', async ({ page }) => {
  15 |     await page.goto(BASE, { waitUntil: 'networkidle' })
> 16 |     await expect(page.getByRole('heading', { name: /care that connects/i })).toBeVisible({ timeout: 15000 })
     |                                                                              ^ Error: expect(locator).toBeVisible() failed
  17 |   })
  18 | 
  19 |   test('2 - Participant pages all load', async ({ browser }) => {
  20 |     const ctx = await browser.newContext()
  21 |     const p = await ctx.newPage()
  22 |     await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  23 |     await p.locator('input[type="email"]').fill(PART_EMAIL)
  24 |     await p.locator('input[type="password"]').fill(PASS)
  25 |     await p.click('button[type="submit"]')
  26 |     await p.waitForURL(/dashboard/, { timeout: 30000 })
  27 |     // Wait for React to finish hydrating
  28 |     await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
  29 |     const pages = ['care-team', 'referrals', 'messages', 'documents', 'consent']
  30 |     for (const pg of pages) {
  31 |       await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
  32 |       await p.waitForTimeout(1000)
  33 |       const html = await p.locator('body').innerHTML()
  34 |       expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
  35 |     }
  36 |     await ctx.close()
  37 |   })
  38 | 
  39 |   test('3 - Coordinator pages load', async ({ browser }) => {
  40 |     const ctx = await browser.newContext()
  41 |     const p = await ctx.newPage()
  42 |     await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  43 |     await p.locator('input[type="email"]').fill(COORD_EMAIL)
  44 |     await p.locator('input[type="password"]').fill(PASS)
  45 |     await p.click('button[type="submit"]')
  46 |     await p.waitForURL(/dashboard/, { timeout: 30000 })
  47 |     await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
  48 |     for (const pg of ['referrals', 'messages']) {
  49 |       await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
  50 |       await p.waitForTimeout(1000)
  51 |       const html = await p.locator('body').innerHTML()
  52 |       expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
  53 |     }
  54 |     await ctx.close()
  55 |   })
  56 | 
  57 |   test('4 - Provider pages load', async ({ browser }) => {
  58 |     const ctx = await browser.newContext()
  59 |     const p = await ctx.newPage()
  60 |     await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  61 |     await p.locator('input[type="email"]').fill(PROVIDER_EMAIL)
  62 |     await p.locator('input[type="password"]').fill(PASS)
  63 |     await p.click('button[type="submit"]')
  64 |     await p.waitForURL(/dashboard/, { timeout: 30000 })
  65 |     await p.waitForFunction(() => document.querySelector('#root')?.children?.length > 0, { timeout: 10000 })
  66 |     for (const pg of ['referrals', 'updates']) {
  67 |       await p.goto(`${BASE}/${pg}`, { waitUntil: 'networkidle' })
  68 |       await p.waitForTimeout(1000)
  69 |       const html = await p.locator('body').innerHTML()
  70 |       expect(html.length, `Page ${pg}`).toBeGreaterThan(100)
  71 |     }
  72 |     await ctx.close()
  73 |   })
  74 | })
  75 | 
```