# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure — 3 Independent Git Repos

```
marketplace/
├── web/
│   ├── frontend/   → B2C Marketplace (jugadores) · escapemaster.es
│   └── api/        → Backend REST API · port 8000, base /v1/api
├── master/         → B2B Admin Panel (empresas) · master.escapemaster.es
├── packages/
│   └── escapemaster-ui-components/  → Shared UI lib (vitest tested)
└── docs/
```

- **npm workspace** at root includes `web/frontend` and `master` only
- **`web/api` is NOT in the workspace** — manage it separately
- Deploy: push to `main` → Dokploy auto-deploys each app independently
- **Node 22 required** — Astro 6 will fail to build with Node 20

## Development Commands

```bash
# Start all services in parallel (recommended)
./dev.sh          # API :8000 + Frontend :4321 + Master :4322

# Individual services
cd web/api && npm run dev          # :8000
cd web/frontend && npm run dev     # :4321
cd master && npm run dev           # :4322

# Build for production (Dokploy deploy)
cd web/frontend && npm run build
cd web/api && npm run build
cd master && npm run build

# Migrations
cd web/api && npm run migrate
cd master && npm run migrate

# Clean test data (master only)
cd master && npm run clean-db

# Run tests (packages/escapemaster-ui-components has vitest)
cd packages/escapemaster-ui-components && npm test
```

> **macOS note:** Astro dev binds IPv6 (`::1`) only. Always use `localhost` in browser, never `127.0.0.1`.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro SSR (`output: 'server'`) + React 19 islands — web/frontend & master: Astro 6, web/api: Astro 5 |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` block) |
| Components | Radix UI + CVA + clsx + tailwind-merge |
| Database | PostgreSQL direct via `pg` — NO ORM |
| Auth (web) | JWT (jose HS256, 7-day) + localStorage + Nanostores |
| Auth (master) | Cookie (`master_session`) — simple env var check |
| Payments | Stripe Checkout + Connect · Redsys (`redsys-easy`) |
| Storage | Cloudflare R2 (`@aws-sdk/client-s3`) |
| Email | AWS SES (web/frontend, master) · Resend (web/api) |
| i18n | Astro native · web: `/es/` `/en/` prefixed · master: Spanish only |

## Architecture

### Databases

| App | Host | Database |
|-----|------|----------|
| `web/api` + `web/frontend` | `localhost:5432` | `marketdb` |
| `master` | Neon cloud (`*.neon.tech`) | `neondb` + `baul` |

Both apps use two connection pools: `query()` (main postgres) and `queryBaul()` (warehouse).

Helper utilities: `tableExists(tableName)`, `columnExists(tableName, columnName)`.

### API Route Groups (web/api — base: `/v1/api/`)

`auth/` · `rooms/` · `payments/` · `bookings/` · `chat/` · `social/` · `players/` · `teams/` · `routes/` · `analytics/` · `uploads/` · `marketplace/` · `cron/` · `seed.ts`

All endpoints return: `{ success: boolean, data?: T, error?: string, meta?: { total, page, limit } }`

### React Island Hydration

- `client:load` — Header, HeroSearchBar, AuthStatus, MapSearch
- `client:visible` — BookingWidget, UserDashboard, ChatWidget, AdvancedFilters

### CMS System

Master serves CMS pages via its API. Web/frontend fetches them at build/request time via `PUBLIC_CMS_API_URL` (master's origin). CMS pages render dynamic section layouts via `CMSPageRenderer.tsx`.

### Analytics

Custom event batching system in web/frontend (`lib/tracking.ts`): `trackPageView()`, `trackClick()`, `trackAuth()` → batched POST to `/api/analytics/events`. Master has analytics export (Excel via exceljs) and click heatmap visualization.

## CRITICAL RULES

### 1. Tropical Color Palette — ALWAYS use `tropical-*` classes

```
tropical-primary:   #0097b2   tropical-secondary: #4db8a8
tropical-accent:    #f39c12   tropical-text:      #0d3d34
tropical-bg:        #ffffff   tropical-card:      #e8f5f3
```

**NEVER** hardcode hex colors or use generic Tailwind (`gray-900`, `blue-500`). Always use `bg-tropical-primary`, `text-tropical-text`, etc.

Master uses divergent tokens (see `master/src/styles/global.css`). Check `components-kit/divergences.md` for token-by-token differences.

### 2. SQL — Direct `pg`, Parameterized Only

```ts
import { query } from '../lib/db';
const { rows } = await query('SELECT * FROM rooms WHERE is_active = $1', [true]);
```
Always use `$1`, `$2` — never interpolate user input. **The column `booking_url` does NOT exist** — use `erd_url`.

### 3. lucide-react — Divergent Versions

- **web/frontend:** pinned at `0.562.0` — brand icons (`Facebook`, `Instagram`, `Twitter`) were removed in v1.x. **Do NOT upgrade** without replacing icons in `src/layouts/Layout.astro`.
- **master:** uses `lucide-react@1.7` — does not depend on brand icons.

### 4. Mobile-First

Touch targets >= 44px (`h-11`, `min-h-[44px]`), `touch-manipulation` on buttons, safe area padding (`safe-top`, `safe-bottom`). Design responsive: mobile → tablet → desktop.

### 5. Duplicated Code — Change Both Copies

`CalendarReservations.tsx` and `lib/r2.ts` exist independently in `web/` and `master/`. Changes must be applied to both.

## Common Issues

### `@vite/client` 500 in dev mode
Vite 8 installed at workspace root causes rolldown conflict with Astro's internal Vite 7. Fix:
```bash
rm package-lock.json && npm install  # at workspace root
# verify: node -e "console.log(require('./node_modules/vite/package.json').version)"  # should be 7.x
```
Root `package.json` pins `"overrides": { "vite": "^7" }` — this should prevent this.

### Docker cache — use `--no-cache` in Dokploy
Check **"No Cache"** in Dokploy deploy modal to force full rebuild. ADD URL cachebust trick doesn't work (GitHub API inaccessible from Dokploy build network).

### `PUBLIC_API_URL` in production
web/frontend's `.env` has `http://localhost:8000`. **Set this env var** in Dokploy to the real deployed API URL.

### Master login issues
Uses query params `GET /login?u=<user>&p=<pass>`. Common causes:
- Extra `.env.*` files overriding `MASTER_USER`/`MASTER_PASS`
- Quoted values in `.env` (`MASTER_USER="Randalls"` — parser includes quotes)
- Delete all except `.env`, use unquoted values

## Shared Code Between Apps

- **`shared_vendor/CalendarReservations.tsx`** — duplicated, not symlinked
- **UI components** (`ui/Badge.tsx`, `Button.tsx`, `Card.tsx`, `Table.tsx`) — same CVA pattern, significantly divergent implementations
- **`lib/db.ts`** — dual pool pattern in both apps
- **`lib/r2.ts`** — duplicated in web/frontend and master

## Key References

| Resource | Path |
|----------|------|
| Web app details | `web/CLAUDE.md` |
| Master app details | `master/CLAUDE.md` |
| API documentation | `docs/api/README.md` |
| Database schema (70+ tables) | `docs/api/database-schema.md` |
| Design system & components | `components-kit/README.md` |
| Web vs Master divergences | `components-kit/divergences.md` |
| Deployment guide | `docs/deployment/dokploy-guide.md` |
| Operations runbook | `docs/RUNBOOK.md` |
| Project backlog | `tasks/todo.md` |
| Project memory | `tasks/memory.md` |
