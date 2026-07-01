import { chromium } from 'playwright';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';

const screenshotsDir = '/Users/dgtovar/Work/marketplace/screenshots';
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const reportFile = path.join(screenshotsDir, 'analysis-report.md');

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
  console.log('🚀 Starting Full Enterprise Test...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const errors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE] ${msg.text()}`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`[${response.status()}] ${response.url()}`);
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

    // Verify token
    const token = await page.evaluate(() => localStorage.getItem('em_token'));
    console.log(`   Token: ${token ? 'OK' : 'MISSING'}`);

    // Step 2: Go to enterprise dashboard
    console.log('2️⃣ Enterprise Dashboard...');
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '02_enterprise_dashboard');

    // Get dashboard stats
    const stats = await page.evaluate(() => {
      const els = document.querySelectorAll('[class*="text-3xl"], [class*="text-4xl"], [class*="number"]');
      return Array.from(els).slice(0, 4).map(el => el.textContent?.trim()).join(' | ');
    }).catch(() => 'N/A');
    console.log(`   Stats: ${stats}`);

    // Step 3: Click "Importar de ERD" button
    console.log('3️⃣ Opening ERD import...');
    const importBtn = await page.$('button:has-text("Importar de ERD"), button:has-text("Importar")');
    if (importBtn) {
      await importBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '03_erd_form_open');
    } else {
      console.log('   Import button not found!');
      await takeScreenshot(page, '03_no_import_button');
    }

    // Step 4: Fill ERD credentials
    console.log('4️⃣ Filling ERD credentials...');
    await page.fill('input[placeholder*="erdpanel"], input[type="email"]', erdCredentials.email);
    await page.fill('input[type="password"]', erdCredentials.password);
    await takeScreenshot(page, '04_erd_credentials_filled');

    // Submit ERD login
    console.log('5️⃣ Connecting to ERD...');
    await page.click('button[type="submit"]:has-text("Conectar"), button:has-text("Conectar")');
    await page.waitForTimeout(8000); // Wait for ERD API call
    await takeScreenshot(page, '05_after_erd_connect');

    // Check for ERD rooms
    const erdRoomsCount = await page.evaluate(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      return checkboxes.length;
    }).catch(() => 0);
    console.log(`   ERD rooms found: ${erdRoomsCount}`);

    if (erdRoomsCount > 0) {
      // Select all rooms
      console.log('6️⃣ Selecting all rooms...');
      const firstCheckbox = await page.$('input[type="checkbox"]');
      if (firstCheckbox) {
        await firstCheckbox.check();
        await page.waitForTimeout(500);
      }
      await takeScreenshot(page, '06_rooms_selected');

      // Click import/migrate button
      console.log('7️⃣ Importing rooms...');
      const migrateBtn = await page.$('button:has-text("Migrar"), button:has-text("Import selected")');
      if (migrateBtn) {
        await migrateBtn.click();
        await page.waitForTimeout(5000);
      }
      await takeScreenshot(page, '07_after_import');
    }

    // Step 8: Go to Mis Salas (enterprise rooms)
    console.log('8️⃣ Going to Mis Salas...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await takeScreenshot(page, '08_mis_salas');

    // Check rooms in Mis Salas
    const misSalasContent = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.textContent?.substring(0, 500) : 'No main content';
    }).catch(() => 'Error');
    console.log(`   Mis Salas content preview: ${misSalasContent.substring(0, 100)}...`);

    // Step 9: Go back to enterprise panel
    console.log('9️⃣ Back to enterprise panel...');
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '09_back_to_enterprise');

    // Step 10: Check updated stats
    const updatedStats = await page.evaluate(() => {
      const els = document.querySelectorAll('[class*="text-3xl"], [class*="text-4xl"]');
      return Array.from(els).slice(0, 4).map(el => el.textContent?.trim()).join(' | ');
    }).catch(() => 'N/A');
    console.log(`   Updated stats: ${updatedStats}`);

    // Step 11: Repeat - go to Mis Salas again
    console.log('🔟 Mis Salas 2nd visit...');
    await page.goto('https://www.escapemaster.es/es/profile/rooms', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await takeScreenshot(page, '10_mis_salas_2nd');

    await takeScreenshot(page, '11_final');

    // Generate report
    console.log('\n📊 Generating report...');
    const report = `# Enterprise Panel Analysis Report

## Test Date
${new Date().toISOString()}

## User Credentials
- Marketplace: ${userCredentials.email}
- ERD Panel: ${erdCredentials.email}

## Test Flow Results

### 1. Login
- Status: ${token ? 'SUCCESS' : 'FAILED'}
- Token: ${token ? 'Present' : 'Missing'}

### 2. Enterprise Dashboard
- URL: /es/manager
- Stats: ${stats || 'N/A'}

### 3. ERD Import
- ERD Rooms Found: ${erdRoomsCount}
- Import Status: ${erdRoomsCount > 0 ? 'Rooms were available' : 'No rooms found'}

### 4. Mis Salas (Enterprise Rooms)
- URL: /es/profile/rooms
- Content: ${misSalasContent.substring(0, 200)}...

### 5. Post-Import Stats
- Updated Stats: ${updatedStats || 'N/A'}

## Errors Found

### Console Errors (${errors.length})
${errors.slice(0, 10).map(e => `- ${e}`).join('\n')}

### Network Errors (${networkErrors.length})
${networkErrors.slice(0, 10).map(e => `- ${e}`).join('\n')}

## Screenshots
All screenshots saved to: ${screenshotsDir}
- 01_logged_in.png
- 02_enterprise_dashboard.png
- 03_erd_form_open.png
- 04_erd_credentials_filled.png
- 05_after_erd_connect.png
- 06_rooms_selected.png
- 07_after_import.png
- 08_mis_salas.png
- 09_back_to_enterprise.png
- 10_mis_salas_2nd.png
- 11_final.png

## Issues Identified

### 1. Authentication
- Issue: ${token ? 'None' : 'Token not stored after login'}
- Impact: API calls fail with 401

### 2. ERD Import
- Issue: ${erdRoomsCount > 0 ? 'Rooms displayed but import may have failed' : 'No ERD rooms found after login'}
- Impact: Enterprise dashboard shows 0 salas

### 3. Mis Salas Page
- Issue: Shows player booking history instead of enterprise rooms
- Impact: User cannot manage imported rooms

### 4. Analytics API
- Issue: /players/me/history returns 500
- Impact: Console errors,不影响主要功能

## Recommendations

1. **Fix Mis Salas routing**: The /es/profile/rooms URL should show enterprise rooms, not player booking history
2. **Check ERD import flow**: Verify that rooms are actually being imported to the database
3. **Fix /players/me/history endpoint**: Returns 500 error
4. **Add error handling**: Show user-friendly error messages when API calls fail
`;

    writeFileSync(reportFile, report);
    console.log(`\n📄 Report saved: ${reportFile}`);
    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    await takeScreenshot(page, 'error');
  } finally {
    await browser.close();
  }
}

run();