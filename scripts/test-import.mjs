import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
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

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 ${name}`);
  return filepath;
}

async function run() {
  console.log('🚀 Starting Import Debug Test...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const networkCalls = [];

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/v1/api/') || url.includes('/enterprise/')) {
      networkCalls.push({
        url: url,
        status: response.status(),
        method: 'GET' // We can't easily get the method from response
      });
      console.log(`[NETWORK] ${response.status()} ${url}`);
    }
  });

  try {
    // Login
    console.log('1️⃣ Login...');
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01_logged_in');

    // Go to profile
    console.log('2️⃣ Going to profile...');
    await page.goto('https://www.escapemaster.es/es/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Open ERD import
    console.log('3️⃣ Opening ERD import...');
    const importBtn = await page.$('button:has-text("Importar de ERD")');
    if (importBtn) {
      await importBtn.click();
      await page.waitForTimeout(1000);
    }
    await takeScreenshot(page, '02_erd_form');

    // Fill ERD credentials
    console.log('4️⃣ Filling ERD credentials...');
    await page.fill('input[placeholder*="email"], input[type="email"]', erdCredentials.email);
    await page.fill('input[type="password"]', erdCredentials.password);
    await takeScreenshot(page, '03_credentials_filled');

    // Connect
    console.log('5️⃣ Connecting to ERD...');
    await page.click('button:has-text("Conectar")');
    await page.waitForTimeout(8000);
    await takeScreenshot(page, '04_after_connect');

    // Check if rooms are displayed
    const roomsVisible = await page.evaluate(() => {
      const els = document.querySelectorAll('label[class*="cursor-pointer"]');
      return els.length;
    });
    console.log(`   Rooms visible: ${roomsVisible}`);

    // Intercept the import API call
    console.log('6️⃣ Clicking Migrar and intercepting...');

    // Set up response interception BEFORE clicking
    await page.route('**/import-erd-rooms', async route => {
      const request = route.request();
      console.log('📡 Intercepted import-erd-rooms request');
      console.log('   Method:', request.method());
      console.log('   URL:', request.url());
      const headers = await request.allHeaders();
      console.log('   Auth:', headers['authorization'] ? 'Present' : 'Missing');
      const postData = await request.postData();
      console.log('   Body:', postData ? JSON.parse(postData) : 'None');

      // Continue with the request
      await route.continue();
    });

    // Also monitor responses
    page.on('response', async response => {
      if (response.url().includes('import-erd-rooms')) {
        console.log(`📡 import-erd-rooms response: ${response.status()}`);
        try {
          const body = await response.json();
          console.log('   Body:', JSON.stringify(body));
        } catch {
          console.log('   Body: (not JSON)');
        }
      }
    });

    // Click Migrar
    const migrateBtn = await page.$('button:has-text("Migrar"), button:has-text("Importar")');
    if (migrateBtn) {
      await migrateBtn.click();
      console.log('   Clicked Migrar button');
      await page.waitForTimeout(5000);
    }
    await takeScreenshot(page, '05_after_migrate');

    // Check for success/error messages
    const pageContent = await page.evaluate(() => {
      const successEl = document.querySelector('[class*="success"], .text-tropical-secondary');
      const errorEl = document.querySelector('[class*="error"], .text-tropical-accent');
      return {
        success: successEl?.textContent || null,
        error: errorEl?.textContent || null,
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    console.log('   Success message:', pageContent.success);
    console.log('   Error message:', pageContent.error);
    console.log('   Page content:', pageContent.bodyText.substring(0, 200));

    // Check Mis Salas
    console.log('7️⃣ Going to Mis Salas...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '06_mis_salas');

    const misSalasContent = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('   Mis Salas content:', misSalasContent.substring(0, 200));

    await takeScreenshot(page, '07_final');

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

run();