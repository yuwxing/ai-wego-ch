import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('console', msg => console.log('CONSOLE', msg.type() + ':', msg.text()));

await page.goto('http://localhost:5173/admin/listening-speaking', { waitUntil: 'load', timeout: 10000 });
await page.waitForTimeout(2000);

// Click generate button
await page.getByText('一键生成听说训练题').click();
await page.waitForTimeout(2000);

// Check for toast elements
const toastCount = await page.locator('[class*="go4"]').count();
console.log('Toast containers:', toastCount);

for (let i = 0; i < toastCount; i++) {
  const text = await page.locator('[class*="go4"]').nth(i).textContent();
  console.log('Toast ' + i + ':', text?.trim().substring(0, 100));
}

// Also check body for error text
const bodyText = await page.locator('body').innerText();
const hasError = bodyText.includes('API密钥') || bodyText.includes('请先');
console.log('Error text found in body:', hasError);

await page.close();
await browser.close();
