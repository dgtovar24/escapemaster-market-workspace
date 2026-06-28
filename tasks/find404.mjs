import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

// Capture ALL network requests including failed ones
const allRequests = [];
page.on('requestfinished', async req => {
  const res = await req.response();
  if (res && res.status() >= 400) {
    allRequests.push({ url: req.url(), status: res.status(), type: req.resourceType() });
  }
});
page.on('requestfailed', req => {
  allRequests.push({ url: req.url(), status: 'FAILED', type: req.resourceType(), err: req.failure()?.errorText });
});

await page.goto('https://escapemaster.es/es/', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000);
console.log('Failed/error requests:');
allRequests.forEach(r => console.log(`  [${r.status}] ${r.type} → ${r.url}`));
await browser.close();
