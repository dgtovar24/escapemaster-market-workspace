# AGENTS.md — EscapeMaster Marketplace

Este workspace co-localiza 8 repositorios git independientes que forman 2 productos íntimamente relacionados: **Marketplace B2C + Admin B2B** y **Gestor de Reservas B2B**. Comparten la DB `marketdb`. Debes `cd` al directorio correcto antes de correr comandos git o scripts npm.

## Estructura de Repositorios

### Marketplace + Admin
| App/Package | Workspace Path | Repo en GitHub | Descripción |
|-------------|----------------|----------------|-------------|
| Frontend B2C | `web/frontend/` | `dgtovar24/escapemaster-market-frontend` | Astro 6 SSR + React 19, URL: https://escapemaster.es |
| API | `web/api/` | `dgtovar24/escapemaster-market-api` | Astro 5 SSR (Node), URLs: https://escapemaster.es/api/v1, https://dev.escapemaster.es/api/v2 |
| Master Admin | `master/` | `dgtovar24/escapemaster-market-admin-panel` | Astro 5 SSR (Node), URL: https://master.escapemaster.es |
| UI Lib | `packages/escapemaster-ui-components/` | `dgtovar24/escapemaster-branding-kit` | tsup + Vitest, paquete `@diegogzt/ui-components` |

### Booking Manager (comparten `marketdb` con marketplace)
| App/Package | Workspace Path | Repo en GitHub | Descripción |
|-------------|----------------|----------------|-------------|
| Gestor de Reservas (frontend) | `booking-manager/` (symlink a `my-manager`) | `dgtovar24/my-manager` | Next.js 16 + React 19 + Tailwind v4 + dashboard widgets, URL: https://my.escapemaster.es |
| Gestor de Reservas (API) | `booking-manager-api/` (symlink a `my-manager-api`) | `dgtovar24/my-manager-api` | Rust + Axum 0.7 + sqlx 0.7, URL: https://my.escapemaster.es/api/v1 |

### Infra
| App/Package | Workspace Path | Repo en GitHub | Descripción |
|-------------|----------------|----------------|-------------|
| Deploy | `scripts/` | `dgtovar24/escapemaster-deploy` | Scripts bash + marketplace-stack.yml + Traefik middlewares |
| Deploy Orchestrator | `.escapemaster-platform-deploy/` (symlink a `escapemaster-platform`) | `dgtovar24/escapemaster-platform` | Orquestador de deploys (CI/CD + scripts para my-manager y my-manager-api) |

> **NOTA:** `web/api` NO está en el workspace npm. Debes `cd` allí y manejar sus dependencias por separado.

## Arquitectura de Despliegue

Stack: **Docker Swarm + Traefik + PostgreSQL**, NO Dokploy, NO Vercel.

### Entornos
| Entorno | Dominio | API path | DB |
|---------|---------|----------|-----|
| Producción | `escapemaster.es` | `/api/v1/*` | `marketdb_prod` (Postgres prod) |
| Pre-producción | `dev.escapemaster.es` | `/api/v2/*` | `marketdb_dev` (Postgres dev) |
| Master admin | `master.escapemaster.es` | (consume API directamente) | `marketdb_prod` |

### Servicios Swarm (prefijo `market_*` para evitar conflictos con el gestor)
| Servicio | Imagen | Puerto interno | Sirve |
|----------|--------|---------------|-------|
| `escapemaster-market-postgres-prod` | postgres:16-alpine | 5432 | DB prod (vol `marketdata-prod`) |
| `escapemaster-market-postgres-dev` | postgres:16-alpine | 5432 | DB dev (vol `marketdata-dev`) |
| `market_api-v1` | escapemaster-market-api-v1:latest | 9101 | prod API |
| `market_api-v2` | escapemaster-market-api-v1:latest | 9102 | dev API |
| `market_frontend-prod` | escapemaster-market-frontend-prod:latest | 3101 | prod frontend |
| `market_frontend-dev` | escapemaster-market-frontend-dev:latest | 3102 | dev frontend |
| `market_master` | escapemaster-market-master:latest | 3103 | admin panel |

### URLs públicas finales
- `https://escapemaster.es/` → frontend prod
- `https://escapemaster.es/api/v1/*` → API prod
- `https://dev.escapemaster.es/` → frontend dev
- `https://dev.escapemaster.es/api/v2/*` → API dev
- `https://master.escapemaster.es/` → admin panel
- `https://www.escapemaster.es/` → 301 redirect a `escapemaster.es`

## Comandos Principales

### Deploy (desde VPS `157.90.157.178`)
```bash
# Cargar secrets
set -a && source /opt/escapemaster-market/scripts/.env && set +a

# Desplegar/actualizar todo el stack
docker stack deploy --compose-file /opt/escapemaster-market/scripts/marketplace-stack.yml market

# Aplicar migraciones pendientes
docker exec $(docker ps -q -f name=market_api-v1 | head -1) \
  sh -c "cd /app && DATABASE_URL=\$DATABASE_URL /usr/local/bin/apply-pending-migrations.sh --target=prod"
```

### Build local de imágenes
```bash
# Las imágenes se construyen EN EL VPS porque el Docker local es x86_4 (roto en Mac arm64)
ssh root@157.90.157.178
cd /opt/escapemaster-market
docker build --no-cache -t escapemaster-market-api-v1:latest -f web/api/Dockerfile .
docker build --no-cache -t escapemaster-market-frontend-prod:latest --build-arg PUBLIC_API_URL=https://escapemaster.es/api/v1 -f web/frontend/Dockerfile .
docker build --no-cache -t escapemaster-market-master:latest -f master/Dockerfile .

# Re-etiquetar para Swarm stack
docker tag escapemaster-market-api-v1:latest escapemaster-market-frontend-prod:latest
docker tag escapemaster-market-api-v1:latest escapemaster-market-frontend-dev:latest
docker tag escapemaster-market-api-v1:latest escapemaster-market-master:latest
```

### Aplicar migraciones manualmente
```bash
PROD_DB=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
docker cp migrations/004_full_room_schema.sql $PROD_DB:/tmp/
docker exec $PROD_DB psql -U root -d marketdb -v ON_ERROR_STOP=1 -f /tmp/004_full_room_schema.sql
```

### Importar datos de EscapeUp
```bash
CURRENT=$(docker ps -q -f name=market_api-v1 | head -1)
docker cp scripts/import-escapeup.ts $CURRENT:/app/scripts/
docker exec $CURRENT sh -c "cd /app && DATABASE_URL=\$DATABASE_URL npx tsx scripts/import-escapeup.ts --limit=998"
docker exec $CURRENT sh -c "cd /app && DATABASE_URL=\$DATABASE_URL npx tsx scripts/sync-room-from-game.ts"
```

## Stack Técnico por App

### Frontend (`web/frontend/`)
- Astro 6 SSR (`output: 'server'`, `@astrojs/node`) · Node 22
- React 19 (islands: `client:load`, `client:visible`)
- Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` block en `global.css`)
- PostgreSQL directo (`pg` — NO ORM)
- Stripe 20.x (Checkout Sessions)
- Leaflet (MapSearch)
- Nanostores (estado client-side: `$user`, `$token`)
- jose + bcryptjs (auth JWT propia)
- Resend (email transaccional)
- i18n: `es`/`en`, prefixed (`/es/search`, `/en/search`)
- Analytics: custom event batching (`lib/tracking.ts`) + recharts + exceljs + heatmap.js
- **Variables bakeadas al build** (no runtime): `PUBLIC_API_URL`, `PUBLIC_STRIPE_KEY`, `PUBLIC_GOOGLE_CLIENT_ID`, `PUBLIC_CMS_API_URL`, `R2_PUBLIC_BASE_URL`

### API (`web/api/`)
- Astro 5 SSR (`output: 'server'`, `@astrojs/node` standalone) · Node 22
- pg directo (NO ORM) — `query()` y `pool` desde `src/lib/db.ts`
- jose (JWT HS256)
- Resend (email)
- AWS SDK v3 (S3 para R2, SES)
- Stripe (Checkout + Connect)
- axios (cliente HTTP para EscapeUp API)
- **NO usa lucide-react, ni bcryptjs** — solo jose
- **NO tiene base path** — las rutas son nativamente `/api/v1/...`
- **Estructura**: `src/pages/api/v1/*` (prod endpoints, 60+ rutas) + `src/pages/api/v2/*` (dev endpoints: rooms, health)

### Master (`master/`)
- Astro 5 SSR (`@astrojs/node`) · Node 22
- React 19 (islands interactivas)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- PostgreSQL directo (`pg`, `query()` y `pool` desde `src/lib/db.ts`)
- Radix UI + CVA (componentes UI)
- i18n: solo español (sin prefijo de idioma)
- **Auth**: cookie `master_session` con `secure: true` en producción
- **DB**: comparte `marketdb_prod` con frontend B2C

### Booking Manager — Frontend (`booking-manager/` → `my-manager`)
- Next.js 16 (App Router, React 19, server components, server actions)
- Tailwind v4 con `@theme` block y theming engine (8+ presets de paletas)
- Zustand (estado global client-side) + React Context (Theme, Auth)
- Axios (data fetching) con `NEXT_PUBLIC_API_URL` apuntando a `booking-manager-api`
- `react-grid-layout` (dashboard widgets con drag/resize/persistencia)
- recharts (gráficos), lucide-react (iconos), @ai-sdk/* (integraciones IA), dnd-kit
- **Dashboard widgets**: sistema modular con persistencia en localStorage + backend
- **HR management**: rutas `/hr-management`, `/time-tracking`, `/roles`
- **Tests**: vitest (unit) + Playwright (e2e) en `e2e/`
- **Variables bakeadas al build**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_MODE` (`gestor` | `resident`)
- **URLs**: dev `:3001`, prod `https://my.escapemaster.es`

### Booking Manager — API (`booking-manager-api/` → `my-manager-api`)
- Rust 1.x + Axum 0.7 + tokio + tower-http (CORS)
- sqlx 0.7 con `query!` / `query_as!` macros (validación compile-time contra DB)
- jsonwebtoken 9 (JWT HS256, claims custom: user_id, organization_id, is_superuser, simulated_*)
- bcrypt 0.15 (password hashing)
- chrono + uuid + rust_decimal
- **Comparten DB con marketplace** (`marketdb`): las migraciones del booking manager AÑADEN tablas y columnas sobre el schema del marketplace
- **40+ tablas exclusivas**: `roles`, `user_organizations`, `bookings` (extendido), `room_*`, `employee_schedules`, `booking_extras`, `booking_guests`, `external_integrations`, `api_projects`, `api_keys`, `coupons`, `chat_*`, `curated_collections`, `dashboard_templates`, `blocked_slots`, `developer_clients`, etc.
- **Columnas añadidas a `organizations`**: `legal_name`, `tax_id`, `verification_status`, `invitation_code` (UNIQUE), `booking_manager`, `erd_url`, `widget_commission_rate`, `marketplace_commission_rate`, etc.
- **URLs**: dev `:9001`, prod `https://my.escapemaster.es/api/v1` (v1) / `https://mydev.escapemaster.es/api/v2` (v2)
- **NO** usa ORMs — sqlx queries crudas
- **Auth**: extractor custom `AuthorizedUser` que valida el JWT y expone `auth.user` a los handlers
- **Endpoints clave**:
  - `/api/v1/auth/{login,register,refresh,me,logout,onboard}` 
  - `/api/v1/auth/sso` (futuro, para SSO desde master)
  - `/api/v1/organizations/{list,create,get,update,delete}` + `/:id/invite`
  - `/api/v1/bookings/*` con `source_channel` enum (marketplace, widget, direct, api)
  - `/api/v1/users/:id/invite`, `/api/v1/squads/:id/invite`
  - `/api/v1/developers/*` (OAuth clients, API keys)

### Vinculación Marketplace ↔ Booking Manager

Las dos apps **comparten la DB `marketdb`** pero **no comparten auth**. El flujo de "vincular" hoy:

1. Master admin entra a `/organizations/{id}` → click "Generar enlace al gestor" → backend crea `invitation_code` (16 hex)
2. Link generado: `{PUBLIC_BOOKING_MANAGER_URL}/invite/{code}`
3. Owner hace click → cae en `/invite/{code}` en my-manager → register con `invitation_code` en el body
4. my-manager-api consume el code, crea `user` + `user_organizations` (auto-vinculado a la org)

**Tablas clave compartidas**: `organizations`, `rooms`, `users`, `players`, `bookings`. CUALQUIER ALTER o DROP en estas debe coordinarse con `db-expert` raíz.

### Branding Kit (`packages/escapemaster-ui-components/`)
- tsup (build) + Vitest (test)
- React 19 + Tailwind
- Componentes UI compartidos: `Badge`, `Button`, `Card`, `Container`, `GameCard`, `GameGrid`, `HeroBanner`, `Input`, `SectionContainer`, `SectionTitle`, `Table`
- **Build externo**: Se compila en el VPS con `npm install && npm run build`, luego `dist/` se copia al runner stage del Dockerfile de api/frontend/master

## Base de Datos

### Schema (70+ tablas en `marketdb` — compartido entre marketplace + booking manager)

**Marketplace (29 tablas en `web/api/migrations/`):**
- `users`, `players`, `organizations`, `games`, `rooms`, `bookings`, `marketplace_bookings`
- `calendars`, `room_schedules`, `reviews`
- `teams`, `team_members`, `user_routes`, `user_route_rooms`
- `conversations`, `messages`, `stripe_accounts`, `fee_config`
- `bidding_campaigns`, `user_milestones`, `points_history`
- `themes`, `room_themes` (de migration 004)
- `analytics_*` (5 tablas de analytics)
- `_migrations` (tracking)

**Booking Manager añade 40+ tablas en `booking-manager-api/migrations/`:**
- `roles`, `role_permissions`, `user_organizations` (membership N:M)
- `bookings` extendido con `source_channel`, `payment_method`, etc.
- `external_integrations`, `api_projects`, `api_keys`, `org_api_keys`, `developer_clients`
- `blocked_slots`, `booking_extras`, `booking_guests`, `booking_commissions`
- `employee_schedules`, `timeclock`, `vacation`, `level`, `payout`, `invoice`
- `chat_sessions`, `chat_messages`, `coupons`, `promo`, `gdpr_signatures`
- `curated_collections`, `dashboard_templates`, `api_keys`, `widget`
- `collection_rooms`, `room_extras`, `room_notification_recipient`, `integration_calendar_*`
- `achievement`, `level`, `tpv`, `split_payment`, `payment`, `review` (extendido)
- `erd_connections`, `erd_sync_state`, `erd_migration_sessions` (EscapeRoomData.com)
- `email_templates`, `email_verifications`, `email_notification_deliveries`
- `ai_usage_events`, `api_keys`, `migration_job`, `password_reset`
- `notification`, `squad`, `timeclock`, `achievement`, `integration_calendar_blocked_dates`
- Y más...

### Sistema de migraciones
- **Marketplace**: archivos en `web/api/migrations/NNN_*.sql`, tracking en tabla `_migrations`
- **Booking manager**: archivos en `booking-manager-api/migrations/*.sql`, aplicados con su propio `cargo run --bin migrate`
- Ambos deben coordinarse vía `db-expert` raíz si tocan las 5 tablas compartidas (`organizations`, `rooms`, `users`, `players`, `bookings`)

### Migraciones marketplace aplicadas (local dev)
- `001_core_schema.sql`: Schema base (28 tablas)
- `003_analytics_schema.sql`: Tablas de analytics
- `004_full_room_schema.sql`: Columnas adicionales en rooms/games + tablas themes
- `005_add_username_column.sql`: Añade columnas faltantes que el código referenciaba pero las migraciones previas no creaban (`username`, `onboarding_completed`, `account_type`, `organization_id`, `last_login`, `hashed_password` rename, players: `xp/rank/referral_code/etc`) + `organizations.invitation_code` y `organizations.booking_manager`

## Traefik + Routing

### Routers Swarm (auto-generados desde labels de servicios)
| Router | Rule | Service | Priority |
|--------|------|---------|----------|
| `market-api-v1@swarm` | `Host(escapemaster.es) && PathPrefix(/api/v1)` | `market-api-v1` | 48 |
| `market-api-v2@swarm` | `Host(dev.escapemaster.es) && PathPrefix(/api/v2)` | `market-api-v2` | 52 |
| `market-frontend-prod@swarm` | `Host(escapemaster.es) && !PathPrefix(/api/v1) && !PathPrefix(/api/v2)` | `market-frontend-prod` | 1 |
| `market-frontend-dev@swarm` | `Host(dev.escapemaster.es) && !PathPrefix(/api/v1) && !PathPrefix(/api/v2)` | `market-frontend-dev` | 1 |
| `market-master@swarm` | `Host(master.escapemaster.es)` | `market-master` | 30 |

### Routers File (estáticos en `/etc/escapemaster/traefik/dynamic/`)
- `market-www-prod@file`: `Host(www.escapemaster.es)` + middleware `www-to-nonwww` → 301
- `market-www-dev@file`: `Host(www.dev.escapemaster.es)` + middleware `www-to-nonwww-dev` → 301

### Middlewares
- `redirect-to-https`: fuerza HTTPS
- `www-to-nonwww`, `www-to-nonwww-dev`: redirect regex
- **NO usar** `strip-api` (ya no es necesario desde 1.1.0)

## Secrets

### Ubicación
- **VPS**: `/opt/escapemaster-market/scripts/.env` (chmod 600, NO commiteado)
- **GitHub**: secrets del repo (futuro, para CI/CD)

### Variables requeridas
```bash
PROD_PG_PASS, DEV_PG_PASS    # Passwords de Postgres
JWT_SECRET                   # Secret de tokens JWT
RESEND_API_KEY               # Resend email
STRIPE_SECRET_KEY, PUBLIC_STRIPE_KEY  # Stripe
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_BASE_URL  # Cloudflare R2
PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET  # Google OAuth
MASTER_USER, MASTER_PASS     # Admin panel
```

## Convenciones

### Conventional Commits
- `feat:` → minor bump (1.1.0 → 1.2.0)
- `fix:` → patch bump (1.1.0 → 1.1.1)
- `feat!:` o `BREAKING CHANGE:` → major bump
- `chore:`, `docs:`, `refactor:`, `test:` → no bump
- `[skip-version]` en PR → no bumpea
- `[force-major|minor|patch]` → fuerza bump

### Git Config Global
- `user.name = dgtovar24`
- `user.email = dgtovar24@users.noreply.github.com`
- `credential.helper = !/opt/homebrew/bin/gh auth git-credential`

### Stack Traefik
- Las labels Traefik van en `services.X.deploy.labels` (NO en `services.X.labels`) para que se apliquen a `Spec.Labels` y el Swarm provider las detecte.
- Los archivos en `/etc/escapemaster/traefik/dynamic/` tienen mount rw (no ro).

### Astro Config
- `output: 'server'` con `@astrojs/node` mode standalone
- **NO usar** `base: '/api'` (causa doble `/api/api/v1/...` en URLs)
- Las rutas se sirven nativamente en `/api/v1/...` (vía estructura de carpetas `src/pages/api/v1/`)

### Dockerfiles
- Siempre `FROM node:22-alpine` (requerido por Astro 6)
- Alpine necesita `@rollup/rollup-linux-x64-musl` (workaround para bug de npm con optional dependencies)
- `.dockerignore` excluye `node_modules`, `dist`, `.env`
- **NO incluir `docker-pre-start.sh` en el CMD** — solo para Dokploy (no se usa en Swarm)

### Estilos
- **SIEMPRE usar tokens `tropical-*`** (`bg-tropical-primary`, `text-tropical-text`, etc.) — NUNCA hex hardcoded ni `gray-900`
- Tailwind v4 con `@theme` block en `global.css`
- Componentes UI compartidos en `src/components/ui/` (Button, Card, Badge, Container, etc.)

## Problemas Comunes

### "Frontend shows no data"
- DB vacía → correr `import-escapeup.ts` + `sync-room-from-game.ts`
- Ver: `psql -c "SELECT count(*) FROM public.games"`

### "401 en /api/v1/rooms"
- Conflicto entre `pages/api/v1/rooms.ts` (público) y `pages/api/v1/rooms/index.ts` (admin)
- Solución: renombrar el directorio admin a `rooms-admin/`

### "Traefik: acme.json read-only"
- Cambiar mount a `readonly=false`: `docker service update --mount-rm/--mount-add`

### "Container restarts loop"
- Ver logs: `docker service logs market_api-v1 --tail 50`
- Verificar `manifest_*.mjs` existe: `docker exec $C ls /app/dist/server/manifest_*.mjs`

### "Routers @docker en lugar de @swarm"
- Las labels están en `ContainerSpec.Labels` pero deben estar en `Spec.Labels`
- Usar `services.X.deploy.labels` en compose, no `services.X.labels`

## Recursos

- **Documentación detallada**: `docs/ARCHITECTURE.md`, `docs/DEPLOY.md`
- **Changelog**: `CHANGELOG.md`
- **Versión actual**: `VERSION` (1.1.0)
- **Workflows CI/CD**: `.github/workflows/{ci,deploy-dev,deploy-prod}.yml` en cada repo
- **Scripts deploy**: `dgtovar24/escapemaster-deploy` (marketplace-stack.yml + scripts)

## Anti-patrones

- ❌ NO subir `node_modules`, `dist`, `.env` a ningún repo
- ❌ NO cambiar `git config --global` (usar el global dgtovar24)
- ❌ NO usar `docker service create` para los market-* (usar `docker stack deploy`)
- ❌ NO incluir `docker-pre-start.sh` en el CMD de los Dockerfiles (es solo para Dokploy legacy)
- ❌ NO usar `base: '/api'` en astro.config.mjs
- ❌ NO mezclar `pages/api/v1/rooms.ts` con `pages/api/v1/rooms/` (genera conflicto)