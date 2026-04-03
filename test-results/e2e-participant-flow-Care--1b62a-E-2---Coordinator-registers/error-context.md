# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/participant-flow.spec.js >> Care Exchange E2E >> 2 - Coordinator registers
- Location: e2e/participant-flow.spec.js:30:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="name" i]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]: "Error: [Errno 2] No such file or directory: '/app/workspace/dist/index.html'"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const BASE = 'https://care-exchange.onrender.com'
  4   | const TS = Date.now()
  5   | const PART_EMAIL = `e2e_p_${TS}@test.com`
  6   | const COORD_EMAIL = `e2e_c_${TS}@test.com`
  7   | const PROVIDER_EMAIL = `e2e_pr_${TS}@test.com`
  8   | const PASS = 'SecurePass@123'
  9   | 
  10  | test.describe('Care Exchange E2E', () => {
  11  |   let p_token, c_token, pr_token, p_id, ref_id, thread_id
  12  | 
  13  |   test('0 - Landing page loads', async ({ page }) => {
  14  |     await page.goto(BASE)
  15  |     await expect(page.locator('text=Care Exchange')).toBeVisible({ timeout: 10000 })
  16  |   })
  17  | 
  18  |   test('1 - Participant registers and sees dashboard', async ({ page }) => {
  19  |     await page.goto(`${BASE}/register`)
  20  |     await page.fill('input[name="full_name"], input[placeholder*="name" i]', 'Sam E2E')
  21  |     await page.fill('input[name="email"], input[placeholder*="email" i]', PART_EMAIL)
  22  |     await page.fill('input[name="password"]', PASS)
  23  |     await page.fill('input[name="password"]').catch(() => {})
  24  |     await page.locator('input[name="role"], select[name="role"]').selectOption('participant').catch(() => {})
  25  |     await page.click('button[type="submit"]')
  26  |     await page.waitForURL(/\/(dashboard|app\/dashboard)/, { timeout: 10000 })
  27  |     await expect(page.locator('text=Dashboard').first()).toBeVisible()
  28  |   })
  29  | 
  30  |   test('2 - Coordinator registers', async ({ page }) => {
  31  |     await page.goto(`${BASE}/register`)
> 32  |     await page.fill('input[placeholder*="name" i]', 'Casey E2E')
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  33  |     await page.fill('input[placeholder*="email" i]', COORD_EMAIL)
  34  |     await page.fill('input[type="password"]', PASS)
  35  |     await page.locator('select, input[name="role"]').selectOption('coordinator').catch(() => {})
  36  |     await page.click('button[type="submit"]')
  37  |     await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 })
  38  |   })
  39  | 
  40  |   test('3 - Provider registers', async ({ page }) => {
  41  |     await page.goto(`${BASE}/register`)
  42  |     await page.fill('input[placeholder*="name" i]', 'Pat E2E')
  43  |     await page.fill('input[placeholder*="email" i]', PROVIDER_EMAIL)
  44  |     await page.fill('input[type="password"]', PASS)
  45  |     await page.locator('select, input[name="role"]').selectOption('provider').catch(() => {})
  46  |     await page.click('button[type="submit"]')
  47  |     await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 })
  48  |   })
  49  | 
  50  |   test('4 - Participant grants consent via API then visits Care Team page', async ({ page }) => {
  51  |     // Grant consent via API
  52  |     const { exec } = require('child_process')
  53  |     const { pythonSync } = await new Promise(r => exec(`python3 -c "
  54  | import urllib.request, json
  55  | BASE='https://care-exchange.onrender.com/api'
  56  | TS=${TS}
  57  | # login participant
  58  | req = urllib.request.Request(BASE+'/v1/auth/login', data=json.dumps({'email':'${PART_EMAIL}','password':'${PASS}'}).encode(), headers={'Content-Type':'application/json'})
  59  | r=urllib.request.urlopen(req); d=json.loads(r.read())
  60  | p_token=d['access_token']
  61  | # get participant id
  62  | req2=urllib.request.Request(BASE+'/v1/participants/me', headers={'Authorization':'Bearer '+p_token})
  63  | d2=json.loads(urllib.request.urlopen(req2).read()); pid=d2['participant']['id']
  64  | # login coordinator
  65  | req3=urllib.request.Request(BASE+'/v1/auth/login', data=json.dumps({'email':'${COORD_EMAIL}','password':'${PASS}'}).encode(), headers={'Content-Type':'application/json'})
  66  | d3=json.loads(urllib.request.urlopen(req3).read()); cid=d3['user']['id']
  67  | # grant consent
  68  | req4=urllib.request.Request(BASE+'/v1/participants/me/consent', data=json.dumps({'granted_to_id':cid,'data_categories':['goals','care_plans']}).encode(), headers={'Content-Type':'application/json','Authorization':'Bearer '+p_token}, method='POST')
  69  | r4=urllib.request.urlopen(req4); print('consent_ok')
  70  | print('p_token='+p_token)
  71  | "`, shell=True, encoding='utf-8', callback=r))
  72  |     // Login as participant
  73  |     await page.goto(`${BASE}/login`)
  74  |     await page.fill('input[type="email"]', PART_EMAIL)
  75  |     await page.fill('input[type="password"]', PASS)
  76  |     await page.click('button[type="submit"]')
  77  |     await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  78  |     // Navigate to Care Team
  79  |     await page.click('text=Care Team')
  80  |     await page.waitForTimeout(2000)
  81  |     // Should show the page without crashing
  82  |     await expect(page.locator('text=Care Team, text=Team').or(page.locator('h1'))).toBeVisible()
  83  |   })
  84  | 
  85  |   test('5 - Coordinator creates referral via UI', async ({ page }) => {
  86  |     await page.goto(`${BASE}/login`)
  87  |     await page.fill('input[type="email"]', COORD_EMAIL)
  88  |     await page.fill('input[type="password"]', PASS)
  89  |     await page.click('button[type="submit"]')
  90  |     await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  91  |     await page.click('text=Referrals')
  92  |     await page.waitForTimeout(2000)
  93  |     // Click create referral
  94  |     const createBtn = page.locator('button', { hasText: /new|create|add/i }).first()
  95  |     if (await createBtn.isVisible()) await createBtn.click()
  96  |     await page.waitForTimeout(1000)
  97  |   })
  98  | 
  99  |   test('6 - All sidebar pages load without crash', async ({ page }) => {
  100 |     await page.goto(`${BASE}/login`)
  101 |     await page.fill('input[type="email"]', PART_EMAIL)
  102 |     await page.fill('input[type="password"]', PASS)
  103 |     await page.click('button[type="submit"]')
  104 |     await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  105 | 
  106 |     const pages = ['referrals', 'care-team', 'messages', 'notifications', 'documents', 'consent']
  107 |     for (const pg of pages) {
  108 |       await page.goto(`${BASE}/${pg}`)
  109 |       await page.waitForTimeout(1500)
  110 |       const hasContent = await page.locator('main').innerHTML().catch(() => '')
  111 |       expect(hasContent.length).toBeGreaterThan(50)
  112 |     }
  113 |   })
  114 | })
  115 | 
```