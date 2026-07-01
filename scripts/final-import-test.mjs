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

async function run() {
  console.log('🚀 Final Import Test...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const networkCalls = [];

  page.on('request', request => {
    if (request.url().includes('/v1/api/')) {
      networkCalls.push(`→ ${request.method()} ${request.url().split('/v1/api/')[1]}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/v1/api/')) {
      networkCalls.push(`← ${response.status()} ${response.url().split('/v1/api/')[1]}`);
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

    // Go to profile
    console.log('2️⃣ Go to profile...');
    await page.goto('https://www.escapemaster.es/es/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Open ERD import
    console.log('3️⃣ Open ERD import...');
    await page.click('button:has-text("Importar de ERD")');
    await page.waitForTimeout(1000);

    // Fill and connect
    console.log('4️⃣ Connect to ERD...');
    await page.fill('input[placeholder*="email"], input[type="email"]', erdCredentials.email);
    await page.fill('input[type="password"]', erdCredentials.password);
    await page.click('button:has-text("Conectar")');
    await page.waitForTimeout(8000);

    // Verify rooms are shown
    const roomsText = await page.evaluate(() => {
      const label = document.querySelector('label[class*="cursor-pointer"]');
      return label ? label.textContent : null;
    });
    console.log(`   First room: ${roomsText?.trim()}`);

    // Clear network calls
    networkCalls.length = 0;

    // Click the CORRECT button - "Importar X salas" not "Importar de ERD"
    console.log('5️⃣ Click "Importar 8 salas" (the actual migrate button)...');
    await page.click('button:has-text("Importar 8 salas")');
    await page.waitForTimeout(5000);

    console.log('\nNetwork calls:');
    networkCalls.forEach(c => console.log('  ' + c));

    const importCalled = networkCalls.some(c => c.includes('import-erd-rooms'));
    console.log(`\nimport-erd-rooms called: ${importCalled ? '✅ YES' : '❌ NO'}`);

    // Check page state
    await page.screenshot({ path: path.join(screenshotsDir, 'after_migrate.png'), fullPage: true });
    console.log('Screenshot saved');

    // Check Mis Salas
    console.log('6️⃣ Check Mis Salas...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);

    const roomsCount = await page.evaluate(() => {
      const content = document.body.innerText;
      if (content.includes('No tienes salas')) return '0 (no rooms)';
      const roomCards = document.querySelectorAll('[class*="room"], [class*="sala"]');
      return `${roomCards.length} cards found`;
    });
    console.log(`   Rooms: ${roomsCount}`);

    await page.screenshot({ path: path.join(screenshotsDir, 'mis_salas_final.png'), fullPage: true });

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

run();