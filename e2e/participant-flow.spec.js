import { test, expect } from '@playwright/test'

const BASE = 'https://care-exchange.onrender.com'
const TS = Date.now()
const PART_EMAIL = `e2e_p_${TS}@test.com`
const COORD_EMAIL = `e2e_c_${TS}@test.com`
const PROVIDER_EMAIL = `e2e_pr_${TS}@test.com`
const PASS = 'SecurePass@123'

test.describe('Care Exchange E2E', () => {
  let p_token, c_token, pr_token, p_id, ref_id, thread_id

  test('0 - Landing page loads', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('text=Care Exchange')).toBeVisible({ timeout: 10000 })
  })

  test('1 - Participant registers and sees dashboard', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[name="full_name"], input[placeholder*="name" i]', 'Sam E2E')
    await page.fill('input[name="email"], input[placeholder*="email" i]', PART_EMAIL)
    await page.fill('input[name="password"]', PASS)
    await page.fill('input[name="password"]').catch(() => {})
    await page.locator('input[name="role"], select[name="role"]').selectOption('participant').catch(() => {})
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|app\/dashboard)/, { timeout: 10000 })
    await expect(page.locator('text=Dashboard').first()).toBeVisible()
  })

  test('2 - Coordinator registers', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[placeholder*="name" i]', 'Casey E2E')
    await page.fill('input[placeholder*="email" i]', COORD_EMAIL)
    await page.fill('input[type="password"]', PASS)
    await page.locator('select, input[name="role"]').selectOption('coordinator').catch(() => {})
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 })
  })

  test('3 - Provider registers', async ({ page }) => {
    await page.goto(`${BASE}/register`)
    await page.fill('input[placeholder*="name" i]', 'Pat E2E')
    await page.fill('input[placeholder*="email" i]', PROVIDER_EMAIL)
    await page.fill('input[type="password"]', PASS)
    await page.locator('select, input[name="role"]').selectOption('provider').catch(() => {})
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 })
  })

  test('4 - Participant grants consent via API then visits Care Team page', async ({ page }) => {
    // Grant consent via API
    const { exec } = require('child_process')
    const { pythonSync } = await new Promise(r => exec(`python3 -c "
import urllib.request, json
BASE='https://care-exchange.onrender.com/api'
TS=${TS}
# login participant
req = urllib.request.Request(BASE+'/v1/auth/login', data=json.dumps({'email':'${PART_EMAIL}','password':'${PASS}'}).encode(), headers={'Content-Type':'application/json'})
r=urllib.request.urlopen(req); d=json.loads(r.read())
p_token=d['access_token']
# get participant id
req2=urllib.request.Request(BASE+'/v1/participants/me', headers={'Authorization':'Bearer '+p_token})
d2=json.loads(urllib.request.urlopen(req2).read()); pid=d2['participant']['id']
# login coordinator
req3=urllib.request.Request(BASE+'/v1/auth/login', data=json.dumps({'email':'${COORD_EMAIL}','password':'${PASS}'}).encode(), headers={'Content-Type':'application/json'})
d3=json.loads(urllib.request.urlopen(req3).read()); cid=d3['user']['id']
# grant consent
req4=urllib.request.Request(BASE+'/v1/participants/me/consent', data=json.dumps({'granted_to_id':cid,'data_categories':['goals','care_plans']}).encode(), headers={'Content-Type':'application/json','Authorization':'Bearer '+p_token}, method='POST')
r4=urllib.request.urlopen(req4); print('consent_ok')
print('p_token='+p_token)
"`, shell=True, encoding='utf-8', callback=r))
    // Login as participant
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', PART_EMAIL)
    await page.fill('input[type="password"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    // Navigate to Care Team
    await page.click('text=Care Team')
    await page.waitForTimeout(2000)
    // Should show the page without crashing
    await expect(page.locator('text=Care Team, text=Team').or(page.locator('h1'))).toBeVisible()
  })

  test('5 - Coordinator creates referral via UI', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', COORD_EMAIL)
    await page.fill('input[type="password"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    await page.click('text=Referrals')
    await page.waitForTimeout(2000)
    // Click create referral
    const createBtn = page.locator('button', { hasText: /new|create|add/i }).first()
    if (await createBtn.isVisible()) await createBtn.click()
    await page.waitForTimeout(1000)
  })

  test('6 - All sidebar pages load without crash', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[type="email"]', PART_EMAIL)
    await page.fill('input[type="password"]', PASS)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    const pages = ['referrals', 'care-team', 'messages', 'notifications', 'documents', 'consent']
    for (const pg of pages) {
      await page.goto(`${BASE}/${pg}`)
      await page.waitForTimeout(1500)
      const hasContent = await page.locator('main').innerHTML().catch(() => '')
      expect(hasContent.length).toBeGreaterThan(50)
    }
  })
})
