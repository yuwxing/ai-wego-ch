import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
page.on('console', msg => logs.push('CONSOLE ' + msg.type() + ': ' + msg.text()));
page.on('pageerror', err => logs.push('PAGE_ERR: ' + err.message));

await page.goto('https://ai-wego.top/admin/listening-speaking', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);

const genBtn = page.getByText('一键生成听说训练题');
await genBtn.click();
await page.waitForTimeout(2000);

const allText = await page.locator('body').innerText();
allText.split('\n').filter(l => l.includes('API') || l.includes('密钥') || l.includes('错误') || l.includes('失败') || l.includes('加载') || l.includes('生成')).forEach(l => logs.push('TEXT: ' + l.trim()));

logs.forEach(l => console.log(l));
console.log('---END---');
await page.screenshot({ path: 'admin_clicked2.png' });
await browser.close();
