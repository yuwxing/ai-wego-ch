const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'https://team.we-aigo.cn';
const DEST = 'D:\\ai-wego\\dl_all';
const visited = new Set();
const queue = ['/'];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function extractUrls(html, base) {
  const urls = [];
  const regex = /(?:src|href|content)=["']([^"']+)["']/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let u = m[1];
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/')) u = base + u;
    else if (u.startsWith('http')) {}
    else continue;
    try { new URL(u); urls.push(u); } catch {}
  }
  return urls;
}

async function download(url) {
  if (visited.has(url)) return;
  visited.add(url);
  
  const parsed = new URL(url);
  let filePath = path.join(DEST, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  if (filePath.endsWith('/')) filePath = filePath.slice(0, -1);
  if (!path.extname(filePath)) filePath += '.html';
  
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  
  try {
    const res = await fetch(url);
    if (res.status !== 200) return;
    
    const contentType = res.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');
    
    fs.writeFileSync(filePath, res.data);
    console.log('OK:', parsed.pathname);
    
    if (isHtml) {
      const urls = extractUrls(res.data, BASE);
      for (const u of urls) {
        if (u.startsWith(BASE) || u.startsWith('https://team.we-aigo.cn')) {
          await download(u);
        }
      }
    }
  } catch (e) {
    console.log('FAIL:', parsed.pathname, e.message);
  }
}

download(BASE + '/').then(() => console.log('DONE'));
