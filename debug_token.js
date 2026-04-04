const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);

  const token = await p.evaluate(() => localStorage.getItem('access_token') || localStorage.getItem('token'));
  console.log('Token:', token);

  // Decode JWT payload
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  console.log('JWT payload:', JSON.stringify(payload, null, 2));

  const now = Math.floor(Date.now() / 1000);
  console.log('Current time (unix):', now);
  console.log('Token exp:', payload.exp, '(', new Date(payload.exp * 1000).toISOString(), ')');
  console.log('Token iat:', payload.iat, '(', new Date(payload.iat * 1000).toString(), ')');
  console.log('Time until expiry:', (payload.exp - now), 'seconds');

  await browser.close();
})();
