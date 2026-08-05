import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Listen for network requests
const apiCalls = [];
page.on('request', req => {
  const url = req.url();
  if (url.includes('deepseek') || url.includes('supabase')) {
    apiCalls.push('REQ: ' + req.method() + ' ' + url.substring(0, 100));
  }
});
page.on('response', res => {
  const url = res.url();
  if (url.includes('deepseek') || url.includes('supabase')) {
    apiCalls.push('RES: ' + res.status() + ' ' + url.substring(0, 100));
  }
});
page.on('console', msg => {
  if (msg.type() === 'error') apiCalls.push('CONSOLE_ERR: ' + msg.text());
});

// Set localStorage with a fake API key
await page.goto('https://ai-wego.top/admin/listening-speaking', { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(() => {
  localStorage.setItem('deepseek_api_key', 'sk-test-key-for-debugging');
});
await page.waitForTimeout(500);

// Click generate button
await page.getByText('一键生成听说训练题').click();
await page.waitForTimeout(3000);

// Check what text appeared on the page
const bodyText = await page.locator('body').textContent();
// Find error messages
const lines = bodyText.split('\n').filter(l => 
  l.includes('API') || l.includes('密钥') || l.includes('错误') || 
  l.includes('失败') || l.includes('请先') || l.includes('加载') ||
  l.includes('生成') || l.includes('请选')
);
apiCalls.push('--- FILTERED BODY TEXT ---');
lines.forEach(l => apiCalls.push('BODY: ' + l.trim()));

apiCalls.forEach(l => console.log(l));
console.log('---END---');
await page.screenshot({ path: 'admin_debug.png' });
await browser.close();
