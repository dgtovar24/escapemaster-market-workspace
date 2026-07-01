import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

const screenshotsDir = '/Users/dgtovar/Work/marketplace/screenshots';

const userCredentials = {
  email: 'tovard799@gmail.com',
  password: 'diegoelmejor1'
};

async function run() {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    // Login
    await page.goto('https://www.escapemaster.es/es/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', userCredentials.email);
    await page.fill('input[type="password"]', userCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Go to enterprise dashboard
    await page.goto('https://www.escapemaster.es/es/manager', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Get all button texts
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns).map(b => b.textContent?.trim()).filter(t => t);
    });
    console.log('Buttons found:', buttons);

    // Get all links
    const links = await page.evaluate(() => {
      const as = document.querySelectorAll('a');
      return Array.from(as).map(a => ({ text: a.textContent?.trim(), href: a.href })).filter(t => t.text);
    });
    console.log('Links found:', JSON.stringify(links, null, 2));

    // Take screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'dashboard_debug.png'), fullPage: true });
    console.log('Screenshot saved');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

run();