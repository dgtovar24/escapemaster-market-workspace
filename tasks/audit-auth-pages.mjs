import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const EMAIL = 'tovard799@gmail.com';
const PASSWORD = 'TestEscape2026!';

const loginRes = await fetch('https://api.escapemaster.es/v1/api/auth/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD })
}).then(r => r.json());

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-ES' });
const page = await ctx.newPage();

await page.goto(`${BASE_URL}/es/`, { waitUntil: 'domcontentloaded' });
await page.evaluate((d) => {
  localStorage.setItem('em_token', d.token);
  localStorage.setItem('em_user', JSON.stringify(d.user));
}, { token: loginRes.access_token, user: loginRes.user });

const AUTH_PAGES = [
  { path: '/es/profile', name: 'profile' },
  { path: '/es/profile/edit', name: 'profile-edit' },
  { path: '/es/profile/favorites', name: 'profile-favorites' },
  { path: '/es/profile/history', name: 'profile-history' },
  { path: '/es/profile/settings', name: 'profile-settings' },
  { path: '/es/chat', name: 'chat' },
  { path: '/es/routes/create', name: 'routes-create' },
];

for (const { path, name } of AUTH_PAGES) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: `tasks/user-test-report/screenshots/auth-${name}.png`,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1280, height: 700 }
  });
  console.log(`✓ ${name}`);
}
await browser.close();
