import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const TEST_EMAIL = `testuser_${Date.now()}@gmail.com`;
const TEST_PASSWORD = 'TestEscape2026!';

console.log('Test email:', TEST_EMAIL);

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // mobile

const errors = [];
const networkLogs = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('response', async res => {
  if (res.url().includes('/v1/api/')) {
    try {
      const body = await res.json().catch(() => null);
      networkLogs.push(`${res.status()} ${res.url().replace('https://api.escapemaster.es/v1/api', '')} → ${JSON.stringify(body)}`);
    } catch {}
  }
});
page.on('requestfailed', req => {
  if (req.url().includes('/v1/api/') || req.url().includes('escapemaster')) {
    networkLogs.push(`FAILED: ${req.url()} — ${req.failure()?.errorText}`);
  }
});

await page.goto(`${BASE_URL}/es/register`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reg-01-page.png', fullPage: true });

// Click "Soy Jugador"
const jugadorBtn = page.locator('button:has-text("Soy Jugador")').first();
const count = await jugadorBtn.count();
console.log('Soy Jugador button count:', count);
if (count === 0) {
  console.error('❌ Register form not hydrated');
  console.log('Errors:', errors);
  await browser.close();
  process.exit(1);
}

await jugadorBtn.click();
await page.waitForTimeout(600);

// Fill form
await page.fill('input[placeholder="Juan Pérez"]', 'Test Nuevo Usuario');
await page.fill('input[type="email"]', TEST_EMAIL);
await page.fill('input[placeholder="Minimum 8 caracteres"]', TEST_PASSWORD);

const confirmInput = page.locator('input[placeholder*="Repite"]').first();
if (await confirmInput.count() > 0) await confirmInput.fill(TEST_PASSWORD);

await page.screenshot({ path: 'tasks/user-test-report/screenshots/reg-02-filled.png', fullPage: true });
console.log('Form filled');

// Submit
const submitBtn = page.locator('button:has-text("Registrarse y Enviar Código")').first();
if (await submitBtn.count() === 0) {
  console.error('❌ Submit button not found');
  await browser.close();
  process.exit(1);
}

await submitBtn.click();
await page.waitForTimeout(5000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reg-03-after-submit.png', fullPage: true });

const url = page.url();
console.log('URL after submit:', url);

// Check step 2 (verification)
const step2 = await page.locator('input[placeholder="XXXXXX"]').count();
console.log('Verification step visible:', step2 > 0);

// Check error messages
const allText = await page.textContent('body').catch(() => '');
if (allText.includes('error') || allText.includes('Error') || allText.includes('falló') || allText.includes('failed')) {
  console.log('⚠️  Possible error in page');
}

console.log('\n--- Network logs ---');
networkLogs.forEach(l => console.log(l));
console.log('\n--- Console errors ---');
errors.forEach(l => console.log(l));

await page.waitForTimeout(2000);
await browser.close();
