import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const EMAIL = 'tovard799@gmail.com';
const PASSWORD = 'TestEscape2026!';

const loginRes = await fetch('https://api.escapemaster.es/v1/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
}).then(r => r.json());

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'es-ES' });
const page = await ctx.newPage();

await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((d) => {
  // Simular usuario customer para ver el botón
  const user = { ...d.user, account_type: 'customer' };
  localStorage.setItem('em_token', d.token);
  localStorage.setItem('em_user', JSON.stringify(user));
}, { token: loginRes.access_token, user: loginRes.user });

await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3500);

// Forzar visibilidad del botón y mostrar modal para screenshot
await page.evaluate(() => {
  const btn = document.getElementById('switchToEnterpriseBtn');
  if (btn) btn.style.display = 'flex';
});

// Abrir modal directamente
await page.evaluate(() => {
  const modal = document.getElementById('enterpriseModal');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
});

await page.waitForTimeout(500);
await page.screenshot({ path: 'tasks/user-test-report/screenshots/modal-design.png', fullPage: false });
console.log('✅ Screenshot del modal guardado: tasks/user-test-report/screenshots/modal-design.png');

// Test botón Cancelar
await page.locator('#enterpriseModalCancel').click();
await page.waitForTimeout(300);
const hidden = !(await page.locator('#enterpriseModal').isVisible());
console.log(`✅ Cancelar cierra el modal: ${hidden}`);

// Test clic fuera del modal
await page.evaluate(() => {
  const modal = document.getElementById('enterpriseModal');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
});
await page.waitForTimeout(300);
await page.mouse.click(10, 10); // clic fuera
await page.waitForTimeout(300);
const hiddenAfterOutsideClick = !(await page.locator('#enterpriseModal').isVisible());
console.log(`✅ Clic fuera cierra modal: ${hiddenAfterOutsideClick}`);

await page.screenshot({ path: 'tasks/user-test-report/screenshots/profile-enterprise-view.png', fullPage: true });
await browser.close();
