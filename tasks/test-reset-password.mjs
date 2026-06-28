import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const TEST_EMAIL = 'tovard799@gmail.com';
const RESET_CODE = '439359';
const NEW_PASSWORD = 'TestEscape2026!';

const browser = await chromium.launch({ headless: false, slowMo: 400 });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// Handle native alert() dialog
page.on('dialog', async dialog => {
  console.log('Alert:', dialog.message());
  await dialog.accept();
});

const netLogs = [];
page.on('response', async res => {
  if (res.url().includes('/v1/api/auth/')) {
    const body = await res.json().catch(() => null);
    netLogs.push(`${res.status()} ${res.url().split('/auth/')[1]} → ${JSON.stringify(body)?.substring(0, 120)}`);
  }
});

// ── Ir directamente a reset-password con el email en la URL ──
console.log('\n→ Abriendo página reset-password...');
await page.goto(`${BASE_URL}/es/reset-password?email=${encodeURIComponent(TEST_EMAIL)}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000); // esperar hydration del React island
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-01-page.png', fullPage: true });

// ── PASO 1: Verificar código ──
console.log('\n→ Paso 1: rellenando código...');
const codeInput = page.locator('input[placeholder="123456"]').first();
await codeInput.waitFor({ state: 'visible', timeout: 8000 });
await codeInput.fill(RESET_CODE);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-02-code-filled.png', fullPage: true });

const verifyBtn = page.locator('button:has-text("Verificar Código")').first();
console.log('Verify button found:', await verifyBtn.count() > 0);
await verifyBtn.click();
await page.waitForTimeout(3000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-03-after-verify.png', fullPage: true });

// Check for error
const errorEl = page.locator('.bg-red-50').first();
if (await errorEl.isVisible().catch(() => false)) {
  const errText = await errorEl.textContent();
  console.log('❌ Error:', errText?.trim());
  console.log('Network:', netLogs);
  await browser.close();
  process.exit(1);
}

// ── PASO 2: Nueva contraseña (aparece tras verificar código) ──
console.log('\n→ Paso 2: nueva contraseña...');
const passInput = page.locator('input[type="password"]').first();
await passInput.waitFor({ state: 'visible', timeout: 8000 });

const passInputs = page.locator('input[type="password"]');
const count = await passInputs.count();
console.log('Password inputs:', count);

await passInputs.nth(0).fill(NEW_PASSWORD);
if (count >= 2) await passInputs.nth(1).fill(NEW_PASSWORD);

await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-04-passwords-filled.png', fullPage: true });

const resetBtn = page.locator('button:has-text("Restablecer Contraseña")').first();
console.log('Reset button found:', await resetBtn.count() > 0);
await resetBtn.click();
await page.waitForTimeout(5000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-05-result.png', fullPage: true });

const finalUrl = page.url();
console.log('URL final:', finalUrl);

if (finalUrl.includes('/login')) {
  console.log('✅ Contraseña restablecida — redirigió a login');
} else {
  const body = await page.textContent('body').catch(() => '');
  console.log('Page text snippet:', body.substring(0, 200));
}

// ── Paso 3: Login con la nueva contraseña ──
console.log('\n→ Paso 3: Login con nueva contraseña...');
await page.goto(`${BASE_URL}/es/login`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
await page.fill('#email', TEST_EMAIL);
await page.fill('#password', NEW_PASSWORD);
await page.click('#submitBtn');
await page.waitForTimeout(4000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/reset-06-login-result.png', fullPage: true });

const loginUrl = page.url();
console.log('URL tras login:', loginUrl);
if (loginUrl.includes('/profile')) {
  console.log('✅ Login exitoso tras reset de contraseña');
} else {
  console.log('❌ Login fallido');
}

console.log('\n--- Network logs ---');
netLogs.forEach(l => console.log(' ', l));

await browser.close();
