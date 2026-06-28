/**
 * Test: Enterprise conversion flow
 * Logs in, clicks "Convertir a cuenta de Empresa", confirms the modal, checks result
 */
import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const TEST_EMAIL = 'tovard799@gmail.com';
const TEST_PASSWORD = 'TestEscape2026!';

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Capture all console messages and network errors
const consoleLogs = [];
page.on('console', m => consoleLogs.push(`[${m.type()}] ${m.text()}`));
page.on('response', async res => {
  if (res.url().includes('/v1/api/auth/switch-to-enterprise')) {
    const body = await res.json().catch(() => null);
    console.log(`\n📡 API switch-to-enterprise: ${res.status()} →`, JSON.stringify(body, null, 2));
  }
});

// Step 1: Login
console.log('\n→ Logging in...');
await page.goto(`${BASE_URL}/es/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(1000);
await page.fill('#email', TEST_EMAIL);
await page.fill('#password', TEST_PASSWORD);
await page.click('#submitBtn');
await page.waitForTimeout(4000);

const afterLogin = page.url();
console.log('URL after login:', afterLogin);

if (afterLogin.includes('/login')) {
  console.error('❌ Login failed - still on login page');
  await browser.close();
  process.exit(1);
}

// Step 2: Go to profile
console.log('\n→ Going to profile...');
await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'domcontentloaded', timeout: 20000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/ent-01-profile.png', fullPage: true });

// Check account_type in localStorage
const userData = await page.evaluate(() => {
  const raw = localStorage.getItem('em_user');
  return raw ? JSON.parse(raw) : null;
});
console.log('User in localStorage:', JSON.stringify({
  email: userData?.email,
  account_type: userData?.account_type,
  onboarding_completed: userData?.onboarding_completed,
}, null, 2));

if (userData?.account_type === 'enterprise') {
  console.log('⚠️  User is already enterprise in localStorage - clearing and re-logging in');
  // Clear session and login again to get fresh token
  await page.evaluate(() => {
    localStorage.removeItem('em_token');
    localStorage.removeItem('em_user');
  });
  await page.goto(`${BASE_URL}/es/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.click('#submitBtn');
  await page.waitForTimeout(4000);
  await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

// Step 3: Find and click the switch button
console.log('\n→ Looking for enterprise switch button...');
const switchBtn = page.locator('#switchToEnterpriseBtn');
const btnCount = await switchBtn.count();
console.log(`Button #switchToEnterpriseBtn found: ${btnCount > 0 ? 'YES' : 'NO'}`);

if (btnCount === 0) {
  console.log('Page URL:', page.url());
  const bodySnippet = (await page.textContent('body')).substring(0, 500);
  console.log('Body snippet:', bodySnippet);
  console.log('\nConsole logs:');
  consoleLogs.forEach(l => console.log(' ', l));
  await browser.close();
  process.exit(1);
}

const isVisible = await switchBtn.isVisible();
console.log(`Button visible: ${isVisible}`);

await switchBtn.click();
await page.waitForTimeout(1000);

// Step 4: Check modal appeared
const modal = page.locator('#enterpriseModal');
const modalVisible = await modal.isVisible();
console.log(`Modal visible: ${modalVisible}`);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/ent-02-modal.png', fullPage: true });

if (!modalVisible) {
  console.error('❌ Modal did not appear after clicking switch button');
  console.log('\nConsole logs:');
  consoleLogs.forEach(l => console.log(' ', l));
  await browser.close();
  process.exit(1);
}

// Step 5: Click confirm
console.log('\n→ Clicking confirm in modal...');
const confirmBtn = page.locator('#enterpriseModalConfirm');
await confirmBtn.click();
await page.waitForTimeout(5000);

await page.screenshot({ path: 'tasks/user-test-report/screenshots/ent-03-after-confirm.png', fullPage: true });
const afterConfirm = page.url();
console.log('URL after confirm:', afterConfirm);

// Check for error in modal
const errorEl = page.locator('#enterpriseModalError');
const errorVisible = await errorEl.isVisible().catch(() => false);
if (errorVisible) {
  const errorText = await errorEl.textContent();
  console.error(`❌ Modal error: ${errorText}`);
} else {
  console.log('✅ No error in modal');
}

if (afterConfirm.includes('/onboarding')) {
  console.log('✅ Redirected to onboarding!');
  await page.screenshot({ path: 'tasks/user-test-report/screenshots/ent-04-onboarding.png', fullPage: true });
} else if (afterConfirm.includes('/profile')) {
  console.log('⚠️  Stayed on profile - checking if enterprise panel is shown');
  const enterprisePanel = page.locator('#enterprisePanel');
  const panelVisible = await enterprisePanel.isVisible().catch(() => false);
  console.log('Enterprise panel visible:', panelVisible);
} else {
  console.log('⚠️  Unexpected URL:', afterConfirm);
}

console.log('\nConsole logs during test:');
consoleLogs.forEach(l => console.log(' ', l));

await browser.close();
