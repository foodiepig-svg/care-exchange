const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  const errors = [];
  const responses = [];
  const consoleMessages = [];

  p.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'error') errors.push(msg.text());
  });
  p.on('response', r => {
    responses.push(`${r.status()} ${r.url()}`);
  });
  p.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);

  console.log('After login URL:', p.url());
  console.log('After login title:', await p.title());

  // Check localStorage token
  const token = await p.evaluate(() => localStorage.getItem('access_token') || localStorage.getItem('token'));
  console.log('Token exists:', !!token, token ? token.substring(0, 20) + '...' : 'none');

  // Now goto dashboard
  console.log('\n--- Navigating to /dashboard ---');
  const preResponses = responses.length;
  const preErrors = errors.length;

  await p.goto('https://care-exchange.onrender.com/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Dashboard URL:', p.url());
  console.log('Dashboard title:', await p.title());

  const newResponses = responses.slice(preResponses);
  const newErrors = errors.slice(preErrors);
  console.log('\nNew API responses:');
  newResponses.forEach(r => console.log(' ', r));
  console.log('\nNew errors:');
  newErrors.forEach(e => console.log(' ', e));
  console.log('\nAll console messages:');
  consoleMessages.forEach(m => console.log(' ', m));

  // Get body text
  const bodyText = await p.locator('body').textContent();
  console.log('\nBody preview:', bodyText.substring(0, 200).replace(/\n/g, ' '));

  await browser.close();
})();
