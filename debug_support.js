const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  const errors = [];
  const responses = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  p.on('response', r => { if (r.url().includes('/api')) responses.push(r.status() + ' ' + r.url()); });

  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(3000);

  console.log('After login URL:', p.url());

  await p.goto('https://care-exchange.onrender.com/app/support', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Support URL:', p.url());

  const bodyText = await p.locator('body').textContent();
  console.log('Body preview:', bodyText.substring(0, 300).replace(/\n/g, ' '));

  const h1s = await p.locator('h1').allTextContents();
  console.log('H1s:', JSON.stringify(h1s));

  const buttons = await p.locator('button').allTextContents();
  console.log('Buttons:', JSON.stringify(buttons));

  console.log('Errors:', JSON.stringify(errors));
  console.log('API responses:', JSON.stringify(responses));

  await browser.close();
})();
