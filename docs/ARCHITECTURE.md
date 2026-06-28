# Arquitectura — EscapeMaster Marketplace (v1.1.0)

Documento vivo que describe la arquitectura actual del marketplace. Última actualización: 2026-06-28.

## Vista General

```
Internet (HTTPS)
     │
     ▼
   Traefik (Swarm provider, Let's Encrypt, port 80/443)
     │
     ├─── escapemaster.es ───────────────┐
     │    ├─ /api/v1/*  → market_api-v1   │──┐
     │    ├─ / (resto)   → market_frontend-prod │ │
     │    └─ www.*       → 301 redirect   │  │
     │                                  │  │
     ├─── dev.escapemaster.es ──────────┐ │  │
     │    ├─ /api/v2/*  → market_api-v2   │──┤  │
     │    ├─ / (resto)   → market_frontend-dev │ │  │
     │    └─ www.*       → 301 redirect   │  │  │
     │                                  │  │  │
     ├─── master.escapemaster.es ───────┐│  │  │
     │    └─ /           → market_master  ││  │  │
     │                                  ││  │  │
     │   (red overlay network: escapemaster-network)
     │                                  │  │  │
     ▼                                  ▼  ▼  ▼
  escapemaster-market-postgres-prod (5432) ┘  │
       └─ marketdb (28+ tables)              │
                                              │
  escapemaster-market-postgres-dev  (5432) ───┘
       └─ marketdb (28+ tables, mismo schema)
```

## Componentes

### Frontend B2C (escapemaster.es / dev.escapemaster.es)
- **Stack**: Astro 6 SSR + React 19 (islands) + Tailwind v4 + Nanostores + jose
- **Repos**:
  - `dgtovar24/escapemaster-market-frontend` (prod)
- **Imagen**: `escapemaster-market-frontend-prod:latest`, `escapemaster-market-frontend-dev:latest`
- **Puerto interno**: 3101 (prod), 3102 (dev)
- **Variables baked al build** (necesario rebuild para cambiar):
  - `PUBLIC_API_URL` — URL pública de la API (`https://escapemaster.es/api/v1` o `https://dev.escapemaster.es/api/v2`)
  - `PUBLIC_STRIPE_KEY`, `PUBLIC_GOOGLE_CLIENT_ID`, `PUBLIC_CMS_API_URL`, `R2_PUBLIC_BASE_URL`

### API (escapemaster.es/api/v1, dev.escapemaster.es/api/v2)
- **Stack**: Astro 5 SSR (Node standalone) + jose (JWT) + pg directo + Resend + AWS SDK (R2)
- **Repo**: `dgtovar24/escapemaster-market-api`
- **Imagen**: `escapemaster-market-api-v1:latest`
- **Puerto interno**: 9101 (v1), 9102 (v2)
- **Variables runtime** (env vars del servicio Swarm):
  - `DATABASE_URL` — apunta a `escapemaster-market-postgres-prod` o `escapemaster-market-postgres-dev` según entorno
  - `PUBLIC_API_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `R2_*`, etc.

### Master / Admin (master.escapemaster.es)
- **Stack**: Astro 5 SSR + React 19 + Tailwind v4 + Radix UI + CVA
- **Repo**: `dgtovar24/escapemaster-market-admin-panel`
- **Imagen**: `escapemaster-market-master:latest`
- **Puerto interno**: 3103
- **Auth**: Cookie `master_session` con `secure: true` en producción
- **DB**: Comparte `marketdb_prod` con el frontend B2C (lee/escribe las mismas tablas)

### Branding Kit (workspace dep)
- **Stack**: tsup + Vitest
- **Repo**: `dgtovar24/escapemaster-branding-kit`
- **Estado**: Componentes UI compartidos (Button, Card, Badge, Container, etc.) — empaquetado como `@diegogzt/ui-components`
- **Build**: Ejecutado fuera de Docker (en el VPS con `npm install && npm run build`), luego `dist/` se copia al runner stage

### PostgreSQL (servicios Swarm)
- **Imagen**: `postgres:16-alpine`
- **Servicios**:
  - `escapemaster-market-postgres-prod` (5432, vol `marketdata-prod`)
  - `escapemaster-market-postgres-dev` (5432, vol `marketdata-dev`)
- **Schema**: 28 tablas + `_migrations` (tracking)
- **Migraciones**: `web/api/migrations/NNN_*.sql`
- **Acceso**: Solo desde la red overlay `escapemaster-network` (no expuesto a internet)

## Entornos y URLs

| Entorno | Dominio | API | DB |
|---------|---------|-----|-----|
| Producción | `escapemaster.es` | `https://escapemaster.es/api/v1/*` | `marketdb_prod` |
| Pre-producción | `dev.escapemaster.es` | `https://dev.escapemaster.es/api/v2/*` | `marketdb_dev` |
| Master admin | `master.escapemaster.es` | n/a (consume API directamente) | `marketdb_prod` |
| Redirect | `www.escapemaster.es`, `www.dev.escapemaster.es` | 301 → no-www | n/a |

## Estructura del Workspace

```
marketplace/                    ← repo local, NO versionado
├── web/
│   ├── api/                    → dgtovar24/escapemaster-market-api
│   │   ├── src/pages/api/
│   │   │   ├── v1/             ← prod endpoints (60+ rutas)
│   │   │   └── v2/             ← dev endpoints (rooms, health)
│   │   ├── migrations/         ← 001_core, 003_analytics, 004_room_schema
│   │   ├── scripts/
│   │   │   ├── apply-pending-migrations.sh
│   │   │   ├── build-api-image.sh
│   │   │   ├── deploy-dev-stack.sh
│   │   │   ├── deploy-prod-stack.sh
│   │   │   ├── health-check.sh
│   │   │   ├── bump-version.sh
│   │   │   ├── import-escapeup.ts
│   │   │   ├── sync-room-from-game.ts
│   │   │   └── ...
│   │   └── Dockerfile          (Node 22, :9101)
│   └── frontend/               → dgtovar24/escapemaster-market-frontend
│       └── Dockerfile          (Node 22, :3101)
├── master/                     → dgtovar24/escapemaster-market-admin-panel
│   └── Dockerfile              (Node 22, :3103)
├── packages/
│   └── escapemaster-ui-components/  → dgtovar24/escapemaster-branding-kit
└── scripts/                     → dgtovar24/escapemaster-deploy
    ├── marketplace-stack.yml    (docker compose v3.8)
    ├── create-marketplace-services.sh  (legacy)
    ├── deploy/
    │   ├── traefik-middlewares.yml
    │   ├── traefik-www-redirects.yml
    │   └── check_traefik_routers.py
    └── .env                     (secrets, chmod 600, NO commiteado)
```

## Networking

- **Red overlay Swarm**: `escapemaster-network` (Driver: overlay, ID: `y4egtu5licxw8aa77w2md2lix`)
- **Todos los servicios** (incluyendo Traefik y las DBs) están conectados a esta red.
- Los servicios se resuelven por DNS interno: `market_api-v1`, `escapemaster-market-postgres-prod`, etc.
- Sin puertos publicados al host (excepto Traefik: 80, 443, 8080).

## Traefik Routing

### Routers Swarm (creados desde labels de servicios Swarm)
| Router | Rule | Service | Priority | Middleware |
|--------|------|---------|----------|------------|
| `market-api-v1@swarm` | `Host(escapemaster.es) && PathPrefix(/api/v1)` | `market-api-v1` | 48 | - |
| `market-api-v2@swarm` | `Host(dev.escapemaster.es) && PathPrefix(/api/v2)` | `market-api-v2` | 52 | - |
| `market-frontend-prod@swarm` | `Host(escapemaster.es) && !PathPrefix(/api/v1) && !PathPrefix(/api/v2)` | `market-frontend-prod` | 1 | - |
| `market-frontend-dev@swarm` | `Host(dev.escapemaster.es) && !PathPrefix(/api/v1) && !PathPrefix(/api/v2)` | `market-frontend-dev` | 1 | - |
| `market-master@swarm` | `Host(master.escapemaster.es)` | `market-master` | 30 | - |

### Routers File (estáticos desde `/etc/escapemaster/traefik/dynamic/`)
| Router | Rule | Middleware |
|--------|------|------------|
| `acme-http@internal` | `PathPrefix(/.well-known/acme-challenge/)` | - |
| `market-www-prod@file` | `Host(www.escapemaster.es)` | `www-to-nonwww` |
| `market-www-dev@file` | `Host(www.dev.escapemaster.es)` | `www-to-nonwww-dev` |

### Middlewares
| Middleware | Tipo | Propósito |
|-----------|------|-----------|
| `redirect-to-https` | redirectScheme | Fuerza HTTPS |
| `www-to-nonwww` | redirectRegex | Redirige www → no-www en prod |
| `www-to-nonwww-dev` | redirectRegex | Redirige www → no-www en dev |

## Variables de Entorno (secrets)

### Donde se almacenan
- **VPS** (`/opt/escapemaster-market/scripts/.env`, chmod 600) — usado por `docker stack deploy`
- **GitHub Secrets** (futuro) — para que los workflows CI/CD funcionen sin intervención manual

### Lista completa
```bash
# API y Frontend
JWT_SECRET=<32+ chars>
PUBLIC_GOOGLE_CLIENT_ID=<google oauth client id>
GOOGLE_CLIENT_SECRET=<google oauth secret>
RESEND_API_KEY=re_xxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxx (prod) / sk_test_xxxx (dev)
PUBLIC_STRIPE_KEY=pk_live_xxxx (prod) / pk_test_xxxx (dev)

# Master admin
MASTER_USER=<username>
MASTER_PASS=<password>

# Cloudflare R2 (imágenes)
R2_ACCOUNT_ID=<account id>
R2_ACCESS_KEY_ID=<access key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET_NAME=master
R2_ENDPOINT=https://<account>.eu.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://<public id>.r2.dev

# Database
PROD_DB_PASSWORD=<40 char random>
DEV_DB_PASSWORD=<40 char random>
```

### Cómo regenerar passwords de DB
```bash
ssh root@157.90.157.178
PROD_NEW=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
echo "PROD_NEW=$PROD_NEW"
# Actualizar /opt/escapemaster-market/scripts/.env
# Recrear el servicio Swarm con el nuevo password:
docker service update \
  --env-add "POSTGRES_PASSWORD=$PROD_NEW" \
  escapemaster-market-postgres-prod
# IMPORTANTE: el volumen marketdata-prod preserva los datos, solo cambia el password
```

## Configuración DNS

| Dominio | Tipo | Valor |
|---------|------|-------|
| `escapemaster.es` | A | `157.90.157.178` |
| `dev.escapemaster.es` | A | `157.90.157.178` |
| `master.escapemaster.es` | A | `157.90.157.178` |
| `www.escapemaster.es` | A | `157.90.157.178` (redirect, no necesita config especial) |
| `www.dev.escapemaster.es` | A | `157.90.157.178` (opcional) |

Traefik + Let's Encrypt se encargan automáticamente de obtener los certs al primer request HTTPS.

## Sistema de Migraciones

### Cómo funciona
1. Cada archivo `web/api/migrations/NNN_*.sql` tiene prefijo numérico (001, 002, etc.).
2. `apply-pending-migrations.sh` lee los archivos en orden, consulta `_migrations` para ver cuáles están aplicados, y aplica solo los nuevos.
3. Cada archivo aplicado se registra en `_migrations` con timestamp.
4. La transacción SQL es atómica por archivo: si falla, el deploy falla y la DB queda en estado anterior.

### Workflows CI/CD invocan
- `deploy-dev.yml` → `apply-pending-migrations.sh --target=dev` → actualiza DB dev antes de desplegar
- `deploy-prod.yml` → `apply-pending-migrations.sh --target=prod` → actualiza DB prod antes de desplegar

### Migraciones actuales
| Archivo | Descripción |
|--------|-------------|
| `001_core_schema.sql` | Schema base (28 tablas): users, organizations, games, rooms, bookings, calendars, etc. |
| `003_analytics_schema.sql` | Tablas de analytics: events, sessions, page_views, heatmap_clicks, booking_funnels, daily_metrics |
| `004_full_room_schema.sql` | Columnas adicionales en `rooms` y `games` (city, price, image, themes, etc.) + tablas `themes` y `room_themes` |

## Coexistencia con el gestor de reservas

El VPS `157.90.157.178` ya aloja el marketplace de reservas del gestor (servicios `escapemaster-*` en prefijo simple). Para evitar conflictos:

- **Prefijo de servicios marketplace**: `escapemaster-market-*` para DBs, `market_*` para Swarm stack
- **Prefijo de imágenes**: `escape-market-*` para imágenes locales, `escapemaster-market-*` para Swarm stack
- **Prefijo de routers Traefik**: `market-*` (los del gestor usan nombres sin prefijo)

Si Traefik reporta "Router frontend-prod cannot be linked automatically with multiple Services" — es un bug pre-existente del gestor, no del marketplace.

## Anti-patrones evitados

- **NO** se usan las imágenes `escape-market-*` directamente en Swarm. Cada imagen se re-etiqueta como `escapemaster-market-*` antes del deploy.
- **NO** se commitea `.env` (excluido por `.gitignore` y `.dockerignore`).
- **NO** se hace push de `node_modules` al repo (excluido por `.dockerignore`).
- **NO** se cambia el git config global a `Diego Gabriel Zaldivar Tovar` — se mantiene como `dgtovar24`.

## Próximos pasos sugeridos

- [ ] Configurar self-hosted runner de GitHub Actions en el VPS
- [ ] Configurar DNS para `www.dev.escapemaster.es` (opcional)
- [ ] Crear workflow de rollback manual (`rollback.yml`)
- [ ] Configurar alertas Prometheus/Grafana para Traefik y servicios
- [ ] Implementar rate limiting en la API (Traefik middleware `rateLimit`)
- [ ] Migrar DBs a réplicas read-only para mejor performance