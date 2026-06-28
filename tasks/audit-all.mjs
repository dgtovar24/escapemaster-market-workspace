import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const SHOTS = 'tasks/user-test-report/screenshots/audit';
import { mkdirSync } from 'fs';
mkdirSync(SHOTS, { recursive: true });

// Get auth token
const loginRes = await fetch('https://api.escapemaster.es/v1/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tovard799@gmail.com', password: 'TestEscape2026!' })
}).then(r => r.json());

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'es-ES' });
const page = await ctx.newPage();

// Inject session
await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((d) => {
  localStorage.setItem('em_token', d.token);
  localStorage.setItem('em_user', JSON.stringify({ ...d.user, account_type: 'customer', onboarding_completed: true }));
}, { token: loginRes.access_token, user: loginRes.user });

const PAGES = [
  // Public
  { path: '/es', name: 'home' },
  { path: '/es/login', name: 'login' },
  { path: '/es/register', name: 'register' },
  { path: '/es/search', name: 'search' },
  { path: '/es/marketplace', name: 'marketplace' },
  { path: '/es/offers', name: 'offers' },
  { path: '/es/teams', name: 'teams' },
  { path: '/es/routes', name: 'routes' },
  { path: '/es/ayuda', name: 'ayuda' },
  { path: '/es/contacto', name: 'contacto' },
  { path: '/es/faq', name: 'faq' },
  { path: '/es/terminos', name: 'terminos' },
  { path: '/es/privacidad', name: 'privacidad' },
  // Auth
  { path: '/es/profile', name: 'profile' },
  { path: '/es/chat', name: 'chat' },
  { path: '/es/manager', name: 'manager' },
  // Games
  { path: '/es/game/c1479c0d-d680-47e7-82eb-cc2b1e34a860', name: 'game-1' },
  { path: '/es/game/cf98c608-b44a-459c-8517-9a0e8df68978', name: 'game-2' },
  { path: '/es/game/ad1eba49-d9b2-4a86-957e-d2f4f06b1587', name: 'game-3' },
  { path: '/es/game/d86acc76-b3d4-4476-8901-96d81239510b', name: 'game-4' },
  { path: '/es/game/d9eb270e-6425-4aaa-b0fc-344683547379', name: 'game-5' },
  { path: '/es/game/b7e709cd-48c1-4264-acc9-38036f19beb3', name: 'game-6' },
  { path: '/es/game/64ada70c-3467-4784-85d2-0096512df674', name: 'game-7' },
  { path: '/es/game/0833e1cf-e3ed-4f31-a5b3-3ee8e4f1f3ac', name: 'game-8' },
  { path: '/es/game/5ed238b3-71a1-420f-9d44-42a360535552', name: 'game-9' },
  { path: '/es/game/5a9e2ba2-4dab-4f70-a594-89f2950c44ca', name: 'game-10' },
  { path: '/es/game/f4486898-c957-4bbf-a99c-e18a4499cefb', name: 'game-11' },
  { path: '/es/game/3adb3dd6-4fbd-4ae2-aad7-3d3a13ab7cf9', name: 'game-12' },
];

const results = [];

for (const { path, name } of PAGES) {
  const url = `${BASE_URL}${path}`;
  const consoleErrs = [];
  const jsErrs = [];
  const onConsole = m => { if (m.type() === 'error') consoleErrs.push(m.text()); };
  const onJsErr = e => jsErrs.push(e.message);
  page.on('console', onConsole);
  page.on('pageerror', onJsErr);

  const start = Date.now();
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    const loadTime = Date.now() - start;
    const status = res?.status();
    const finalUrl = page.url();

    // Capture viewport screenshot
    await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: { x: 0, y: 0, width: 1280, height: 900 } });

    // Measure top padding of main
    const topPad = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? window.getComputedStyle(main).paddingTop : null;
    });

    // Check for loading spinners still visible
    const hasSpinner = await page.locator('.animate-spin, [class*="skeleton"], [class*="loading"]').count() > 0;

    // Get page background color of body
    const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);

    results.push({ name, path, status, loadTime, topPad, hasSpinner, consoleErrs: consoleErrs.length, jsErrs: jsErrs.length, finalUrl, bgColor });

    const icon = status >= 500 ? '🔴' : status >= 400 ? '🟠' : loadTime > 8000 ? '🟡' : '✅';
    console.log(`${icon} ${name.padEnd(12)} HTTP ${status} | ${loadTime}ms | pt:${topPad} | spin:${hasSpinner} | errs:${consoleErrs.length}`);

    if (consoleErrs.length > 0) {
      const unique = [...new Set(consoleErrs)];
      unique.forEach(e => console.log(`   ⚠️  ${e.substring(0, 100)}`));
    }
  } catch (e) {
    results.push({ name, path, status: 0, error: e.message });
    console.log(`🔴 ${name.padEnd(12)} TIMEOUT/ERROR: ${e.message.substring(0, 80)}`);
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onJsErr);
  }
}

await browser.close();

// Summary
console.log('\n══════════════════════ RESUMEN ══════════════════════');
console.log(`Total páginas: ${results.length}`);
console.log(`Con errores HTTP: ${results.filter(r => r.status >= 400).length}`);
console.log(`Lentas (>8s): ${results.filter(r => r.loadTime > 8000).length}`);
console.log(`Con spinners: ${results.filter(r => r.hasSpinner).length}`);
console.log(`Con errores consola: ${results.filter(r => r.consoleErrs > 0).length}`);
