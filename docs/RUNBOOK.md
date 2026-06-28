# Runbook — EscapeMaster Marketplace

Operations guide for deployment, monitoring, and incident response.

## Infrastructure Overview

| Component | Provider | Details |
|-----------|----------|---------|
| VPS | CubePath (eu-bcn-1, Barcelona) | `localhost`, 4vCPU / 8GB RAM |
| PaaS | Dokploy | Self-hosted on VPS, panel at `:3000` |
| Reverse proxy | Traefik | Managed by Dokploy |
| DB (main) | PostgreSQL on VPS | `localhost:5432/marketdb` |
| DB (master prod) | Neon cloud | `*.neon.tech/neondb` + `baul` |
| Storage | Supabase (images) + Vercel Blob | |
| Email | Resend | |
| Payments | Stripe + Redsys | |
| DNS | Pending verification via CubePath | |

## Production URLs

| App | URL |
|-----|-----|
| B2C frontend | https://escapemaster.es |
| Admin panel | https://master.escapemaster.es |
| API | https://api.escapemaster.es/v1 |

## Deployment

### Trigger a deploy

Push to `main` branch of the respective repo — Dokploy watches for changes and auto-deploys.

```bash
# web/frontend repo (diegogzt/escapemaster-market)
git push origin main

# master repo (diegogzt/master-escapemaster)
git push origin main
```

### Deployment checklist

- [ ] Local build passes: `npm run build`
- [ ] All env vars are set in Dokploy project settings
- [ ] DB migrations ran if schema changed: `npm run migrate`
- [ ] Node 22 confirmed in Dockerfile (`FROM node:22-alpine`)

### Dockerfile requirements

Both `web/frontend/Dockerfile` and `master/Dockerfile` must use Node 22:

```dockerfile
FROM node:22-alpine
```

Astro 6 requires Node ≥ 22.12.0. Node 20 will fail at build time.

## Environment Variables in Production

Set these in Dokploy's project settings (not in committed files).

### web/frontend

```
NODE_ENV=production
DATABASE_URL=postgresql://root:<pass>@localhost:5432/marketdb
BAUL_DATABASE_URL=postgresql://root:<pass>@localhost:5432/marketdb
PUBLIC_API_URL=https://api.escapemaster.es/v1/api
PUBLIC_CMS_API_URL=https://master.escapemaster.es
PUBLIC_STRIPE_KEY=pk_live_...
PUBLIC_GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
```

### web/api

```
NODE_ENV=production
DATABASE_URL=postgresql://root:<pass>@localhost:5432/marketdb
BAUL_DATABASE_URL=postgresql://root:<pass>@localhost:5432/marketdb
JWT_SECRET=<strong_random_secret>
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
ANALYTICS_JOB_KEY=<random_key>
CRON_SECRET=<random_key>
ESCAPEMASTER_MANAGER_API_URL=https://master.escapemaster.es
CORS_ORIGIN=https://escapemaster.es
PUBLIC_API_URL=https://api.escapemaster.es/v1
```

### master

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:<pass>@<neon-host>/neondb?sslmode=require
BAUL_DATABASE_URL=postgresql://neondb_owner:<pass>@<neon-host>/baul?sslmode=require
MASTER_USER=<admin_username>
MASTER_PASS=<admin_password>
JWT_SECRET=<same_secret_as_api>
RESEND_API_KEY=re_...
PUBLIC_GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

## Health Checks

```bash
# API — should return 401 (protected endpoint, auth expected)
curl -s -o /dev/null -w "%{http_code}" https://api.escapemaster.es/v1/api/auth/me

# Frontend — should return 200 or 302
curl -s -o /dev/null -w "%{http_code}" https://escapemaster.es/

# Master — should return 200 (login page) or 302 (redirect to login)
curl -s -o /dev/null -w "%{http_code}" https://master.escapemaster.es/
```

### Local health checks (dev)

```bash
curl -s -o /dev/null -w "api:      %{http_code}\n" http://localhost:8000/v1/api/auth/me
curl -s -o /dev/null -w "frontend: %{http_code}\n" http://localhost:4321/es/
curl -s -o /dev/null -w "master:   %{http_code}\n" http://localhost:4322/login
```

## Common Issues and Fixes

### `@vite/client` returns 500 in dev mode

**Cause:** vite@8 is installed at workspace root, `@vitejs/plugin-react` detects rolldown via `rolldownVersion` property, activates rolldown-specific plugins that are incompatible with Astro's internal vite@7.

**Fix:**
```bash
# At workspace root
rm package-lock.json && npm install
# verify root vite is 7.x:
node -e "console.log(require('./node_modules/vite/package.json').version)"
```

The root `package.json` must have:
```json
{
  "devDependencies": { "vite": "^7" },
  "overrides": { "vite": "^7" }
}
```

### Master login not working

Login uses a native HTML GET form — credentials go as query params `?u=<user>&p=<pass>`.

**Debug steps:**
```bash
# Test directly (should return 302 + set-cookie header)
curl -s -D - -o /dev/null "http://localhost:4322/login?u=Randalls&p=Randalls_Master_2026%21" | head -5
```

Common causes:
- Extra `.env.*` files overriding `MASTER_USER`/`MASTER_PASS` — delete all except `.env`
- Quoted values (`MASTER_USER="Randalls"`) — some parsers include the quotes. Use unquoted values.
- Stale `.env.local` with highest Astro priority overriding credentials

### Astro dev not reachable at `127.0.0.1`

macOS Astro dev server binds to `::1` (IPv6) only. Use `localhost` in the browser — it resolves both.  
`curl http://127.0.0.1:4321` will fail; use `curl http://[::1]:4321`.

### Production site not loading (port 80/443)

Likely cause: OS-level firewall blocking ports.

**Fix via CubePath web VNC console:**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

Traefik (Dokploy) requires ports 80 and 443 open at the OS level. CubePath's managed firewall is disabled by default.

### Build fails: `Node.js version X does not satisfy the `>=22.12.0` requirement`

Dockerfile uses Node 20. Change to Node 22:
```dockerfile
FROM node:22-alpine  # was: node:20-alpine
```

### `lucide-react` brand icons missing (Facebook, Instagram, Twitter)

These icons were removed in `lucide-react@1.0`. The project pins `lucide-react@0.562.0`. Do NOT upgrade without replacing icons in `src/layouts/Layout.astro`.

## Rollback Procedures

### Rollback via Dokploy

1. Open Dokploy panel at `http://localhost:3000`
2. Navigate to the affected app
3. Go to **Deployments** tab
4. Click the previous successful deployment → **Redeploy**

### Emergency rollback via Docker

```bash
# SSH into VPS (or use CubePath web console)
docker ps  # find container name

# Roll back to previous image tag
docker stop <container>
docker run -d --env-file /path/to/.env <image>:<previous_tag>
```

### Database rollback

There is no automated rollback for DB migrations. If a migration causes issues:

1. Identify the problematic migration in `scripts/auto-migrate.ts`
2. Write a reverse migration and run it manually via `psql`
3. Redeploy with the previous app version

```bash
psql $DATABASE_URL -c "ALTER TABLE ... DROP COLUMN ..."
```

## Analytics Cron Jobs

The analytics aggregation cron must be called daily. Set it up on a scheduler (Vercel Cron, GitHub Actions, crontab):

```bash
# POST to this endpoint daily — x-api-key must match ANALYTICS_JOB_KEY
curl -X POST https://api.escapemaster.es/v1/api/analytics/aggregate \
  -H "x-api-key: <ANALYTICS_JOB_KEY>"
```

## Monitoring

### Check logs in Dokploy

Dokploy panel → App → **Logs** tab shows stdout/stderr in real time.

### Check container logs (SSH)

```bash
docker logs <container_name> --tail 100 -f
```

### Database connection check

```bash
psql "postgresql://root:<pass>@localhost:5432/marketdb" -c "SELECT count(*) FROM rooms;"
```
