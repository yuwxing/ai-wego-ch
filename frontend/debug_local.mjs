import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
page.on('console', msg => logs.push('CONSOLE ' + msg.type() + ': ' + msg.text()));
page.on('pageerror', err => logs.push('PAGE_ERR: ' + err.message));
page.on('response', res => {
  if (res.status() >= 400) logs.push('HTTP ' + res.status() + ': ' + res.url().substring(0, 100));
});

await page.goto('http://localhost:5173/admin/listening-speaking', { waitUntil: 'networkidle', timeout: 10000 });
await page.waitForTimeout(2000);

logs.push('--- Checking page state ---');
// Check if localStorage has the key
const hasKey = await page.evaluate(() => localStorage.getItem('deepseek_api_key'));
logs.push('localStorage deepseek_api_key: ' + (hasKey ? 'EXISTS' : 'NULL'));

// Check button state
const btnText = await page.getByText('一键生成听说训练题').textContent();
logs.push('Button text: ' + btnText);

// Check if we can see buttons
const btnCount = await page.locator('button').count();
logs.push('Button count: ' + btnCount);

// Try clicking
logs.push('--- Clicking generate ---');
await page.getByText('一键生成听说训练题').click();
await page.waitForTimeout(3000);

// Check for any toast/alert lines in the page
const bodyText = await page.locator('body').innerText();
const interesting = bodyText.split('\n').filter(l => 
  l.includes('API') || l.includes('密钥') || l.includes('错误') || 
  l.includes('失败') || l.includes('请先') || l.includes('生成中')
);
interesting.forEach(l => logs.push('BODY: ' + l.trim()));

// Check button state after click
const btnText2 = await page.getByText('一键生成听说训练题').textContent();
logs.push('Button text after click: ' + btnText2);

logs.forEach(l => console.log(l));
console.log('---END---');
await browser.close();
