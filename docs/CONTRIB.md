# Contributing — EscapeMaster Marketplace

Developer guide for local setup, scripts, and workflow.

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22.x (required — Astro 6 minimum) |
| npm | 10.x |
| PostgreSQL access | VPS localhost:5432 or Neon cloud |

## Project Structure

```
marketplace/
├── web/
│   ├── frontend/   → B2C marketplace (players)  — localhost:4321
│   └── api/        → Backend REST API            — localhost:8000
├── master/         → B2B admin panel (operators) — localhost:4322
├── packages/
│   └── escapemaster-ui-components/  → Shared UI library (pre-built, not in workspace)
└── docs/
```

> `web/api` is NOT part of the npm workspace. It has its own `node_modules`.  
> `packages/escapemaster-ui-components` is intentionally excluded from the workspace to avoid a Vite version conflict (see [Known Issues](#known-issues)).

## Environment Setup

### 1. Clone and install

```bash
git clone <repo>
cd marketplace
npm install          # installs web/frontend + master (workspace)
cd web/api && npm install  # install api separately
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in each app and fill in values:

```bash
cp web/frontend/.env.example web/frontend/.env
cp web/api/.env.example       web/api/.env
cp master/.env.example        master/.env
```

See [Environment Variables](#environment-variables) for details.

### 3. Start all services

```bash
./dev.sh    # starts all 3 in parallel
```

Or individually:

```bash
cd web/api      && npm run dev   # :8000
cd web/frontend && npm run dev   # :4321
cd master       && npm run dev   # :4322
```

> **macOS note:** Astro dev binds to IPv6 (`::1`) only — always access via `localhost` in the browser, not `127.0.0.1`.

## Scripts Reference

### Root workspace

| Script | Command |
|--------|---------|
| `./dev.sh` | Start all 3 services in parallel |
| `npm install` | Install workspace packages (web/frontend + master) |

### web/frontend — B2C Marketplace

| Script | Command | Port |
|--------|---------|------|
| `npm run dev` | `astro dev` | 4321 |
| `npm run dev:prod` | `NODE_ENV=production astro dev` | 4321 |
| `npm run build` | `astro build` | — |
| `npm run preview` | `astro preview` | — |

### web/api — Backend API

| Script | Command | Port |
|--------|---------|------|
| `npm run dev` | `astro dev --port 8000` | 8000 |
| `npm run build` | `astro build` | — |
| `npm run migrate` | `tsx scripts/auto-migrate.ts` | — |

### master — Admin Panel B2B

| Script | Command | Port |
|--------|---------|------|
| `npm run dev` | `astro dev --port 4322` | 4322 |
| `npm run dev:prod` | `NODE_ENV=production astro dev --port 4322` | 4322 |
| `npm run build` | `astro build` | — |
| `npm run migrate` | `tsx scripts/auto-migrate.ts` | — |
| `npm run clean-db` | `tsx scripts/clean-database.ts` | — |

## Environment Variables

### web/frontend

| Variable | Description | Local value |
|----------|-------------|-------------|
| `DATABASE_URL` | Direct PostgreSQL connection (for SSR) | `postgresql://root:...@localhost:5432/marketdb` |
| `BAUL_DATABASE_URL` | Secondary DB (imported room data) | same host |
| `PUBLIC_API_URL` | web/api base URL | `http://localhost:8000/v1/api` |
| `PUBLIC_CMS_API_URL` | master admin URL | `http://localhost:4322` |
| `PUBLIC_STRIPE_KEY` | Stripe publishable key (`pk_test_...`) | Stripe dashboard |
| `PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | GCP console |

### web/api

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection |
| `BAUL_DATABASE_URL` | Secondary baul DB |
| `JWT_SECRET` | HS256 signing secret (min 32 chars) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `REDSYS_ENVIRONMENT` | `test` or `production` |
| `REDSYS_MERCHANT_CODE` | TPV merchant code |
| `REDSYS_TERMINAL` | Terminal number (default `1`) |
| `REDSYS_SECRET_KEY` | Redsys HMAC secret |
| `RESEND_API_KEY` | Transactional email |
| `GOOGLE_CLIENT_ID` | Google OAuth (server-side) |
| `PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth (client-side) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage (optional) |
| `ANALYTICS_JOB_KEY` | API key for `/api/analytics/aggregate` cron |
| `CRON_SECRET` | API key for `/api/cron/*` endpoints |
| `ESCAPEMASTER_MANAGER_API_URL` | master URL for sync | `http://localhost:4322` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:4321` |
| `PUBLIC_API_URL` | Self-reference URL for redirects | `http://localhost:8000/v1` |

### master

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection |
| `BAUL_DATABASE_URL` | baul DB (scraped external rooms) |
| `MASTER_USER` | Admin username for login |
| `MASTER_PASS` | Admin password for login |
| `JWT_SECRET` | Same secret as web/api |
| `RESEND_API_KEY` | Transactional email |
| `PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth (server-side) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |

## Database

Both apps share the same `marketdb` PostgreSQL database. Schema has 70+ tables.

- **Local/dev:** VPS at `localhost:5432` (always-on)
- **Production (master):** Neon cloud (`*.neon.tech`)
- **No ORM** — all queries use `pg` directly with parameterized queries (`$1`, `$2`)

Run migrations:
```bash
cd web/api && npm run migrate
cd master  && npm run migrate
```

## Auth

- **web/frontend + web/api:** JWT (jose HS256, 7-day expiry). Stored in localStorage as `em_token`/`em_user`. Reactive via Nanostores.
- **master:** Cookie-based (`master_session`). Login via `GET /login?u=<user>&p=<pass>`.

## Coding Conventions

- **Colors:** always use `tropical-*` Tailwind classes — never hardcode hex or generic colors (`gray-900`, `blue-500`)
- **SQL:** parameterized queries only — never interpolate user input
- **Components:** CVA pattern (`cva` + `cn` + Radix UI)
- **Icons:** `lucide-react@0.562.0` pinned — do NOT upgrade to v1.x (brand icons removed)
- **Shared code:** `CalendarReservations.tsx` is duplicated in both `web/` and `master/` — changes must be applied to both copies

## Known Issues

### Vite 8 / rolldown conflict

`@tailwindcss/vite` and `@vitejs/plugin-react` are compiled against Vite 8 (which ships rolldown). Astro 6 uses Vite 7 internally. If vite@8 gets installed at the workspace root, `@vitejs/plugin-react` detects rolldown's presence via `rolldownVersion` and activates rolldown-specific plugins — causing `Missing field moduleType` 500 errors in dev mode.

**Fix already applied:** `package.json` at root pins `"vite": "^7"` as a `devDependency` AND `overrides`. If this ever regresses, run:

```bash
rm package-lock.json && npm install
# verify:
node -e "const v = require('./node_modules/vite/package.json'); console.log(v.version)"
# should print 7.x.x
```
