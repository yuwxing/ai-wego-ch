import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));
page.on('pageerror', err => logs.push('PAGE_ERR: ' + err.message));
page.on('dialog', async dialog => { logs.push('DIALOG: ' + dialog.message()); await dialog.accept(); });

await page.goto('https://ai-wego.top/admin/listening-speaking', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);

// Check all buttons
const buttons = await page.locator('button').all();
for (const b of buttons) {
  const text = await b.textContent();
  logs.push('BUTTON: ' + (text?.trim().substring(0, 40) || ''));
}

// Click the generate button (contains 一键生成)
const genBtn = page.getByText('一键生成');
if (await genBtn.count() > 0) {
  logs.push('FOUND generate button, clicking...');
  await genBtn.click();
  await page.waitForTimeout(5000);
  
  // Check toast
  const bodyText = await page.locator('body').textContent();
  logs.push('BODY_TEXT_SNIPPET: ' + bodyText.substring(bodyText.indexOf('AI'), bodyText.indexOf('AI') + 200));
}

logs.forEach(l => console.log(l));
console.log('---END---');
await page.screenshot({ path: 'admin_result.png' });
await browser.close();
