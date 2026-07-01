import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

const screenshotsDir = '/Users/dgtovar/Work/marketplace/screenshots';
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const userCredentials = {
  email: 'tovard799@gmail.com',
  password: 'diegoelmejor1'
};

const erdCredentials = {
  email: 'daannii.91@hotmail.es',
  password: 'Planeta02.'
};

async function run() {
  console.log('🚀 Trace Import API Response...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Intercept the import-erd-rooms response
  await page.route('**/import-erd-rooms', async route => {
    const response = await route.fetch();
    const body = await response.json();
    console.log('📡 import-erd-rooms response:', JSON.stringify(body, null, 2));
    await route.continue({ response });
  });

  try {
    // Login
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to profile
    await page.goto('https://www.escapemaster.es/es/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Open ERD import
    await page.click('button:has-text("Importar de ERD")');
    await page.waitForTimeout(1000);

    // Fill and connect
    await page.fill('input[placeholder*="email"], input[type="email"]', erdCredentials.email);
    await page.fill('input[type="password"]', erdCredentials.password);
    await page.click('button:has-text("Conectar")');
    await page.waitForTimeout(8000);

    // Click migrate
    console.log('\nClicking Importar 8 salas...');
    await page.click('button:has-text("Importar 8 salas")');
    await page.waitForTimeout(5000);

    // Check Mis Salas API response
    console.log('\n📡 Checking Mis Salas API...');
    const token = await page.evaluate(() => localStorage.getItem('em_token'));

    const misSalasResponse = await page.evaluate(async (token) => {
      const res = await fetch('https://api.escapemaster.es/v1/api/enterprise/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      return { status: res.status, data };
    }, token);

    console.log('Mis Salas API status:', misSalasResponse.status);
    console.log('Mis Salas API response:', JSON.stringify(misSalasResponse.data, null, 2));

    await page.screenshot({ path: path.join(screenshotsDir, 'trace_result.png'), fullPage: true });

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

run();