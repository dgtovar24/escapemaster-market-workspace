import { chromium } from 'playwright';

const BASE_URL = 'https://escapemaster.es';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

const pages = [
  { path: '/es/', name: 'home' },
  { path: '/es/search', name: 'search' },
  { path: '/es/routes', name: 'routes' },
  { path: '/es/teams', name: 'teams' },
  { path: '/es/marketplace', name: 'marketplace' },
];

for (const { path, name } of pages) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1500);
  // Screenshot only viewport (not full page) to see the top area
  await page.screenshot({ 
    path: `/Users/dgtovar/Work/marketplace/tasks/user-test-report/screenshots/top-${name}.png`,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1280, height: 600 }
  });
  console.log(`✓ ${name}`);
}

await browser.close();
