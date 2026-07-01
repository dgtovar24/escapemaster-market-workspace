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

async function takeScreenshot(page, name) {
  const filepath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

async function run() {
  console.log('🚀 Starting Enterprise Panel Test...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Collect console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  [CONSOLE ERROR] ${msg.text()}`);
    }
  });

  // Collect page errors
  page.on('pageerror', error => {
    console.log(`  [PAGE ERROR] ${error.message}`);
  });

  try {
    // Step 1: Go to escapemaster.es
    console.log('1️⃣ Navigating to escapemaster.es...');
    await page.goto('https://www.escapemaster.es', { waitUntil: 'networkidle', timeout: 30000 });
    await takeScreenshot(page, '01_homepage');

    // Step 2: Go to login
    console.log('2️⃣ Going to login...');
    await page.click('text=Iniciar Sesión', { timeout: 10000 }).catch(() => {
      console.log('  (Login button not found, trying direct navigation)');
    });
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await takeScreenshot(page, '02_login_page');

    // Step 3: Login with user credentials
    console.log('3️⃣ Logging in as tovard799@gmail.com...');
    await page.fill('input[type="email"], input[name="email"]', userCredentials.email);
    await page.fill('input[type="password"], input[name="password"]', userCredentials.password);
    await page.click('button[type="submit"], button:has-text("Iniciar")');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '03_after_login');

    // Step 4: Go to enterprise panel (Soy Propietario)
    console.log('4️⃣ Going to enterprise panel...');
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await takeScreenshot(page, '04_enterprise_panel');

    // Step 5: Navigate to ERD import section
    console.log('5️⃣ Looking for ERD import option...');
    await page.waitForTimeout(2000);

    // Look for import button - try different selectors
    let importButton = null;
    try { importButton = await page.$('button:has-text("Importar")'); } catch(e) {}
    try { if (!importButton) importButton = await page.$('text=/importar/i'); } catch(e) {}
    try { if (!importButton) importButton = await page.$('a:has-text("Importar")'); } catch(e) {}
    if (importButton) {
      console.log('  Found import button');
      await importButton.click();
      await page.waitForTimeout(2000);
    }
    await takeScreenshot(page, '05_erd_import_section');

    // Step 6: Login to ERD
    console.log('6️⃣ Logging into ERD...');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '06_erd_login');

    // Fill ERD credentials if we see email field
    const erdEmailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    if (erdEmailField) {
      console.log('  Found ERD email field');
      await erdEmailField.fill(erdCredentials.email);
      await page.waitForTimeout(500);

      const erdPassField = await page.$('input[type="password"], input[name="password"]');
      if (erdPassField) {
        await erdPassField.fill(erdCredentials.password);
      }

      // Find and click submit
      const submitBtn = await page.$('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
      if (submitBtn) {
        await submitBtn.click();
      }
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '07_after_erd_login');
    } else {
      console.log('  No ERD email field found - checking page state');
      await takeScreenshot(page, '07_no_erd_form');
    }

    // Step 7: Select and import all rooms
    console.log('7️⃣ Selecting and importing rooms...');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '08_rooms_to_import');

    // Look for select all checkbox
    const selectAll = await page.$('input[type="checkbox"]:not(:disabled)');
    if (selectAll) {
      console.log('  Found select all checkbox');
      await selectAll.check();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '09_all_selected');
    }

    // Look for import button
    const importBtn = await page.$('button:has-text("Importar"), button:has-text("Migrar"), button:has-text("Import selected")');
    if (importBtn) {
      console.log('  Clicking import button');
      await importBtn.click();
      await page.waitForTimeout(5000);
      await takeScreenshot(page, '10_during_import');
    }

    // Step 8: After import - check for errors
    console.log('8️⃣ Checking import results...');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '11_after_import');

    // Step 9: Navigate to Mis Salas
    console.log('9️⃣ Going to Mis Salas...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '12_mis_salas');

    // Step 10: Check Mis Salas functionality
    console.log('🔟 Checking Mis Salas functionality...');
    await page.waitForTimeout(2000);

    // Try to see if rooms are listed
    const roomCards = await page.$$('[class*="room"], [class*="sala"], .bg-tropical-card');
    console.log(`  Found ${roomCards.length} room cards`);
    await takeScreenshot(page, '13_rooms_list');

    // Step 11: Go back to enterprise panel
    console.log('1️⃣1️⃣ Going back to enterprise panel...');
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '14_back_to_enterprise');

    // Step 12: Repeat process - go to Mis Salas again
    console.log('1️⃣2️⃣ Going to Mis Salas again...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '15_mis_salas_2nd_visit');

    // Take final screenshot
    await takeScreenshot(page, '16_final_state');

    console.log('\n✅ Test completed!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await takeScreenshot(page, 'error_state');
  } finally {
    await browser.close();
  }
}

run();