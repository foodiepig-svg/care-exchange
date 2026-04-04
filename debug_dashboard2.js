const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  const allResponses = [];
  p.on('response', r => { allResponses.push(`${r.status()} ${r.url()}`); });
  const errors = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // Login
  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);
  console.log('After login URL:', p.url());
  const token = await p.evaluate(() => localStorage.getItem('access_token'));
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'NONE');

  // Capture token then manually navigate to dashboard
  const capturedToken = token;

  // Fresh context with the same token
  const context2 = await browser.newContext();
  const p2 = await context2.newPage();
  const responses2 = [];
  p2.on('response', r => { responses2.push(`${r.status()} ${r.url()}`); });
  p2.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // Set token in localStorage before navigating
  await p2.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p2.evaluate((t) => localStorage.setItem('access_token', t), capturedToken);
  await p2.evaluate(() => { window.location.href = '/dashboard'; });
  await p2.waitForTimeout(5000);
  console.log('\nFresh page with token set:');
  console.log('URL:', p2.url());
  console.log('Responses:', responses2.filter(r => r.includes('/api')));

  // Now try the same with React Router navigate
  const p3 = await context.newPage();
  const responses3 = [];
  p3.on('response', r => { responses3.push(`${r.status()} ${r.url()}`); });
  await p3.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p3.fill('input[type="email"]', 'participant@demo.com');
  await p3.fill('input[type="password"]', 'Demo@1234');
  await p3.click('button[type="submit"]');
  await p3.waitForTimeout(4000);
  console.log('\nAfter login (same page):', p3.url());

  // Try clicking a link instead of goto
  const projectLink = p3.locator('a[href="/project"]').first();
  if (await projectLink.count() > 0) {
    console.log('Found project link, clicking...');
    await projectLink.click();
    await p3.waitForTimeout(3000);
    console.log('After clicking project link:', p3.url());
  }

  // Try navigating to /app/support via a link
  const supportLinks = p3.locator('a[href="/app/support"]');
  const supportCount = await supportLinks.count();
  console.log('Support links found:', supportCount);

  await browser.close();
})();
