# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **`AGENTS.md` is the authoritative operational guide** (deploy topology, Swarm/Traefik, full DB schema, git config, anti-patterns). This file is the fast orientation + the rules that bite while coding. When they disagree, trust `AGENTS.md` and the actual `package.json` / config files.

## Codebase Memory — query the knowledge graph FIRST

This workspace is indexed in the `codebase-memory-mcp` knowledge graph (project **`Users-dgtovar-Work-marketplace`**). For **any** code exploration, tracing, or impact analysis, use the graph tools **before** reaching for grep/glob — they return precise structural results in a fraction of the tokens.

- `search_graph(query=… | name_pattern=…)` — find functions/classes/routes/variables (use before tracing to get exact `qualified_name`)
- `trace_path(function_name, direction="both")` — callers/callees, data flow, impact. **Trace before changing high-fan-in symbols** like `lib/db.query`, `lib/api.get`, `jwt.verifyToken`.
- `get_code_snippet(qualified_name)` — read a symbol's exact source
- `get_architecture` / `query_graph` (Cypher) — structure, clusters, hot-path/complexity queries
- `detect_changes(base_branch="main")` — map a branch diff to affected symbols

**Coverage:** marketplace TypeScript only (`web/api`, `web/frontend`, `master`, `packages/*`). The symlinked `booking-manager` (Next.js) and `booking-manager-api` (Rust) are **not** indexed. After a large refactor, re-index with `index_repository`; if the project isn't listed by `list_projects`, index it first.

## What This Repo Is

A **meta-repo** that co-locates **8 independent git repositories** forming **two related products** that share one PostgreSQL database (`marketdb`):

- **Product 1 — Marketplace + Admin:** B2C escape-room marketplace (`web/frontend`), its REST API (`web/api`), and the B2B admin panel (`master`).
- **Product 2 — Booking Manager:** a separate B2B reservation manager (`booking-manager` frontend + `booking-manager-api`), wired in as symlinks.

The root itself is a git repo, but it holds **only workspace/harness coordination files** — all real app code lives in the sub-repos, each with its **own independent history**. See the multi-repo git rule below before running any `git` command.

| Path | Repo | Stack | Dev port · URL |
|------|------|-------|----------------|
| `web/frontend/` | `escapemaster-market` | **Astro 7** SSR + React 19 + Tailwind v4 | `:4321` · escapemaster.es |
| `web/api/` | `escapemaster-rooms-api` | **Astro 5** SSR (Node standalone), `pg`, jose | `:8000` · `/api/v1/*` (prod), `/api/v2/*` (dev) |
| `master/` | `master-escapemaster` | **Astro 6** SSR + React 19 + Radix, cookie auth | `:4322` · master.escapemaster.es |
| `packages/escapemaster-ui-components/` | `escapemaster-branding-kit` | `@diegogzt/ui-components` — tsup + Vitest | (library) |
| `booking-manager/` → `my-manager` | `my-manager` | **Next.js 16** + React 19 + Tailwind v4 + Zustand | `:3001` · my.escapemaster.es |
| `booking-manager-api/` → `my-manager-api` | `my-manager-api` | **Rust** + Axum 0.7 + sqlx (compile-time SQL) | `:9001` · my.escapemaster.es/api/v1 |

- **npm workspace** (root `package.json`) includes `web/api`, `web/frontend`, `master`, and `packages/escapemaster-ui-components` — **all four**. The booking-manager (Next.js/Rust) is *not* in the npm workspace; manage it in its own repo.
- **Node 22 required** (Astro 7 / `@astrojs/node` standalone; Dockerfiles use `node:22-alpine`).
- **Booking-manager shares `marketdb`** but has *no shared auth* — it *adds* 40+ tables/columns on top of the marketplace schema. Any `ALTER`/`DROP` on the 5 shared tables (`organizations`, `rooms`, `users`, `players`, `bookings`) must be coordinated across both products.

## Development Commands

```bash
# Start the 3 marketplace services in parallel (recommended)
./dev.sh          # API :8000 + Frontend :4321 + Master :4322

# Individual services
cd web/api && npm run dev          # :8000  (astro dev --port 8000)
cd web/frontend && npm run dev     # :4321
cd master && npm run dev           # :4322

# Build (each app builds independently)
cd web/frontend && npm run build   # (and likewise in web/api, master)

# Migrations (raw .sql files applied by a tsx runner, tracked in the _migrations table)
cd web/api && npm run migrate      # tsx scripts/auto-migrate.ts
cd master && npm run migrate
cd master && npm run clean-db      # wipe test data (master only)

# Tests — the only JS test suite is the UI component library (Vitest)
cd packages/escapemaster-ui-components && npm test          # vitest run (all)
cd packages/escapemaster-ui-components && npx vitest run src/Button.test.tsx   # single file
cd packages/escapemaster-ui-components && npx vitest run -t "renders variant"  # single test by name
cd packages/escapemaster-ui-components && npm run test:coverage

# Booking-manager (separate repos): my-manager → `npm run dev` (Next.js);
# my-manager-api → `cargo run` / `cargo test` (Rust). See AGENTS.md.
```

> **macOS:** Astro dev binds IPv6 (`::1`) only — always use `localhost` in the browser, never `127.0.0.1`.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro SSR (`output: 'server'`, `@astrojs/node` standalone) + React 19 islands. **Versions differ per app: frontend Astro 7, master Astro 6, api Astro 5.** |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` block in `global.css`) |
| Components | Radix UI + CVA + clsx + tailwind-merge |
| Database | PostgreSQL 16 direct via `pg` — **NO ORM**, raw parameterized SQL |
| Auth (web) | Own JWT (jose HS256) + `localStorage` (`em_token`/`em_user`) + Nanostores (`$user`, `$token`) |
| Auth (master) | Cookie `master_session` (env-var check, `secure` in prod) |
| Payments | Stripe Checkout + Connect |
| Storage | Cloudflare R2 (`@aws-sdk/client-s3`, presigned URLs) |
| Email | Resend / AWS SES |
| i18n | Astro native · web: `/es/` `/en/` prefixed · master: Spanish only |

## Architecture

### Databases — shared `marketdb`

`web/api`, `web/frontend`, and the booking-manager all read/write the shared `marketdb` (Postgres 16). `master` connects via its own `DATABASE_URL` (SSL auto-enabled for `neon.tech` hosts; in Swarm prod it points at the shared marketplace Postgres).

- Each app exposes **two pools**: the main `query()` and a **`baul` warehouse** pool (scraped/external data → previewed and migrated into `rooms`).
- Helper utilities: `tableExists(tableName)`, `columnExists(tableName, columnName)`.

### API routes (web/api)

**No `base` config** — routes are served natively from the folder structure: `src/pages/api/v1/*` → `/api/v1/*` (prod, 60+ endpoints) and `src/pages/api/v2/*` → `/api/v2/*` (dev). All endpoints return the envelope:

```ts
{ success: boolean, data?: T, error?: string, meta?: { total, page, limit } }
```

> Gotcha: don't mix `pages/api/v1/rooms.ts` (public) with `pages/api/v1/rooms/index.ts` (admin) — the collision breaks routing. Keep the admin dir renamed.

### React island hydration

- `client:load` — Header, HeroSearchBar, AuthStatus, MapSearch
- `client:visible` — BookingWidget, UserDashboard, ChatWidget, AdvancedFilters

### CMS & Analytics

- **CMS:** master serves CMS pages via its API; web/frontend fetches them via `PUBLIC_CMS_API_URL` (master's origin) and renders section layouts through `CMSPageRenderer.tsx`.
- **Analytics:** web/frontend batches events in `lib/tracking.ts` (`trackPageView`/`trackClick`/`trackAuth` → batched POST to the API). Master has Excel export (exceljs) and a click heatmap.

## CRITICAL RULES

### 1. Tropical color palette — ALWAYS use `tropical-*` classes

```
tropical-primary:   #0097b2   tropical-secondary: #4db8a8
tropical-accent:    #f39c12   tropical-text:      #0d3d34
tropical-bg:        #ffffff   tropical-card:      #e8f5f3
```

**NEVER** hardcode hex colors or use generic Tailwind (`gray-900`, `blue-500`). Master uses divergent tokens (`master/src/styles/global.css`); see `components-kit/divergences.md`.

### 2. SQL — direct `pg`, parameterized only

```ts
import { query } from '../lib/db';
const { rows } = await query('SELECT * FROM rooms WHERE is_active = $1', [true]);
```
Always use `$1`, `$2` — never interpolate user input. **The column `booking_url` does NOT exist** — the external-booking field is `erd_url`.

### 3. lucide-react — divergent versions, do not "fix" the mismatch

- **web/frontend:** pinned `0.562.0` — brand icons (`Facebook`, `Instagram`, `Twitter`) were removed in v1.x. **Do NOT upgrade** without first replacing those icons in `src/layouts/Layout.astro`.
- **master:** uses `lucide-react@1.7` — no brand-icon dependency.

### 4. Mobile-first

Touch targets ≥ 44px (`h-11`, `min-h-[44px]`), `touch-manipulation` on buttons, safe-area padding (`safe-top`, `safe-bottom`). Design mobile → tablet → desktop.

### 5. Duplicated code — change BOTH copies

`shared_vendor/CalendarReservations.tsx` and `lib/r2.ts` are **copied, not symlinked** into both `web/frontend` and `master`. The `ui/` components (`Badge`, `Button`, `Card`, `Table`) follow the same CVA pattern but are intentionally divergent. Edit both copies.

### 6. Multi-repo git — always `cd` into the sub-repo first

The root is a meta-repo whose git history contains only harness/coordination commits; `web/frontend`, `web/api`, `master`, and `packages/*` are **each their own repo**. The **same branch name can exist in several repos** with different commits. Before any `git log/diff/show`, confirm where you are:

```bash
git rev-parse --show-toplevel   # which repo am I in?
git remote -v
```

If app source shows up as "untracked" in `git status`, or diffs come back empty/`unknown revision`, you're in the wrong repo. When a task touches `web/frontend/…`, `web/api/…`, or `master/…`, run git **inside that sub-repo**, never at the root.

## Dev-server gotchas (Astro/Vite)

- **Vite pin is Astro-version-paired.** Astro 5/6 ↔ Vite 7; **Astro 7 ↔ Vite 8**. Root `package.json` currently overrides `"vite": "^8"` (for the Astro 7 frontend). The old advice to "force Vite 7" is stale — do **not** downgrade blindly. If `npm install` fails with `EOVERRIDE` (override conflicts with a direct dependency), align the `overrides` entry and the direct devDep to the same range, then `rm package-lock.json && npm install` at the root.
- **Astro 7 / Vite 8 `oxc` parser is stricter.** A `<script>` block using TS syntax (type assertions like `as HTMLFormElement`, non-null `!`) needs an explicit `<script lang="ts">` — oxc does **not** auto-detect Astro's TS default for `<script>`. This bit ~14 admin pages in `master`.
- **Astro 7 logs are quiet on stdout** — compile/JSX errors land in `<subdir>/.astro/dev.log`. Grep there for the real cause (stacks pointing at `src/lib/db.ts` / `src/middleware.ts` are usually misleading; the true error is a few lines above).

## Deploy

Marketplace apps (`web/frontend`, `web/api`, `master`) deploy to **Docker Swarm + Traefik** on the VPS — images are built **on the VPS** (local Docker on Apple Silicon is broken for these builds), then `docker stack deploy`. Full topology, service names, Traefik routers, and secrets live in **`AGENTS.md`** and **`docs/DEPLOY.md`**. (Older per-app `CLAUDE.md` files and `docs/deployment/dokploy-guide.md` still mention Dokploy — superseded for the marketplace; the booking-manager deploys separately, see `migracion.md`.)

## Key References

| Resource | Path |
|----------|------|
| **Operational guide (deploy, DB, git, anti-patterns)** | `AGENTS.md` |
| Web (B2C) app details | `web/CLAUDE.md` |
| Master (admin) app details | `master/CLAUDE.md` |
| Dev-server / Astro-Vite troubleshooting | `.harness/reins/reviewer/agent.md` |
| API documentation | `docs/api/README.md` |
| Database schema (70+ tables) | `docs/api/database-schema.md` |
| Design system & components | `components-kit/README.md` |
| Web vs Master token divergences | `components-kit/divergences.md` |
| Deployment (Swarm/Traefik) | `docs/DEPLOY.md`, `docs/ARCHITECTURE.md` |
| Operations runbook | `docs/RUNBOOK.md` |
| Project backlog / memory | `tasks/todo.md`, `tasks/memory.md` |
