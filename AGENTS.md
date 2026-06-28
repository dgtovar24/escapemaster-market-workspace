# AGENTS.md — EscapeMaster Marketplace

Este workspace co-localiza 5 repositorios git independientes. Debes `cd` al directorio correcto antes de correr comandos git o scripts npm.

## Estructura de Repositorios

| App/Package | Workspace Path | Repo en GitHub | Descripción |
|-------------|----------------|----------------|-------------|
| Frontend B2C | `web/frontend/` | `dgtovar24/escapemaster-market-frontend` | Astro 6 SSR + React 19, URL: https://escapemaster.es |
| API | `web/api/` | `dgtovar24/escapemaster-market-api` | Astro 5 SSR (Node), URLs: https://escapemaster.es/api/v1, https://dev.escapemaster.es/api/v2 |
| Master Admin | `master/` | `dgtovar24/escapemaster-market-admin-panel` | Astro 5 SSR (Node), URL: https://master.escapemaster.es |
| UI Lib | `packages/escapemaster-ui-components/` | `dgtovar24/escapemaster-branding-kit` | tsup + Vitest, paquete `@diegogzt/ui-components` |
| Deploy | `scripts/` | `dgtovar24/escapemaster-deploy` | Scripts bash + marketplace-stack.yml + Traefik middlewares |

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

### Branding Kit (`packages/escapemaster-ui-components/`)
- tsup (build) + Vitest (test)
- React 19 + Tailwind
- Componentes UI compartidos: `Badge`, `Button`, `Card`, `Container`, `GameCard`, `GameGrid`, `HeroBanner`, `Input`, `SectionContainer`, `SectionTitle`, `Table`
- **Build externo**: Se compila en el VPS con `npm install && npm run build`, luego `dist/` se copia al runner stage del Dockerfile de api/frontend/master

## Base de Datos

### Schema (28 tablas en `marketdb`)
- `users`, `players`, `organizations`, `games`, `rooms`, `bookings`, `marketplace_bookings`
- `calendars`, `room_schedules`, `reviews`
- `teams`, `team_members`, `user_routes`, `user_route_rooms`
- `conversations`, `messages`, `stripe_accounts`, `fee_config`
- `bidding_campaigns`, `user_milestones`, `points_history`
- `themes`, `room_themes` (de migration 004)
- `analytics_*` (5 tablas de analytics)
- `_migrations` (tracking)

### Sistema de migraciones
- Archivos en `web/api/migrations/NNN_*.sql`
- Tracking en tabla `_migrations`
- Aplicadas en orden por `scripts/apply-pending-migrations.sh --target={prod|dev}`

### Migraciones aplicadas
- `001_core_schema.sql`: Schema base (28 tablas)
- `003_analytics_schema.sql`: Tablas de analytics
- `004_full_room_schema.sql`: Columnas adicionales en rooms/games + tablas themes

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