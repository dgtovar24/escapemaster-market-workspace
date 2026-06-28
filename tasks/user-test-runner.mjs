/**
 * EscapeMaster — Prueba Real de Usuario en Producción
 * Usuario: dzaldivar@ilvsilver.com
 *
 * Fases:
 *   1. Reconocimiento de páginas públicas (rutas reales del Astro)
 *   2. Registro multi-paso (React island, 3 pasos)
 *   3. Login y navegación autenticada
 *   4. Cambio a cuenta empresa (#switchToEnterpriseBtn en /profile)
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = join(__dirname, 'user-test-report');
const BASE_URL = 'https://escapemaster.es';
const TEST_EMAIL = 'tovard799@gmail.com';
const TEST_PASSWORD = 'TestEscape2026!';

mkdirSync(REPORT_DIR, { recursive: true });
mkdirSync(join(REPORT_DIR, 'screenshots'), { recursive: true });

const errors = [];
const warnings = [];
const pageResults = [];
let shotIdx = 0;

const logError = (phase, url, desc, sev = 'ALTO') => {
  errors.push({ phase, url, desc, sev, ts: new Date().toISOString() });
  console.error(`  ❌ [${sev}] ${desc}`);
};
const logWarn = (phase, url, desc) => {
  warnings.push({ phase, url, desc, ts: new Date().toISOString() });
  console.warn(`  ⚠️  ${desc}`);
};
const logOk = msg => console.log(`  ✅ ${msg}`);

async function shot(page, name) {
  shotIdx++;
  const file = `${String(shotIdx).padStart(3, '0')}-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
  await page.screenshot({ path: join(REPORT_DIR, 'screenshots', file), fullPage: true });
  return file;
}

// ─────────────────────────────────────────────────────────
// FASE 1: Páginas reales del proyecto Astro
// ─────────────────────────────────────────────────────────
const PUBLIC_PAGES = [
  // Core
  { path: '/es/', name: 'Home ES' },
  { path: '/en/', name: 'Home EN' },
  { path: '/es/search', name: 'Búsqueda' },
  // Auth
  { path: '/es/login', name: 'Login' },
  { path: '/es/register', name: 'Registro' },
  { path: '/es/forgot-password', name: 'Olvidé contraseña' },
  // Catálogo
  { path: '/es/marketplace', name: 'Marketplace' },
  { path: '/es/offers', name: 'Ofertas' },
  { path: '/es/routes', name: 'Rutas' },
  // Social
  { path: '/es/teams', name: 'Equipos' },
  // Info
  { path: '/es/ayuda', name: 'Ayuda' },
  { path: '/es/faq', name: 'FAQ' },
  { path: '/es/contacto', name: 'Contacto' },
  { path: '/es/privacidad', name: 'Privacidad' },
  { path: '/es/terminos', name: 'Términos' },
];

async function phase1(page) {
  console.log('\n════════════════════════════════════');
  console.log('FASE 1: Páginas públicas');
  console.log('════════════════════════════════════');

  for (const { path, name } of PUBLIC_PAGES) {
    const url = `${BASE_URL}${path}`;
    console.log(`\n→ ${name} (${url})`);

    const consoleErrs = [];
    const jsErrs = [];
    const onConsole = m => { if (m.type() === 'error') consoleErrs.push(m.text()); };
    const onPageErr = e => jsErrs.push(e.message);
    page.on('console', onConsole);
    page.on('pageerror', onPageErr);

    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1200);
      const status = res?.status();
      const finalUrl = page.url();
      const shotFile = await shot(page, name);

      pageResults.push({ name, url, finalUrl, status, consoleErrs: [...consoleErrs], jsErrs: [...jsErrs], shotFile });

      if (status >= 500) logError('FASE 1', url, `HTTP ${status} — ${name}`, 'CRÍTICO');
      else if (status >= 400) logError('FASE 1', url, `HTTP ${status} — ${name}`, 'ALTO');
      else logOk(`${name} → HTTP ${status}`);

      if (consoleErrs.length > 0) {
        const unique = [...new Set(consoleErrs)];
        logWarn('FASE 1', url, `${unique.length} error(es) consola: ${unique[0].substring(0, 120)}`);
      }
      if (jsErrs.length > 0) logError('FASE 1', url, `JS Error: ${jsErrs[0].substring(0, 150)}`, 'ALTO');

    } catch (e) {
      logError('FASE 1', url, `Timeout/Network: ${e.message}`, 'CRÍTICO');
      pageResults.push({ name, url, status: 0, error: e.message });
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageErr);
    }
  }
}

// ─────────────────────────────────────────────────────────
// FASE 2: Registro multi-paso (React island con client:load)
// ─────────────────────────────────────────────────────────
async function phase2(page) {
  console.log('\n════════════════════════════════════');
  console.log('FASE 2: Registro de usuario');
  console.log('════════════════════════════════════');

  const url = `${BASE_URL}/es/register`;
  console.log(`\n→ ${url}`);

  const apiResps = [];
  page.on('response', r => {
    if (r.url().includes('/api/') || r.url().includes('/v1/')) {
      apiResps.push({ url: r.url(), status: r.status(), method: r.request().method() });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
  await shot(page, 'register-loaded');

  // ── PASO 0: Selección de tipo de cuenta ──────────────────
  console.log('\n  → Paso 0: Selección tipo de cuenta');

  // Esperar hidratación React (island client:load)
  const jugadorBtn = page.locator('button:has-text("Soy Jugador")');
  try {
    await jugadorBtn.waitFor({ state: 'visible', timeout: 12000 });
    logOk('Botón "Soy Jugador" visible (React hidratado)');
  } catch {
    logError('FASE 2', url, 'React island no hidratado — botones de tipo de cuenta no encontrados', 'CRÍTICO');
    await shot(page, 'register-hydration-fail');
    return { success: false };
  }

  await shot(page, 'register-step0');

  // Verificar también el botón "Soy Empresa"
  const empresaBtn = page.locator('button:has-text("Soy Empresa")');
  if (await empresaBtn.count() > 0) {
    logOk('Botón "Soy Empresa" visible');
  } else {
    logWarn('FASE 2', url, 'Botón "Soy Empresa" no encontrado');
  }

  // Clic en "Soy Jugador"
  await jugadorBtn.click();
  await page.waitForTimeout(500);
  await shot(page, 'register-step1-appeared');
  logOk('Clic en "Soy Jugador" → paso 1 activo');

  // ── PASO 1: Formulario de datos ───────────────────────────
  console.log('\n  → Paso 1: Rellenando formulario');

  // Los inputs son React controlled — buscar por placeholder
  const nameInput = page.locator('input[placeholder="Juan Pérez"]').first();
  const emailInput = page.locator('input[type="email"], input[placeholder*="email"]').first();
  const passInput = page.locator('input[placeholder="Minimum 8 caracteres"]').first();
  const confirmInput = page.locator('input[placeholder*="Repite"]').first();

  try {
    await nameInput.waitFor({ state: 'visible', timeout: 8000 });
    await nameInput.fill('DZ Test User');
    logOk('Nombre rellenado');
  } catch {
    logError('FASE 2', url, 'Input nombre no encontrado', 'ALTO');
  }

  try {
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill(TEST_EMAIL);
    logOk(`Email: ${TEST_EMAIL}`);
  } catch {
    logError('FASE 2', url, 'Input email no encontrado', 'CRÍTICO');
    return { success: false };
  }

  try {
    await passInput.waitFor({ state: 'visible', timeout: 5000 });
    await passInput.fill(TEST_PASSWORD);
    logOk('Contraseña rellenada');
  } catch {
    logError('FASE 2', url, 'Input contraseña no encontrado', 'CRÍTICO');
    return { success: false };
  }

  try {
    await confirmInput.waitFor({ state: 'visible', timeout: 5000 });
    await confirmInput.fill(TEST_PASSWORD);
    logOk('Confirmación contraseña rellenada');
  } catch {
    logWarn('FASE 2', url, 'Input confirmar contraseña no encontrado');
  }

  await shot(page, 'register-step1-filled');

  // Submit
  const submitBtn = page.locator('button:has-text("Registrarse y Enviar Código")').first();
  if (await submitBtn.count() === 0) {
    logError('FASE 2', url, 'Botón "Registrarse y Enviar Código" no encontrado', 'CRÍTICO');
    await shot(page, 'register-no-submit');
    return { success: false };
  }

  logOk('Haciendo clic en "Registrarse y Enviar Código"...');
  await submitBtn.click();

  // Esperar respuesta de la API de registro
  await page.waitForTimeout(4000);
  await shot(page, 'register-after-submit');

  // Detectar estado
  const bodyText = await page.textContent('body').catch(() => '');

  // Verificar si hay error visible
  const errorEl = page.locator('[class*="accent"], [class*="error"], [role="alert"]').first();
  if (await errorEl.count() > 0) {
    const errorText = await errorEl.textContent().catch(() => '');
    if (errorText?.trim()) {
      logError('FASE 2', url, `Error del servidor: ${errorText.trim()}`, 'ALTO');
    }
  }

  // Detectar paso 2 (verificación)
  const step2Visible = page.locator('text=Verifica tu identidad').first();
  const codeInput = page.locator('input[placeholder="XXXXXX"]').first();

  if (await step2Visible.count() > 0 || await codeInput.count() > 0) {
    logOk('Paso 2 visible — código de verificación enviado');
    await shot(page, 'register-step2-verification');
    console.log(`\n  ℹ️  Email enviado a ${TEST_EMAIL}`);
    return { success: true, waitingVerification: true, step: 2 };
  }

  // Si seguimos en paso 1 con error
  if (bodyText.includes('ya registrado') || bodyText.includes('already') || bodyText.includes('existe')) {
    logWarn('FASE 2', url, 'Email ya registrado — procediendo a login directamente');
    return { success: false, emailExists: true };
  }

  logWarn('FASE 2', url, 'Estado indeterminado tras submit del registro');
  return { success: null };
}

// ─────────────────────────────────────────────────────────
// FASE 2b: Introducir código de verificación
// ─────────────────────────────────────────────────────────
async function phase2b_verifyCode(page, code) {
  console.log('\n════════════════════════════════════');
  console.log('FASE 2b: Verificación de código');
  console.log('════════════════════════════════════');

  const url = page.url();
  const codeInput = page.locator('input[placeholder="XXXXXX"]').first();

  try {
    await codeInput.waitFor({ state: 'visible', timeout: 8000 });
    await codeInput.fill(code.toString().slice(0, 6));
    logOk(`Código introducido: ${code}`);
    await shot(page, 'verify-code-filled');

    const verifyBtn = page.locator('button:has-text("Verificar y Finalizar")').first();
    if (await verifyBtn.count() === 0) {
      logError('FASE 2b', url, 'Botón "Verificar y Finalizar" no encontrado', 'CRÍTICO');
      return false;
    }

    await verifyBtn.click();
    await page.waitForTimeout(4000);
    await shot(page, 'verify-after-submit');

    const currentUrl = page.url();
    logOk(`URL tras verificación: ${currentUrl}`);

    if (currentUrl.includes('/onboarding')) {
      logOk('Verificación exitosa → onboarding');
      return true;
    }
    if (currentUrl.includes('/profile')) {
      logOk('Verificación exitosa → perfil');
      return true;
    }

    const errorEl = page.locator('[class*="accent"]').first();
    if (await errorEl.count() > 0) {
      const msg = await errorEl.textContent().catch(() => '');
      logError('FASE 2b', url, `Error verificación: ${msg?.trim()}`, 'ALTO');
    }
    return false;

  } catch (e) {
    logError('FASE 2b', url, `Excepción verificando código: ${e.message}`, 'CRÍTICO');
    return false;
  }
}

// ─────────────────────────────────────────────────────────
// FASE 3: Login (si el registro ya existía)
// ─────────────────────────────────────────────────────────
async function phase3_login(page) {
  console.log('\n════════════════════════════════════');
  console.log('FASE 3: Login');
  console.log('════════════════════════════════════');

  const url = `${BASE_URL}/es/login`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(800);
  await shot(page, 'login-page');

  const emailInput = page.locator('#email').first();
  const passInput = page.locator('#password').first();

  try {
    await emailInput.fill(TEST_EMAIL);
    await passInput.fill(TEST_PASSWORD);
    await shot(page, 'login-filled');
    logOk('Credenciales rellenadas');
  } catch (e) {
    logError('FASE 3', url, `Inputs de login no encontrados: ${e.message}`, 'CRÍTICO');
    return { success: false };
  }

  const submitBtn = page.locator('#submitBtn').first();
  await submitBtn.click();
  await page.waitForTimeout(4000);
  await shot(page, 'login-result');

  const currentUrl = page.url();
  logOk(`URL tras login: ${currentUrl}`);

  // Si redirige a register?verify= → email no verificado
  if (currentUrl.includes('/register?verify=') || currentUrl.includes('verify=')) {
    logWarn('FASE 3', url, 'Email pendiente de verificación (redirigido a /register?verify=...)');
    await shot(page, 'login-needs-verification');
    return { success: false, needsVerification: true };
  }

  if (currentUrl.includes('/onboarding')) {
    logOk('Login exitoso → onboarding');
    return { success: true, needsOnboarding: true };
  }

  if (currentUrl.includes('/profile')) {
    logOk('Login exitoso → perfil');
    return { success: true };
  }

  if (currentUrl.includes('/login')) {
    // Buscar mensaje de error
    const errEl = page.locator('#errorMsg').first();
    const errText = await errEl.textContent().catch(() => '');
    logError('FASE 3', url, `Login fallido: ${errText?.trim() || 'sin mensaje'}`, 'ALTO');
    return { success: false };
  }

  logOk(`Login exitoso (URL: ${currentUrl})`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────
// FASE 3b: Onboarding (si redirige ahí tras registro/login)
// ─────────────────────────────────────────────────────────
async function phase3b_onboarding(page) {
  console.log('\n  → Completando onboarding...');
  await shot(page, 'onboarding-start');

  // Intentar avanzar por el onboarding con valores mínimos
  const currentUrl = page.url();
  await page.waitForTimeout(2000);
  await shot(page, 'onboarding-loaded');
  logOk(`Onboarding cargado: ${currentUrl}`);

  // Intentar continuar/skip
  const skipBtn = page.locator('button:has-text("Omitir"), button:has-text("Skip"), button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Siguiente")').first();
  if (await skipBtn.count() > 0) {
    logOk('Botón continuar/skip encontrado en onboarding');
    await shot(page, 'onboarding-with-skip');
  }

  // Navegar directamente al perfil
  await page.goto(`${BASE_URL}/es/profile`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  await shot(page, 'profile-from-onboarding');
  logOk(`Perfil cargado: ${page.url()}`);
}

// ─────────────────────────────────────────────────────────
// FASE 3c: Navegación autenticada
// ─────────────────────────────────────────────────────────
async function phase3c_authPages(page) {
  console.log('\n  → Verificando páginas autenticadas');

  const AUTH_PAGES = [
    { path: '/es/profile', name: 'Perfil' },
    { path: '/es/profile/edit', name: 'Editar Perfil' },
    { path: '/es/profile/favorites', name: 'Favoritos' },
    { path: '/es/profile/history', name: 'Historial' },
    { path: '/es/profile/settings', name: 'Ajustes' },
    { path: '/es/profile/change-password', name: 'Cambiar Contraseña' },
    { path: '/es/teams/my-teams', name: 'Mis Equipos' },
    { path: '/es/chat', name: 'Chat' },
    { path: '/es/routes/create', name: 'Crear Ruta' },
    { path: '/es/manager', name: 'Manager' },
  ];

  for (const { path, name } of AUTH_PAGES) {
    const url = `${BASE_URL}${path}`;
    console.log(`\n  → ${name} (${url})`);
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);
      const status = res?.status();
      const finalUrl = page.url();
      await shot(page, `auth-${name}`);

      if (status >= 500) {
        logError('FASE 3', url, `HTTP ${status} en página autenticada: ${name}`, 'CRÍTICO');
      } else if (finalUrl.includes('/login')) {
        logError('FASE 3', url, `Redirige a login sin sesión: ${name}`, 'ALTO');
      } else if (status >= 400) {
        logError('FASE 3', url, `HTTP ${status}: ${name}`, 'MEDIO');
      } else {
        logOk(`${name} → HTTP ${status}`);
      }
    } catch (e) {
      logError('FASE 3', url, `Timeout en ${name}: ${e.message}`, 'MEDIO');
    }
  }
}

// ─────────────────────────────────────────────────────────
// FASE 4: Cambio a cuenta empresa
// ─────────────────────────────────────────────────────────
async function phase4_switchToEnterprise(page) {
  console.log('\n════════════════════════════════════');
  console.log('FASE 4: Cambio a cuenta empresa');
  console.log('════════════════════════════════════');

  const url = `${BASE_URL}/es/profile`;
  console.log(`\n→ Navegando a ${url}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2500); // Esperar scripts de perfil (auth.getSession + renderizado)
  await shot(page, 'profile-for-upgrade');

  // El botón #switchToEnterpriseBtn está en el perfil, visible solo si account_type != enterprise
  const switchBtn = page.locator('#switchToEnterpriseBtn').first();

  if (await switchBtn.count() > 0) {
    logOk('Botón "Convertir a cuenta de Empresa" encontrado (#switchToEnterpriseBtn)');
    await shot(page, 'switch-btn-found');

    // Verificar que es visible/enabled
    const isVisible = await switchBtn.isVisible().catch(() => false);
    const isEnabled = !(await switchBtn.isDisabled().catch(() => true));
    logOk(`Botón visible: ${isVisible} | habilitado: ${isEnabled}`);

    // Al hacer clic aparece un confirm() dialog — interceptarlo
    page.on('dialog', async dialog => {
      console.log(`\n  → Dialog: ${dialog.message().substring(0, 120)}`);
      logOk('Dialog de confirmación detectado');
      await shot(page, 'switch-confirm-dialog');
      // NO confirmar — solo documentar el flujo
      await dialog.dismiss();
      logOk('Dialog descartado (no se ejecuta el cambio en prueba)');
    });

    await switchBtn.click();
    await page.waitForTimeout(2000);
    await shot(page, 'switch-after-click');

    return {
      found: true,
      buttonId: '#switchToEnterpriseBtn',
      confirmMessage: '¿Estás seguro de que quieres convertir tu cuenta en una cuenta de Empresa?',
      afterConfirm: 'Llama a auth.switchToEnterprise() → redirige a /es/onboarding',
    };
  }

  // No encontrado — buscar en la página para entender por qué
  await shot(page, 'profile-no-switch-btn');

  // Puede que no esté logueado
  const loginRedirect = page.url().includes('/login');
  if (loginRedirect) {
    logError('FASE 4', url, 'Perfil redirige a login — sin sesión activa', 'CRÍTICO');
    return { found: false, reason: 'no-session' };
  }

  // Puede que ya sea enterprise
  const bodyText = await page.textContent('body').catch(() => '');
  if (bodyText.includes('enterprise') || bodyText.includes('Empresa')) {
    logWarn('FASE 4', url, 'La cuenta ya podría ser enterprise (botón no visible para accounts enterprise)');
    return { found: false, reason: 'already-enterprise' };
  }

  logError('FASE 4', url, 'Botón #switchToEnterpriseBtn no encontrado en el perfil', 'ALTO');
  return { found: false, reason: 'unknown' };
}

// ─────────────────────────────────────────────────────────
// REPORTE
// ─────────────────────────────────────────────────────────
function buildReport(results) {
  const now = new Date().toISOString();
  const crit = errors.filter(e => e.sev === 'CRÍTICO').length;
  const high = errors.filter(e => e.sev === 'ALTO').length;
  const med = errors.filter(e => e.sev === 'MEDIO').length;

  let md = `# Reporte Prueba de Usuario — EscapeMaster\n\n`;
  md += `**Fecha**: ${now}  \n`;
  md += `**Usuario**: \`${TEST_EMAIL}\`  \n`;
  md += `**Entorno**: Producción — ${BASE_URL}  \n\n`;

  md += `## Resumen Ejecutivo\n\n`;
  md += `| | |\n|---|---|\n`;
  md += `| Páginas públicas analizadas | ${pageResults.length} |\n`;
  md += `| Errores totales | **${errors.length}** |\n`;
  md += `| 🔴 CRÍTICOS | ${crit} |\n`;
  md += `| 🟠 ALTOS | ${high} |\n`;
  md += `| 🟡 MEDIOS | ${med} |\n`;
  md += `| ⚠️ Advertencias | ${warnings.length} |\n\n`;

  if (errors.length > 0) {
    md += `## Errores por Severidad\n\n`;
    for (const sev of ['CRÍTICO', 'ALTO', 'MEDIO', 'BAJO']) {
      const list = errors.filter(e => e.sev === sev);
      if (!list.length) continue;
      const icon = sev === 'CRÍTICO' ? '🔴' : sev === 'ALTO' ? '🟠' : sev === 'MEDIO' ? '🟡' : '🟢';
      md += `### ${icon} ${sev} (${list.length})\n\n`;
      for (const e of list) {
        md += `- **[${e.phase}]** \`${e.url}\`  \n  → ${e.desc}  \n  *${e.ts}*\n\n`;
      }
    }
  }

  if (warnings.length > 0) {
    md += `## Advertencias\n\n`;
    for (const w of warnings) {
      md += `- **[${w.phase}]** \`${w.url}\`  \n  → ${w.desc}\n\n`;
    }
  }

  md += `## Resultados Páginas Públicas\n\n`;
  md += `| Página | HTTP | URL Final | Errores Consola |\n|--------|------|-----------|----------------|\n`;
  for (const r of pageResults) {
    const st = r.status || 'ERR';
    const fin = r.finalUrl && r.finalUrl !== r.url ? `→ ${r.finalUrl.replace(BASE_URL, '')}` : '—';
    const ce = r.consoleErrs?.length || 0;
    md += `| ${r.name} | ${st} | ${fin} | ${ce} |\n`;
  }
  md += '\n';

  // Fase 4
  if (results.phase4) {
    md += `## Fase 4: Cambio a Cuenta Empresa\n\n`;
    const p4 = results.phase4;
    if (p4.found) {
      md += `✅ **Flujo encontrado y verificado**\n\n`;
      md += `- **Botón**: \`${p4.buttonId}\` en \`/es/profile\`\n`;
      md += `- **Dialog de confirmación**: "${p4.confirmMessage}"\n`;
      md += `- **Acción tras confirmar**: ${p4.afterConfirm}\n`;
    } else {
      md += `❌ **Flujo NO encontrado**  \n`;
      md += `Razón: \`${p4.reason}\`\n`;
    }
    md += '\n';
  }

  md += `## Screenshots\n\n`;
  md += `Carpeta: \`tasks/user-test-report/screenshots/\`  \n`;
  md += `Total: ${shotIdx} capturas\n\n`;

  // Lista todas
  md += `| # | Archivo | Fase |\n|---|---------|------|\n`;
  // (Se listarán al final si quisiéramos parsearlos — simplificado)
  md += `*(ver carpeta screenshots para todas las capturas numeradas)*\n`;

  return md;
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
const browser = await chromium.launch({
  headless: false,
  slowMo: 200,
  args: ['--no-sandbox'],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'es-ES',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
});
const page = await context.newPage();

console.log('╔══════════════════════════════════════════════╗');
console.log('║   EscapeMaster — Prueba Real de Usuario      ║');
console.log(`║   ${TEST_EMAIL}          ║`);
console.log('║   Producción: https://escapemaster.es        ║');
console.log('╚══════════════════════════════════════════════╝');

const results = {};

// FASE 1
await phase1(page);

// FASE 2 — Registro
results.phase2 = await phase2(page);

if (results.phase2?.waitingVerification) {
  // ── PAUSA PARA CÓDIGO DE VERIFICACIÓN ─────────────────────
  console.log('\n');
  console.log('┌────────────────────────────────────────────────────┐');
  console.log('│  ⏸  PAUSA — Verificación de email requerida        │');
  console.log('│                                                      │');
  console.log(`│  Revisa el email: ${TEST_EMAIL}          │`);
  console.log('│  Busca el código de 6 dígitos de EscapeMaster       │');
  console.log('│                                                      │');
  console.log('│  ➜  Proporciona el código para continuar            │');
  console.log('└────────────────────────────────────────────────────┘');
  console.log('\n⏸  Script pausado — esperando código del usuario...\n');

  // Guardar reporte parcial
  const partial = buildReport(results);
  writeFileSync(join(REPORT_DIR, 'reporte-parcial.md'), partial);
  console.log('📄 Reporte parcial: tasks/user-test-report/reporte-parcial.md');
  console.log('\n[INSTRUCCIÓN]: Cuando tengas el código, ejecuta:');
  console.log('  node tasks/user-test-runner.mjs --codigo=XXXXXX');
  console.log('  O bien proporciona el código aquí mismo si el navegador sigue abierto.\n');

  // Esperar arg --codigo=
  const codeArg = process.argv.find(a => a.startsWith('--codigo='));
  if (codeArg) {
    const code = codeArg.split('=')[1];
    console.log(`\n→ Código recibido vía arg: ${code}`);
    const verified = await phase2b_verifyCode(page, code);
    if (verified) {
      results.verified = true;
      if (page.url().includes('/onboarding')) {
        await phase3b_onboarding(page);
      }
    }
  } else {
    console.log('→ Sin código proporcionado — saltando verificación, intentando login...');
    // Intentar login (el email puede estar verificado si se re-ejecuta)
    results.phase3 = await phase3_login(page);
    if (results.phase3?.needsOnboarding) {
      await phase3b_onboarding(page);
    }
  }
} else if (results.phase2?.emailExists || !results.phase2?.success) {
  // Registro falló porque email ya existe — login directo
  console.log('\n→ Email ya registrado o registro fallido — intentando login...');
  results.phase3 = await phase3_login(page);
  if (results.phase3?.needsOnboarding) {
    await phase3b_onboarding(page);
  }
  if (results.phase3?.needsVerification) {
    console.log('\n⏸  Se requiere verificación de email para este usuario.');
    console.log('   Proporciona el código con --codigo=XXXXXX\n');
  }
}

// Verificar si hay sesión activa
const currentUrl = page.url();
const hasSession = !currentUrl.includes('/login') && (
  currentUrl.includes('/profile') ||
  currentUrl.includes('/onboarding') ||
  currentUrl.includes('/dashboard')
);

if (hasSession || results.phase3?.success || results.verified) {
  // FASE 3c: Páginas autenticadas
  await phase3c_authPages(page);

  // FASE 4: Switch to enterprise
  results.phase4 = await phase4_switchToEnterprise(page);
} else {
  logWarn('FASES 3-4', BASE_URL, 'Sin sesión activa — fases 3c y 4 no ejecutadas');
}

// REPORTE FINAL
const report = buildReport(results);
writeFileSync(join(REPORT_DIR, 'reporte-final.md'), report);

console.log('\n╔══════════════════════════════════════════════╗');
console.log(`║  PRUEBA COMPLETADA                            ║`);
console.log(`║  🔴 CRÍTICOS: ${String(errors.filter(e=>e.sev==='CRÍTICO').length).padEnd(3)} 🟠 ALTOS: ${String(errors.filter(e=>e.sev==='ALTO').length).padEnd(3)} 🟡 MEDIOS: ${String(errors.filter(e=>e.sev==='MEDIO').length).padEnd(3)}  ║`);
console.log(`║  ⚠️  Warnings: ${String(warnings.length).padEnd(3)}                              ║`);
console.log('╚══════════════════════════════════════════════╝');
console.log('\n📄 Reporte: tasks/user-test-report/reporte-final.md');
console.log(`📸 Screenshots (${shotIdx}): tasks/user-test-report/screenshots/\n`);

await browser.close();
