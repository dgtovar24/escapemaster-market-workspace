import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false, slowMo: 200 });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const netLogs = [];
page.on('response', async res => {
  if (res.url().includes('/v1/api/auth/')) {
    try {
      const body = await res.json().catch(() => null);
      netLogs.push(`${res.status()} ${res.url()} → ${JSON.stringify(body)?.substring(0, 100)}`);
    } catch {}
  }
});
page.on('requestfailed', req => {
  if (req.url().includes('escapemaster') || req.url().includes('localhost')) {
    netLogs.push(`FAILED ${req.url()} → ${req.failure()?.errorText}`);
  }
});

await page.goto('https://escapemaster.es/es/login', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// Try with the exact email from the screenshot (user might have a typo)
const email = 'dzaldivar@ilvsilver.com';
await page.fill('#email', email);
await page.fill('#password', 'TestEscape2026!');
await page.screenshot({ path: 'tasks/user-test-report/screenshots/login-dz-01.png', fullPage: true });

await page.click('#submitBtn');
await page.waitForTimeout(5000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/login-dz-02.png', fullPage: true });

console.log('URL:', page.url());
const errorEl = await page.locator('#errorMsg').isVisible().catch(() => false);
if (errorEl) {
  const errorText = await page.locator('#errorText').textContent().catch(() => '');
  console.log('Error shown:', errorText);
}

console.log('\nNetwork:');
netLogs.forEach(l => console.log(' ', l));

await browser.close();
