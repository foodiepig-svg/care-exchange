# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/participant-flow.spec.js >> Care Exchange E2E >> 6 - All sidebar pages load without crash
- Location: e2e/participant-flow.spec.js:68:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 50
Received:   0
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "Care Exchange" [level=1] [ref=e10]
    - paragraph [ref=e11]: Sign in to your account
  - generic [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - generic [ref=e15]: Email
        - generic [ref=e16]:
          - img [ref=e17]
          - textbox "you@example.com" [ref=e20]
      - generic [ref=e21]:
        - generic [ref=e22]: Password
        - generic [ref=e23]:
          - img [ref=e24]
          - textbox "••••••••" [ref=e27]
      - button "Sign in" [ref=e28] [cursor=pointer]
    - generic [ref=e29]:
      - link "Forgot password?" [ref=e30] [cursor=pointer]:
        - /url: /forgot-password
      - link "Create account" [ref=e31] [cursor=pointer]:
        - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const BASE = 'https://care-exchange.onrender.com'
  4  | const TS = Date.now()
  5  | const PART_EMAIL = `e2e_p_${TS}@test.com`
  6  | const COORD_EMAIL = `e2e_c_${TS}@test.com`
  7  | const PROVIDER_EMAIL = `e2e_pr_${TS}@test.com`
  8  | const PASS = 'SecurePass@123'
  9  | 
  10 | test.describe('Care Exchange E2E', () => {
  11 |   test('0 - Landing page loads', async ({ page }) => {
  12 |     await page.goto(BASE)
  13 |     await expect(page.locator('h1, [role="banner"]').first()).toBeVisible({ timeout: 15000 })
  14 |   })
  15 | 
  16 |   test('1 - Participant registers and sees dashboard', async ({ page }) => {
  17 |     await page.goto(`${BASE}/register`)
  18 |     // Use placeholder text to find inputs
  19 |     await page.fill('input[placeholder="Jane Smith"]', 'Sam E2E')
  20 |     await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
  21 |     await page.fill('input[placeholder="Min. 8 characters"]', PASS)
  22 |     // Select participant role
  23 |     await page.locator('input[type="radio"][value="participant"]').check()
  24 |     await page.click('button[type="submit"]')
  25 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
  26 |     await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  27 |   })
  28 | 
  29 |   test('2 - Coordinator registers', async ({ page }) => {
  30 |     await page.goto(`${BASE}/register`)
  31 |     await page.fill('input[placeholder="Jane Smith"]', 'Casey E2E')
  32 |     await page.fill('input[placeholder="you@example.com"]', COORD_EMAIL)
  33 |     await page.fill('input[placeholder="Min. 8 characters"]', PASS)
  34 |     await page.locator('input[type="radio"][value="coordinator"]').check()
  35 |     await page.click('button[type="submit"]')
  36 |     await page.waitForURL(/dashboard|login/, { timeout: 15000 })
  37 |   })
  38 | 
  39 |   test('3 - Provider registers', async ({ page }) => {
  40 |     await page.goto(`${BASE}/register`)
  41 |     await page.fill('input[placeholder="Jane Smith"]', 'Pat E2E')
  42 |     await page.fill('input[placeholder="you@example.com"]', PROVIDER_EMAIL)
  43 |     await page.fill('input[placeholder="Min. 8 characters"]', PASS)
  44 |     await page.locator('input[type="radio"][value="provider"]').check()
  45 |     await page.click('button[type="submit"]')
  46 |     await page.waitForURL(/dashboard|login/, { timeout: 15000 })
  47 |   })
  48 | 
  49 |   test('4 - Participant logs in and navigates', async ({ page }) => {
  50 |     await page.goto(`${BASE}/login`)
  51 |     await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
  52 |     await page.fill('input[placeholder="••••••••"]', PASS)
  53 |     await page.click('button[type="submit"]')
  54 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
  55 |     await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 5000 })
  56 |   })
  57 | 
  58 |   test('5 - Coordinator logs in and creates referral', async ({ page }) => {
  59 |     await page.goto(`${BASE}/login`)
  60 |     await page.fill('input[placeholder="you@example.com"]', COORD_EMAIL)
  61 |     await page.fill('input[placeholder="••••••••"]', PASS)
  62 |     await page.click('button[type="submit"]')
  63 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
  64 |     await page.click('text=Referrals')
  65 |     await page.waitForTimeout(2000)
  66 |   })
  67 | 
  68 |   test('6 - All sidebar pages load without crash', async ({ page }) => {
  69 |     await page.goto(`${BASE}/login`)
  70 |     await page.fill('input[placeholder="you@example.com"]', PART_EMAIL)
  71 |     await page.fill('input[placeholder="••••••••"]', PASS)
  72 |     await page.click('button[type="submit"]')
  73 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
  74 | 
  75 |     const pages = ['referrals', 'care-team', 'messages', 'notifications', 'documents', 'consent']
  76 |     for (const pg of pages) {
  77 |       await page.goto(`${BASE}/${pg}`)
  78 |       await page.waitForTimeout(1500)
  79 |       const hasContent = await page.locator('main').innerHTML().catch(() => '')
> 80 |       expect(hasContent.length).toBeGreaterThan(50)
     |                                 ^ Error: expect(received).toBeGreaterThan(expected)
  81 |     }
  82 |   })
  83 | })
  84 | 
```