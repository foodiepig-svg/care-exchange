const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const p = await context.newPage();

  const errors = [];
  const responses = [];
  p.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  p.on('response', r => { if (r.url().includes('/api')) responses.push(`${r.status()} ${r.url()}`); });

  await p.goto('https://care-exchange.onrender.com/login', { waitUntil: 'networkidle' });
  await p.fill('input[type="email"]', 'participant@demo.com');
  await p.fill('input[type="password"]', 'Demo@1234');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(4000);

  await p.evaluate(() => { window.location.href = '/app/support'; });
  await p.waitForTimeout(5000);

  console.log('URL:', p.url());

  // Check page content
  const h1s = await p.locator('h1').allTextContents();
  console.log('H1s:', JSON.stringify(h1s));

  const buttons = await p.locator('button').allTextContents();
  console.log('Buttons:', JSON.stringify(buttons));

  // Click New Ticket
  const newTicketBtn = p.locator('button:has-text("New Ticket")');
  if (await newTicketBtn.count() > 0) {
    console.log('Clicking New Ticket...');
    await newTicketBtn.click();
    await p.waitForTimeout(500);

    // Check form elements
    const inputs = await p.locator('input').all();
    const textareas = await p.locator('textarea').all();
    const formButtons = await p.locator('button').allTextContents();
    console.log('Inputs after click:', inputs.map(i => i.getAttribute('type') + ' ' + i.getAttribute('placeholder')));
    console.log('Textareas:', textareas.map(t => t.getAttribute('placeholder')));
    console.log('Buttons after click:', JSON.stringify(formButtons));

    // Fill form
    const titleInput = p.locator('input[maxlength="200"]').first();
    const descInput = p.locator('textarea').first();
    if (await titleInput.count() > 0) {
      await titleInput.fill('E2E Test: Login button alignment issue');
      console.log('Title filled');
    }
    if (await descInput.count() > 0) {
      await descInput.fill('The login button on mobile overlaps with the cookie banner.');
      console.log('Desc filled');
    }

    // Check submit button
    const submitBtn = p.locator('button:has-text("Submit Ticket")');
    const submitBtn2 = p.locator('button:has-text("Submit")');
    console.log('Submit Ticket button count:', await submitBtn.count());
    console.log('Submit button count:', await submitBtn2.count());

    // Get responses before submit
    const preSubmitResponses = responses.length;
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    } else if (await submitBtn2.count() > 0) {
      await submitBtn2.click();
    }

    await p.waitForTimeout(3000);

    const newResponses = responses.slice(preSubmitResponses);
    console.log('\nNew API responses after submit:');
    newResponses.forEach(r => console.log(' ', r));

    // Check for error messages
    const errorMsgs = await p.locator('.bg-red-50, .text-red-').allTextContents();
    console.log('\nError messages:', JSON.stringify(errorMsgs));

    // Check for success messages
    const successMsgs = await p.locator('text=Ticket submitted, text=Success, text=success').allTextContents();
    console.log('Success messages:', JSON.stringify(successMsgs));

    // Check page state after submit
    const currentUrl = p.url();
    console.log('\nURL after submit:', currentUrl);
    const currentH1s = await p.locator('h1').allTextContents();
    console.log('H1s after submit:', JSON.stringify(currentH1s));
  }

  console.log('\nErrors:', errors);
  await browser.close();
})();
