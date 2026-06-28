import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const EMAIL = 'tovard799@gmail.com';
const PASSWORD = 'TestEscape2026!';
const CODE = '581734';

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'es-ES' });
const page = await ctx.newPage();

// ── VERIFICACIÓN ─────────────────────────────────────────────────────
console.log('\n→ Navegando a verificación...');
await page.goto(`${BASE_URL}/es/register?verify=${encodeURIComponent(EMAIL)}`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/step-verify.png', fullPage: true });

const codeInput = page.locator('input[placeholder="XXXXXX"]').first();
await codeInput.waitFor({ state: 'visible', timeout: 10000 });
await codeInput.fill(CODE);
console.log(`  → Código introducido: ${CODE}`);

const verifyBtn = page.locator('button:has-text("Verificar y Finalizar")').first();
await verifyBtn.click();
await page.waitForTimeout(4000);
await page.screenshot({ path: '/tmp/step-after-verify.png', fullPage: true });
console.log(`  → URL tras verificar: ${page.url()}`);

// ── ONBOARDING si redirige ────────────────────────────────────────────
if (page.url().includes('/onboarding')) {
  console.log('\n→ Onboarding detectado — navegando al perfil...');
  await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
}

// ── PÁGINAS AUTENTICADAS ──────────────────────────────────────────────
const AUTH_PAGES = [
  '/es/profile', '/es/profile/edit', '/es/profile/favorites',
  '/es/profile/history', '/es/profile/settings', '/es/teams/my-teams',
  '/es/chat', '/es/routes/create', '/es/manager',
];

console.log('\n═══ Páginas autenticadas ═══');
for (const path of AUTH_PAGES) {
  const url = `${BASE_URL}${path}`;
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch(e => null);
  await page.waitForTimeout(600);
  const status = res?.status() ?? 0;
  const finalUrl = page.url();
  const redirectedToLogin = finalUrl.includes('/login');
  const icon = (status >= 500 || redirectedToLogin) ? '❌' : status >= 400 ? '⚠️' : '✅';
  console.log(`  ${icon} ${path} → HTTP ${status}${redirectedToLogin ? ' (→ login)' : ''}`);
}

// ── CAMBIO A EMPRESA ─────────────────────────────────────────────────
console.log('\n═══ Cambio a cuenta empresa ═══');
await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'domcontentloaded', timeout: 15000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/profile-loaded.png', fullPage: true });

const switchBtn = page.locator('#switchToEnterpriseBtn').first();
if (await switchBtn.count() > 0 && await switchBtn.isVisible()) {
  console.log('  ✅ #switchToEnterpriseBtn encontrado y visible');

  // Interceptar el confirm() dialog y aceptarlo
  page.once('dialog', async dialog => {
    console.log(`  → Dialog: "${dialog.message().substring(0, 100)}..."`);
    await page.screenshot({ path: '/tmp/dialog-confirm.png' }).catch(() => {});
    await dialog.accept(); // CONFIRMAR el cambio
  });

  await switchBtn.click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/after-switch.png', fullPage: true });
  console.log(`  → URL tras confirmar: ${page.url()}`);

  if (page.url().includes('/onboarding')) {
    console.log('  ✅ Redirigido a onboarding de empresa');
    await page.screenshot({ path: '/tmp/enterprise-onboarding.png', fullPage: true });
  } else if (page.url().includes('/profile')) {
    console.log('  ✅ Permanece en perfil (posiblemente ya era enterprise)');
  }
} else {
  console.log('  ⚠️  #switchToEnterpriseBtn no visible (¿ya es enterprise o no hay sesión?)');
  const bodyText = await page.textContent('body').catch(() => '');
  if (page.url().includes('/login')) console.log('  ❌ Sin sesión — redirigido a login');
}

console.log('\n✅ Test completado. Screenshots en /tmp/');
await browser.close();
