import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const REPORT = 'tasks/user-test-report/screenshots';

const loginRes = await fetch('https://api.escapemaster.es/v1/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tovard799@gmail.com', password: 'TestEscape2026!' })
}).then(r => r.json());
console.log(`Login: ${loginRes.user.email} (${loginRes.user.account_type}) onboarding=${loginRes.user.onboarding_completed}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES' });
const page = await ctx.newPage();

await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((d) => {
  // Force enterprise + onboarding not completed in localStorage
  const user = { ...d.user, account_type: 'enterprise', onboarding_completed: false };
  localStorage.setItem('em_token', d.token);
  localStorage.setItem('em_user', JSON.stringify(user));
}, { token: loginRes.access_token, user: loginRes.user });

await page.goto(`${BASE_URL}/es/onboarding`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${REPORT}/onboarding-step1.png`, fullPage: false });

const h1 = await page.locator('h1').first().textContent().catch(() => '');
const hasManagerForm = await page.locator('input[type="email"]').count() > 0;
const skipBtn = page.locator('button:has-text("Omitir"), button:has-text("Skip"), button:has-text("Saltar")').first();
const hasSkip = await skipBtn.count() > 0;
console.log(`\nStep 1: "${h1}"`);
console.log(`  Formulario Manager: ${hasManagerForm ? '✅' : '❌'}`);
console.log(`  Botón Skip: ${hasSkip ? '✅' : '❌'}`);

// Check API endpoint for connect-manager
const connectTest = await fetch(`${BASE_URL}/api/enterprise/connect-manager`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginRes.access_token}` },
  body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' })
}).then(r => r.json()).catch(e => ({ error: e.message }));
console.log(`  API connect-manager (wrong creds): ${connectTest.error || JSON.stringify(connectTest).substring(0, 60)}`);

// Skip to step 2
if (hasSkip) {
  await skipBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${REPORT}/onboarding-step2.png`, fullPage: false });
  const h1_2 = await page.locator('h1').first().textContent().catch(() => '');
  const inputCount = await page.locator('input').count();
  console.log(`\nStep 2: "${h1_2}"`);
  console.log(`  Inputs: ${inputCount} ${inputCount >= 4 ? '✅' : '❌'}`);

  if (inputCount >= 4) {
    const inputs = await page.locator('input').all();
    await inputs[0].fill('Test Escape SL');
    await inputs[1].fill('Madrid');
    await inputs[2].fill('+34 600 000 000');
    await inputs[3].fill('Calle Test 123');
    await page.screenshot({ path: `${REPORT}/onboarding-step2-filled.png`, fullPage: false });

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${REPORT}/onboarding-step3.png`, fullPage: false });
    const h1_3 = await page.locator('h1').first().textContent().catch(() => '');
    const errEl = await page.locator('[class*="accent"]').first().textContent().catch(() => '');
    console.log(`\nStep 3: "${h1_3}"`);
    if (errEl?.trim()) console.log(`  Error: "${errEl.trim()}"`);

    // Try complete button
    const completeBtn = page.locator('button').filter({ hasText: /completa|finaliz|listo|done/i }).first();
    const hasCmpBtn = await completeBtn.count() > 0;
    console.log(`  Botón completar: ${hasCmpBtn ? '✅' : '⚠️ no encontrado'}`);
    if (hasCmpBtn) {
      await completeBtn.click();
      await page.waitForTimeout(3000);
      const finalUrl = page.url();
      console.log(`  URL final: ${finalUrl}`);
      await page.screenshot({ path: `${REPORT}/onboarding-complete.png`, fullPage: false });
      if (finalUrl.includes('/profile')) console.log('  ✅ Onboarding completado → /profile');
    }
  }
}

await browser.close();
