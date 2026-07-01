# 🎯 EscapeMaster Marketplace — Guía de Skills para Agentes IA

> **Documento de referencia permanente.** Consultar SIEMPRE antes de trabajar en cualquier parte del proyecto para saber qué skills utilizar.

---

## 📐 Arquitectura del Proyecto

### Estructura Multi-App (3 Repos Independientes)

```
marketplace/
├── master/        → Panel de administración (B2B) — master-escapemaster
├── web/
│   ├── frontend/  → Marketplace público (B2C) — escapemaster-market
│   └── api/        → Backend API — escapemaster-rooms-api
```

### Stack Tecnológico

| Capa                 | Tecnología              | Versión/Detalle                        |
| -------------------- | ----------------------- | -------------------------------------- |
| **Framework**        | Astro                   | 5.x, `output: 'server'`, SSR           |
| **UI Framework**     | React                   | 19.x (islands architecture)            |
| **Styling**          | Tailwind CSS            | v4 con `@tailwindcss/vite`             |
| **UI Components**    | Radix UI + CVA          | Dialog, Dropdown, Avatar, Separator    |
| **Icons**            | Lucide React            | —                                      |
| **Base de datos**    | PostgreSQL              | Conexión directa via `pg` (Pool)       |
| **Auth/Storage**     | Supabase                | Auth + Storage (web)                   |
| **State Management** | Nanostores              | Atoms para estado global (web)         |
| **Maps**             | Leaflet + React-Leaflet | Búsqueda por mapa (web)                |
| **Deploy**           | Dokploy                 | Adapter `@astrojs/node`                 |
| **i18n**             | Astro i18n nativo       | `es` (default) + `en`                  |
| **API externa**      | ERD Panel               | Disponibilidad de salas en tiempo real |
| **Lenguaje**         | TypeScript              | Estricto, ESM modules                  |

### Bases de Datos

| BD         | Uso                                            | Conexión              |
| ---------- | ---------------------------------------------- | --------------------- |
| `postgres` | BD principal (usuarios, rooms, orgs, bookings) | `DATABASE_URL`        |
| `baul`     | Almacén de escape rooms externos (scrapeados)  | `BAUL_DATABASE_URL`   |
| Supabase   | Auth, storage, RLS policies (games, themes)    | `PUBLIC_SUPABASE_URL` |

### Módulos Principales

#### `master/` — Panel Admin B2B

- Gestión de **rooms, organizaciones, usuarios, campañas, analytics**
- Dashboard de reservas con calendario (`CalendarReservations`)
- Integración con **ERD Panel** para disponibilidad en tiempo real
- Almacén externo (`/almacen`) con migración de salas
- API interna (`/api/auth`)

#### `web/` — Marketplace Público B2C

- **Buscador** de escape rooms con filtros avanzados
- **Mapa interactivo** (Leaflet) con geolocalización
- **Widget de reservas** integrado
- **Perfiles de usuario** (favoritos, historial, notificaciones)
- **Auth completa** (registro, login, forgot/reset password)
- **i18n** (español/inglés con routing por prefijo)
- Middleware de Astro para auth server-side
- API calls via endpoints internos

---

## 🛠️ Mapa de Skills por Contexto

### Siempre Usar (Core del Proyecto)

| Skill                  | Cuándo usarla                                                                |
| ---------------------- | ---------------------------------------------------------------------------- |
| **astro**              | SIEMPRE que trabajes con páginas `.astro`, routing, middleware, SSR, islands |
| **astro-framework**    | Para patrones avanzados de Astro (content collections, integrations)         |
| **react-expert**       | Cualquier componente `.tsx` (BookingWidget, MapSearch, AuthStatus, etc.)     |
| **typescript-pro**     | Todo el código del proyecto es TypeScript, tipos, interfaces                 |
| **tailwind-v4-shadcn** | Estilos, clases utilitarias, tema tropical, componentes UI                   |
| **frontend-design**    | Diseño de interfaces, componentes nuevos, UX/UI                              |

### Base de Datos y Backend

| Skill                                | Cuándo usarla                                           |
| ------------------------------------ | ------------------------------------------------------- |
| **postgres-pro**                     | Queries SQL, esquemas, pool de conexiones, `pg` driver  |
| **postgres-patterns**                | Patrones de diseño de BD, RLS, índices, migrations      |
| **supabase-postgres-best-practices** | Políticas RLS, auth con Supabase, storage               |
| **sql-pro**                          | Queries complejos, CTEs, window functions, optimización |
| **database-optimizer**               | Análisis de rendimiento, EXPLAIN, índices               |
| **backend-patterns**                 | API routes de Astro (`/api/auth`), middleware           |

### Auth y Seguridad

| Skill                    | Cuándo usarla                                          |
| ------------------------ | ------------------------------------------------------ |
| **secure-code-guardian** | Auth flow (login, registro, JWT), validación de inputs |
| **security-review**      | Review de endpoints, manejo de tokens, secrets         |
| **security-reviewer**    | Auditorías de seguridad del proyecto                   |

### Frontend Específico

| Skill                           | Cuándo usarla                                        |
| ------------------------------- | ---------------------------------------------------- |
| **frontend-patterns**           | State management (nanostores), hooks, performance    |
| **vercel-react-best-practices** | Optimización React, rendering patterns               |
| **i18n-expert**                 | Traducciones, archivo `ui.ts`, routing i18n de Astro |
| **coding-standards**            | Convenciones generales de código TS/React            |
| **javascript-pro**              | Lógica vanilla JS, ES2023+ features, async patterns  |

### API e Integraciones

| Skill                  | Cuándo usarla                             |
| ---------------------- | ----------------------------------------- |
| **api-designer**       | Diseño de nuevos endpoints, contratos API |
| **fullstack-guardian** | Features cross-stack (api → db → ui)      |

### Deploy e Infraestructura

| Skill               | Cuándo usarla                                   |
| ------------------- | ----------------------------------------------- |
| **devops-engineer** | CI/CD, Docker, deploy pipelines                 |
| **cloud-architect** | Arquitectura Vercel, edge functions, serverless |

### Testing y Calidad

| Skill                 | Cuándo usarla                              |
| --------------------- | ------------------------------------------ |
| **test-master**       | Estrategias de testing para el proyecto    |
| **playwright-expert** | Tests E2E del marketplace                  |
| **webapp-testing**    | Testing de la app web local con Playwright |
| **tdd-workflow**      | TDD al implementar features nuevas         |
| **code-reviewer**     | Reviews de código, PR quality              |

### Arquitectura y Diseño

| Skill                     | Cuándo usarla                         |
| ------------------------- | ------------------------------------- |
| **architecture-designer** | Decisiones arquitectónicas, ADRs      |
| **feature-forge**         | Definir nuevas features, user stories |
| **debugging-wizard**      | Investigar errores y bugs             |

### Documentación

| Skill               | Cuándo usarla                  |
| ------------------- | ------------------------------ |
| **docs-writer**     | Documentación técnica, READMEs |
| **code-documenter** | JSDoc, documentación de APIs   |

---

## 🎨 Convenciones del Proyecto

### Diseño (Paleta Tropical)

```css
--color-tropical-primary: #0097b2 /* Cyan principal */
  --color-tropical-secondary: #4db8a8 /* Turquesa */
  --color-tropical-bg: #f4e9cd /* Crema */ --color-tropical-accent: #f39c12
  /* Naranja CTA */ --color-tropical-text: #0d3d34 /* Verde oscuro */
  --color-tropical-card: #e8f5f3 /* Menta claro */;
```

### Componentes UI Compartidos

- `Badge`, `Button`, `Card`, `Table`, `Input` en `src/components/ui/`
- Basados en CVA (`class-variance-authority`) + `clsx` + `tailwind-merge`
- Radix UI para comportamiento (Dialog, Dropdown, Avatar)

### Componentes Compartidos entre Apps

- `CalendarReservations.tsx` compartido en `shared_vendor/`
- Patrón de inyección de dependencias (recibe `fetchAvailability` como prop)

### Patrones de Datos

- Conexión directa a PostgreSQL via `pg.Pool` (no ORM)
- Queries SQL crudos con parametrización (`$1`, `$2`)
- Supabase para auth y RLS en tablas públicas
- `nanostores` para estado client-side

### Routing

- **master/**: Sin prefijo de idioma (`/rooms`, `/users`)
- **web/**: Con prefijo de idioma (`/es/search`, `/en/game/[id]`)

### Deploy

- Vercel Serverless (SSR) para ambos apps
- API proxy: `vercel.json` rewrite `/api/*` → `api.escapemaster.es`

---

## � Modelo de Negocio (Fuente: PDFs corporativos)

### Concepto Core

EscapeMaster es una **plataforma-infraestructura híbrida (marketplace + SaaS)** que centraliza el ecosistema del escape room. Conecta jugadores y salas mediante buscador avanzado con disponibilidad real, sistema de reservas y pagos por persona, y herramientas de gestión.

**Principio operativo:** "Control = Garantía". Solo son reservas garantizadas aquellas gestionadas con el gestor de reservas propio de EscapeMaster.

### Clasificación de Escape Rooms (3 niveles)

| Nivel       | Nombre      | Descripción                                                                |
| ----------- | ----------- | -------------------------------------------------------------------------- |
| **Nivel 1** | Destacados  | Visibilidad premium mediante pujas por ciudad/comunidad                    |
| **Nivel 2** | Con Acuerdo | Permiten reservas desde EscapeMaster, etiqueta de reserva garantizada      |
| **Nivel 3** | Sin Acuerdo | Solo informativos, sin relación económica. "Disponibilidad no garantizada" |

### Modelo de Precios — Jugador (B2C)

- **0€** por uso de la plataforma
- **0,10€ – 0,50€** coste de gestión dinámico por jugador y reserva
- Cuanta más participación, menor coste para todos

| Tramo (últimos 12 meses) | Coste por reserva |
| ------------------------ | ----------------- |
| 0-5 reservas             | 0,50€             |
| 6-20 reservas            | 0,40€             |
| +20 reservas             | 0,30€             |

### Modelo de Precios — Escape Room (B2B)

| Concepto                   | Precio                                    |
| -------------------------- | ----------------------------------------- |
| Gestor de reservas propio  | **5% comisión**                           |
| Gestor de reservas externo | **8% comisión**                           |
| Destacados (Nivel 1)       | **Sistema de pujas** por ciudad/comunidad |
| Plan básico para afiliados | **Gratuito**                              |

### Sistema de Gamificación y Recurrencia

**Objetivo:** Transformar consumo puntual en uso recurrente. No ser "otra web para reservar" sino el lugar al que el jugador vuelve.

#### Progresión por Niveles (vitalicios, no se pierden)

| Nivel       | Hitos Obligatorios                                     |
| ----------- | ------------------------------------------------------ |
| **Nivel 2** | 5 reservas verificadas                                 |
| **Nivel 3** | 10 reservas + 5 reseñas + 1 funcionalidad clave        |
| **Nivel 4** | 15 reservas + 10 reseñas + 2 funcionalidades clave     |
| **Nivel 5** | 25 reservas + 15 reseñas + 2 reservas de ruta completa |

#### Beneficios Rolling (ventana 12 meses)

- Comisiones por reserva, descuentos puntuales y prioridades dependen del **uso reciente**
- Se reactivan por uso, sin castigo por inactividad temporal
- Histórico vitalicio (identidad) vs. beneficios rolling (económicos)

#### Sistema de Puntos

- Solo acciones reales suman (reservas verificadas, reseñas verificadas, uso de alertas, rutas completas)
- **Decay anual del 30%** para mantener uso continuo
- Se excluyen acciones de vanidad

### Servicios Fase 2 (Alto Valor)

| Servicio                | Descripción                                             |
| ----------------------- | ------------------------------------------------------- |
| **Ruta Completa**       | Agrupar varias reservas en una experiencia, aumenta GMV |
| **Reventa de Reservas** | Mercado secundario con fee, evita pérdida para usuario  |
| **Completar Equipo**    | Usuarios sin grupo encuentran compañeros de juego       |

### KPIs Clave

1. Reservas por usuario (12m)
2. % Usuarios recurrentes (≥2 reservas en 12m)
3. GMV por usuario (12m)
4. Distribución por niveles
5. Adopción servicios Fase 2
6. Margen por reserva

### Implementación Stripe

Stripe se usa para **ambos flujos**:

#### B2C — Pagos de Jugadores

- **Stripe Checkout / Payment Intents** para cobrar por reserva (0,10€ – 0,50€ por jugador)
- El jugador paga al reservar; el escape room cobra menos comisión de gestión
- Connect para split payments entre plataforma y escape room

#### B2B — Comisiones de Escape Rooms

- **Stripe Connect** para onboarding de escape rooms como cuentas conectadas
- Cobro automático de comisión (5%/8%) en cada reserva
- Liquidaciones semanales automáticas
- Sistema de pujas para Destacados (Nivel 1)

---

## �📋 Checklist Rápido: ¿Qué Skills Uso?

Antes de empezar cualquier tarea, hazte estas preguntas:

1. **¿Es una página `.astro`?** → `astro` + `astro-framework`
2. **¿Es un componente `.tsx`?** → `react-expert` + `typescript-pro`
3. **¿Toca estilos?** → `tailwind-v4-shadcn` + `frontend-design`
4. **¿Toca la BD?** → `postgres-pro` + `sql-pro`
5. **¿Toca Supabase?** → `supabase-postgres-best-practices`
6. **¿Es un endpoint API?** → `api-designer` + `backend-patterns`
7. **¿Toca auth?** → `secure-code-guardian` + `security-review`
8. **¿Toca traducciones?** → `i18n-expert`
9. **¿Es testing?** → `test-master` + `playwright-expert`
10. **¿Es arquitectura nueva?** → `architecture-designer` + `feature-forge`
11. **¿Es deploy/infra?** → `devops-engineer` + `cloud-architect`
12. **¿Es debugging?** → `debugging-wizard`

---

## 🔧 Skills Instaladas

### Preexistentes (66 skills)

Todas las skills listadas en las carpetas `~/.copilot/skills/` y `~/.claude/skills/`.

### Nuevas Instaladas para este Proyecto

| Skill                              | Fuente                          | Razón                            |
| ---------------------------------- | ------------------------------- | -------------------------------- |
| `astro`                            | astrolicious/agent-skills       | Framework principal del proyecto |
| `astro-framework`                  | delineas/astro-framework-agents | Patrones avanzados de Astro      |
| `supabase-postgres-best-practices` | supabase/agent-skills           | Auth y BD con Supabase           |
| `tailwind-v4-shadcn`               | jezweb/claude-skills            | Tailwind v4 + componentes style  |
| `i18n-expert`                      | daymade/claude-code-skills      | Internacionalización es/en       |
| `vercel-react-best-practices`      | vercel-labs/agent-skills        | Deploy y React optimizado        |

---

---

## 📄 Documentación del Proyecto

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `CLAUDE.md` | `/marketplace/` | Contexto global del agente (stack, BD, paleta, modelo negocio) |
| `CLAUDE.md` | `/marketplace/web/` | Contexto específico del marketplace B2C |
| `CLAUDE.md` | `/marketplace/master/` | Contexto específico del panel admin B2B |
| `SKILLS_GUIDE.md` | `/marketplace/` | Este archivo — mapa de skills y referencia técnica |
| `README.md` | `/marketplace/web/` | Documentación técnica del marketplace |
| `README.md` | `/marketplace/master/` | Documentación técnica del panel admin |

---

_Última actualización: 11 de febrero de 2026_
