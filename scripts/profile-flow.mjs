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
  console.log('🚀 Starting Enterprise Import Flow Test...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE] ${msg.text()}`);
    }
  });

  try {
    // Step 1: Login
    console.log('1️⃣ Login...');
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '01_logged_in');

    // Step 2: Go to profile page (NOT /manager)
    console.log('2️⃣ Going to /es/profile...');
    await page.goto('https://www.escapemaster.es/es/profile', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '02_profile_page');

    // Check for enterprise elements
    const enterprisePanelVisible = await page.$('#enterprisePanel:not(.hidden)').then(el => el !== null).catch(() => false);
    console.log(`   Enterprise panel visible: ${enterprisePanelVisible}`);

    // Check for EnterpriseDashboard
    const dashboardVisible = await page.$('[class*="EnterpriseDashboard"], [class*="enterprise"]').then(el => el !== null).catch(() => false);
    console.log(`   Dashboard elements found: ${dashboardVisible}`);

    // Get all buttons
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns).map(b => b.textContent?.trim()).filter(t => t && t.length < 50);
    });
    console.log(`   Buttons: ${buttons.join(', ')}`);

    // Get visible text content
    const pageText = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.textContent?.substring(0, 800) : 'No main';
    });
    console.log(`   Page content preview: ${pageText.substring(0, 300)}...`);

    // Step 3: Look for "Importar de ERD" button in EnterpriseDashboard
    console.log('3️⃣ Looking for Importar de ERD button...');
    const importBtn = await page.$('button:has-text("Importar de ERD")');
    if (importBtn) {
      console.log('   Found Importar de ERD button!');
      await importBtn.click();
      await page.waitForTimeout(2000);
      await takeScreenshot(page, '03_erd_form_open');

      // Fill ERD credentials
      console.log('4️⃣ Filling ERD credentials...');
      const emailInput = await page.$('input[placeholder*="email"], input[type="email"]');
      const passInput = await page.$('input[type="password"]');

      if (emailInput && passInput) {
        await emailInput.fill(erdCredentials.email);
        await passInput.fill(erdCredentials.password);
        await takeScreenshot(page, '04_erd_credentials');

        // Click connect
        console.log('5️⃣ Connecting to ERD...');
        const connectBtn = await page.$('button:has-text("Conectar")');
        if (connectBtn) {
          await connectBtn.click();
          await page.waitForTimeout(8000);
          await takeScreenshot(page, '05_erd_connected');
        }

        // Check for rooms
        const roomsCount = await page.evaluate(() => {
          const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(:disabled)');
          return checkboxes.length;
        });
        console.log(`   ERD rooms found: ${roomsCount}`);

        if (roomsCount > 0) {
          // Select all
          console.log('6️⃣ Selecting all rooms...');
          const firstCb = await page.$('input[type="checkbox"]');
          if (firstCb) await firstCb.check();
          await page.waitForTimeout(1000);
          await takeScreenshot(page, '06_all_selected');

          // Import
          console.log('7️⃣ Importing rooms...');
          const importBtn = await page.$('button:has-text("Migrar"), button:has-text("Import")');
          if (importBtn) {
            await importBtn.click();
            await page.waitForTimeout(5000);
          }
          await takeScreenshot(page, '07_after_import');
        }
      }
    } else {
      console.log('   Importar de ERD button NOT found!');
      // Let's look at what IS on the page
      const allText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      console.log(`   Page text: ${allText}`);
    }

    // Step 8: Go to Mis Salas
    console.log('8️⃣ Going to Mis Salas...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '08_mis_salas');

    // Step 9: Check content
    const misSalasText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`   Mis Salas content: ${misSalasText.substring(0, 200)}...`);

    // Step 10: Back to profile
    console.log('9️⃣ Back to profile...');
    await page.goBack();
    await page.waitForTimeout(2000);
    await takeScreenshot(page, '09_back_to_profile');

    // Step 11: Mis Salas again
    console.log('🔟 Mis Salas 2nd visit...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '10_mis_salas_2nd');

    await takeScreenshot(page, '11_final');

    console.log('\n✅ Test completed!');
    console.log(`Errors: ${errors.length}`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

run();