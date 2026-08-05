import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
page.on('console', msg => console.log('CONSOLE', msg.type() + ':', msg.text()));

await page.goto('http://localhost:5173/admin/listening-speaking', { waitUntil: 'load', timeout: 10000 });
await page.waitForTimeout(2000);

const result = await page.evaluate(() => {
  const logs = [];
  
  // Check if toast container exists
  const toastContainers = document.querySelectorAll('[class*="go4"], [class*="Toast"], [role="alert"]');
  logs.push('Toast containers: ' + toastContainers.length);
  
  // Check localStorage
  logs.push('deepseek_api_key: ' + localStorage.getItem('deepseek_api_key'));
  
  // Try to catch error when clicking
  const btn = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.includes('一键生成'));
  
  if (btn) {
    logs.push('Button found, dispatching click...');
    
    // Wrap click in try-catch
    try {
      btn.click();
      logs.push('Click executed');
    } catch (e) {
      logs.push('Click error: ' + e.message);
    }
    
    // Check again after a short delay
    return new Promise(resolve => {
      setTimeout(() => {
        logs.push('After 2s:');
        logs.push('deepseek_api_key: ' + localStorage.getItem('deepseek_api_key'));
        logs.push('Button disabled: ' + btn.disabled);
        logs.push('Button text: ' + btn.textContent?.trim().substring(0, 25));
        
        // Check if toast appeared  
        const toasts = document.querySelectorAll('[class*="go4"]');
        logs.push('Toast containers count: ' + toasts.length);
        toasts.forEach((t, i) => logs.push('Toast ' + i + ': ' + t.textContent?.trim().substring(0, 50)));
        
        // Get full page text for debugging
        const bodyText = document.body.innerText;
        logs.push('Body starts with: ' + bodyText.substring(0, 100));
        logs.push('Has API密钥: ' + bodyText.includes('API密钥'));
        logs.push('Has 生成: ' + bodyText.includes('生成失败'));
        logs.push('Has 请先: ' + bodyText.includes('请先'));
        
        resolve(logs.join('\n'));
      }, 2000);
    });
  }
  return 'Button not found';
});

console.log(result);
await page.close();
await browser.close();
