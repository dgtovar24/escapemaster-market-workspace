# Reporte Prueba de Usuario — EscapeMaster

**Fecha**: 2026-04-06T21:34:04.418Z  
**Usuario**: `tovard799@gmail.com`  
**Entorno**: Producción — https://escapemaster.es  

## Resumen Ejecutivo

| | |
|---|---|
| Páginas públicas analizadas | 15 |
| Errores totales | **1** |
| 🔴 CRÍTICOS | 0 |
| 🟠 ALTOS | 1 |
| 🟡 MEDIOS | 0 |
| ⚠️ Advertencias | 15 |

## Errores por Severidad

### 🟠 ALTO (1)

- **[FASE 2]** `https://escapemaster.es/es/register`  
  → Error del servidor: Este email ya está registrado  
  *2026-04-06T21:33:37.340Z*

## Advertencias

- **[FASE 1]** `https://escapemaster.es/en/`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/search`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/login`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/register`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/forgot-password`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/marketplace`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/offers`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/routes`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/teams`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/ayuda`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/faq`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/contacto`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/privacidad`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 1]** `https://escapemaster.es/es/terminos`  
  → 1 error(es) consola: Failed to load resource: the server responded with a status of 404 ()

- **[FASE 2]** `https://escapemaster.es/es/register`  
  → Estado indeterminado tras submit del registro

## Resultados Páginas Públicas

| Página | HTTP | URL Final | Errores Consola |
|--------|------|-----------|----------------|
| Home ES | 200 | — | 0 |
| Home EN | 200 | — | 1 |
| Búsqueda | 200 | — | 1 |
| Login | 200 | — | 1 |
| Registro | 200 | — | 1 |
| Olvidé contraseña | 200 | — | 1 |
| Marketplace | 200 | — | 1 |
| Ofertas | 200 | — | 1 |
| Rutas | 200 | — | 1 |
| Equipos | 200 | — | 1 |
| Ayuda | 200 | — | 1 |
| FAQ | 200 | — | 1 |
| Contacto | 200 | — | 1 |
| Privacidad | 200 | — | 1 |
| Términos | 200 | — | 1 |

## Fase 4: Cambio a Cuenta Empresa

✅ **Flujo encontrado y verificado**

- **Botón**: `#switchToEnterpriseBtn` en `/es/profile`
- **Dialog de confirmación**: "¿Estás seguro de que quieres convertir tu cuenta en una cuenta de Empresa?"
- **Acción tras confirmar**: Llama a auth.switchToEnterprise() → redirige a /es/onboarding

## Screenshots

Carpeta: `tasks/user-test-report/screenshots/`  
Total: 36 capturas

| # | Archivo | Fase |
|---|---------|------|
*(ver carpeta screenshots para todas las capturas numeradas)*
