const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  const allEvents = [];
  p.on('response', r => { allEvents.push(`RESP:${r.status()} ${r.url()}`); });
  p.on('console', msg => { allEvents.push(`CONSOLE:[${msg.type()}] ${msg.text()}`); });
  p.on('pageerror', err => allEvents.push(`PAGEERR: ${err.message}`));

  // Login
  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);
  console.log('1. After login URL:', p.url());

  // Now evaluate to navigate to dashboard
  console.log('2. Setting window.location.href = /dashboard');
  await p.evaluate(() => { window.location.href = '/dashboard'; });
  console.log('3. Immediately after evaluate URL:', p.url());

  // Wait progressively
  for (let i = 1; i <= 5; i++) {
    await p.waitForTimeout(1000);
    console.log(`4. After ${i}s — URL: ${p.url()}, title: ${await p.title()}`);
  }

  // Check all events
  console.log('\nAll events (API calls and console):');
  allEvents.forEach(e => console.log(' ', e));

  // Now try clicking from the dashboard
  if (!p.url().includes('login')) {
    console.log('\n5. Trying to navigate to /app/support via click...');
    // Look for a link to support page
    const supportLink = p.locator('a[href="/app/support"]');
    if (await supportLink.count() > 0) {
      await supportLink.click();
      await p.waitForTimeout(3000);
      console.log('6. After clicking support link URL:', p.url());
    } else {
      console.log('No support link found, trying sidebar...');
      const sidebarLinks = await p.locator('a').allTextContents();
      console.log('All links on page:', sidebarLinks.slice(0, 10));
    }
  }

  await browser.close();
})();
