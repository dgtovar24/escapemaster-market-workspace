import { chromium } from 'playwright';
import { mkdirSync, existsSync, appendFileSync } from 'fs';
import path from 'path';

const screenshotsDir = '/Users/dgtovar/Work/marketplace/screenshots';
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const errorsFile = path.join(screenshotsDir, 'errors.log');

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
  console.log(`📸 Screenshot: ${name}`);
  return filepath;
}

async function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}\n`;
  console.log(line.trim());
  appendFileSync(errorsFile, line);
}

async function run() {
  log('=== Starting Enterprise Panel Debug Test ===');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      log(`[CONSOLE ERROR] ${text}`);
    }
  });

  page.on('pageerror', error => {
    log(`[PAGE ERROR] ${error.message}`);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
      log(`[NETWORK ${response.status()}] ${response.url()}`);
    }
  });

  try {
    // Step 1: Login
    log('Step 1: Navigating to login page');
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await takeScreenshot(page, '01_login_page');

    log('Step 2: Filling login form');
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await takeScreenshot(page, '02_form_filled');

    log('Step 3: Submitting login');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '03_after_login');

    // Check if logged in
    const headerHtml = await page.$eval('header', el => el.innerHTML).catch(() => 'no header');
    const isLoggedIn = headerHtml.includes('em_token') || !(headerHtml.includes('Iniciar Sesión'));
    log(`Login status: ${isLoggedIn ? 'SUCCESS' : 'FAILED'}`);

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('em_token'));
    log(`Token in localStorage: ${token ? 'PRESENT (' + token.substring(0, 20) + '...)' : 'MISSING'}`);

    // Step 2: Go to enterprise panel
    log('Step 4: Going to enterprise panel');
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '04_enterprise_panel');

    // Step 3: Check dashboard stats
    log('Step 5: Checking dashboard stats');
    const statsText = await page.evaluate(() => {
      const stats = document.querySelectorAll('[class*="stat"], [class*="number"], [class*="count"]');
      return Array.from(stats).map(el => el.textContent).join(' | ');
    }).catch(() => 'Could not extract stats');
    log(`Dashboard stats: ${statsText}`);

    // Step 4: Go to ERD import
    log('Step 6: Clicking ERD import button');
    await page.waitForTimeout(2000);

    // Try to find and click the import button
    const importBtn = await page.$('button:has-text("Importar"), a:has-text("Importar")');
    if (importBtn) {
      log('Found import button, clicking...');
      await importBtn.click();
      await page.waitForTimeout(3000);
    } else {
      log('Import button not found, trying direct navigation');
      await page.goto('https://www.escapemaster.es/es/profile?tab=import', { waitUntil: 'networkidle', timeout: 30000 });
    }
    await takeScreenshot(page, '05_import_section');

    // Step 5: Login to ERD
    log('Step 7: Logging into ERD');
    await page.waitForTimeout(2000);

    const erdEmailField = await page.$('input[type="email"], input[name="email"]');
    if (erdEmailField) {
      log('Found ERD email field, filling credentials');
      await erdEmailField.fill(erdCredentials.email);
      await page.waitForTimeout(500);

      const erdPassField = await page.$('input[type="password"]');
      if (erdPassField) {
        await erdPassField.fill(erdCredentials.password);
      }

      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    } else {
      log('ERD email field not found');
    }
    await takeScreenshot(page, '06_erd_logged_in');

    // Step 6: Check ERD rooms
    log('Step 8: Checking ERD rooms');
    const erdRoomsCount = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:disabled)');
      return checkboxes.length;
    }).catch(() => 0);
    log(`ERD rooms found: ${erdRoomsCount}`);

    if (erdRoomsCount > 0) {
      // Select all
      log('Selecting all rooms');
      const selectAll = await page.$('input[type="checkbox"]:not(:disabled)');
      if (selectAll) {
        await selectAll.check();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, '07_all_selected');
      }

      // Click import
      log('Clicking import button');
      const importBtn = await page.$('button:has-text("Importar"), button:has-text("Migrar")');
      if (importBtn) {
        await importBtn.click();
        await page.waitForTimeout(5000);
        await takeScreenshot(page, '08_import_in_progress');
      }
    }

    // Step 7: After import
    log('Step 9: After import');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '09_after_import');

    // Step 8: Go to Mis Salas
    log('Step 10: Going to Mis Salas');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '10_mis_salas');

    // Check for rooms
    const roomsCount = await page.evaluate(() => {
      const roomCards = document.querySelectorAll('[class*="room"], [class*="sala"], [class*="card"]');
      return roomCards.length;
    }).catch(() => 0);
    log(`Rooms in Mis Salas: ${roomsCount}`);

    // Check network errors
    const apiErrors = networkErrors.filter(e => e.includes('/v1/api/'));
    log(`API errors: ${apiErrors.length > 0 ? apiErrors.join(', ') : 'None'}`);

    // Final state
    await takeScreenshot(page, '11_final_state');

    log('=== Test Completed ===');
    log(`Total console errors: ${consoleErrors.length}`);
    log(`Total network errors: ${networkErrors.length}`);

  } catch (error) {
    log(`ERROR: ${error.message}`);
    await takeScreenshot(page, 'error_state');
  } finally {
    await browser.close();
  }
}

run();