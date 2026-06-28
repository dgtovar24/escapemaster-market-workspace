import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const EMAIL = 'tovard799@gmail.com';
const PASSWORD = 'TestEscape2026!';
const REPORT = 'tasks/user-test-report/screenshots';

const loginRes = await fetch('https://api.escapemaster.es/v1/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
}).then(r => r.json());

console.log(`✅ Login: ${loginRes.user.email} (${loginRes.user.account_type})`);

const browser = await chromium.launch({ headless: true, slowMo: 100 });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES' });
const page = await ctx.newPage();

await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((d) => {
  localStorage.setItem('em_token', d.token);
  localStorage.setItem('em_user', JSON.stringify(d.user));
}, { token: loginRes.access_token, user: loginRes.user });

// ── SPACING TEST ─────────────────────────────────────────
console.log('\n── Espacio superior (sm:pt-32 fix) ──');
const spacingPages = [
  { path: '/es/profile/edit', name: 'edit' },
  { path: '/es/profile/settings', name: 'settings' },
  { path: '/es/profile/history', name: 'history' },
];
for (const { path, name } of spacingPages) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  // Measure actual top padding of main element
  const topPadding = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? window.getComputedStyle(main).paddingTop : 'no main';
  });
  await page.screenshot({ path: `${REPORT}/spacing-${name}.png`, clip: { x: 0, y: 0, width: 1280, height: 400 } });
  console.log(`  ${name}: padding-top = ${topPadding}`);
}

// ── MODAL TEST ───────────────────────────────────────────
console.log('\n── Modal switch empresa ──');
await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000);

const hasModal = await page.locator('#enterpriseModal').count() > 0;
const hasSwitchBtn = await page.locator('#switchToEnterpriseBtn').isVisible().catch(() => false);
console.log(`  #enterpriseModal en DOM: ${hasModal}`);
console.log(`  #switchToEnterpriseBtn visible: ${hasSwitchBtn}`);

if (hasSwitchBtn) {
  await page.locator('#switchToEnterpriseBtn').click();
  await page.waitForTimeout(600);
  const modalVisible = await page.locator('#enterpriseModal').isVisible();
  console.log(`  Modal abre al clic: ${modalVisible} ${modalVisible ? '✅' : '❌'}`);
  await page.screenshot({ path: `${REPORT}/modal-live.png`, fullPage: false });

  // Cancel
  await page.locator('#enterpriseModalCancel').click();
  await page.waitForTimeout(400);
  const closed = !(await page.locator('#enterpriseModal').isVisible());
  console.log(`  Modal cierra con Cancelar: ${closed} ${closed ? '✅' : '❌'}`);

  // Confirm → test API
  await page.locator('#switchToEnterpriseBtn').click();
  await page.waitForTimeout(400);
  await page.locator('#enterpriseModalConfirm').click();
  await page.waitForTimeout(5000);
  const finalUrl = page.url();
  console.log(`  URL tras confirmar: ${finalUrl}`);
  await page.screenshot({ path: `${REPORT}/modal-confirm-live.png`, fullPage: false });
  if (finalUrl.includes('/onboarding')) console.log('  ✅ Redirige a /onboarding → flujo empresa COMPLETO');
  else {
    const errText = await page.locator('#enterpriseModalError').textContent().catch(() => '');
    if (errText?.trim()) console.log(`  Error modal: "${errText.trim()}"`);
  }
}

// ── EMAIL TEST (registro nuevo) ──────────────────────────
console.log('\n── Email de verificación ──');
// Limpiar el usuario para forzar re-registro
await fetch('https://api.escapemaster.es/v1/api/auth/register', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test.escapemaster.2026@gmail.com', password: 'Test12345!', full_name: 'Test User' })
}).then(async r => {
  const body = await r.json();
  console.log(`  Register response: ${JSON.stringify(body).substring(0, 80)}`);
});

await browser.close();
console.log('\n✅ Test completado');
