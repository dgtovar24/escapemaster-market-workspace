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
  console.log('🚀 Debug Import Click...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const allNetworkCalls = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('/v1/api/')) {
      allNetworkCalls.push(`→ ${request.method()} ${url}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/v1/api/')) {
      allNetworkCalls.push(`← ${response.status()} ${url}`);
    }
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
    const importBtn = await page.$('button:has-text("Importar de ERD")');
    if (importBtn) {
      await importBtn.click();
      await page.waitForTimeout(1000);
    }

    // Fill ERD credentials
    await page.fill('input[placeholder*="email"], input[type="email"]', erdCredentials.email);
    await page.fill('input[type="password"]', erdCredentials.password);

    // Connect
    await page.click('button:has-text("Conectar")');
    await page.waitForTimeout(8000);

    // Check state
    const state = await page.evaluate(() => {
      // Try to find the button and check its state
      const buttons = Array.from(document.querySelectorAll('button'));
      const migrateBtn = buttons.find(b => b.textContent?.includes('Migrar') || b.textContent?.includes('Importar'));
      return {
        found: !!migrateBtn,
        text: migrateBtn?.textContent,
        disabled: migrateBtn?.disabled,
        allButtons: buttons.map(b => ({ text: b.textContent?.trim(), disabled: b.disabled }))
      };
    });
    console.log('Button state:', JSON.stringify(state, null, 2));

    // Clear network calls
    allNetworkCalls.length = 0;

    console.log('\nClicking Migrar...');
    await page.click('button:has-text("Migrar"), button:has-text("Importar")');
    await page.waitForTimeout(5000);

    console.log('\nNetwork calls during migrate:');
    allNetworkCalls.forEach(call => console.log('  ' + call));

    // Check if import-erd-rooms was called
    const importCalled = allNetworkCalls.some(c => c.includes('import-erd-rooms'));
    console.log(`\nimport-erd-rooms called: ${importCalled ? 'YES' : 'NO'}`);

    await page.screenshot({ path: path.join(screenshotsDir, 'debug_migrate.png'), fullPage: true });
    console.log('Screenshot saved');

  } catch (error) {
    console.error(`Error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

run();