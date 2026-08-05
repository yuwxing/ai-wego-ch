import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
page.on('console', msg => {
  const t = msg.type();
  if (t === 'error' || t === 'warning') console.log('CONSOLE', t + ':', msg.text());
});

await page.goto('http://localhost:5173/admin/listening-speaking', { waitUntil: 'load', timeout: 10000 });
await page.waitForTimeout(2000);

// Try to trigger the generate function in multiple ways
const result = await page.evaluate(() => {
  // Check React internals
  const root = document.getElementById('root');
  const fiberKey = Object.keys(root).find(k => k.startsWith('__reactFiber'));
  console.log('Fiber key:', fiberKey);
  
  // Try to find the button and click
  const buttons = Array.from(document.querySelectorAll('button'));
  const genBtn = buttons.find(b => b.textContent.includes('一键生成'));
  if (!genBtn) return 'No generate button found';
  
  console.log('Found generate button');
  console.log('Button disabled:', genBtn.disabled);
  
  // Click it
  genBtn.click();
  
  // Check state after 1 second
  return new Promise(resolve => {
    setTimeout(() => {
      const btnAfter = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('一键生成'));
      resolve({
        disabled: btnAfter?.disabled,
        text: btnAfter?.textContent?.trim().substring(0, 20),
        buttons: document.querySelectorAll('button').length
      });
    }, 1000);
  });
});

console.log('Result:', JSON.stringify(result));
await page.close();
await browser.close();
