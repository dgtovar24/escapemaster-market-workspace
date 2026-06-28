# EscapeMaster Marketplace

Marketplace público B2C de escape rooms. Aplicación web completa con tres componentes principales (frontend, API, master admin) desplegada en Docker Swarm sobre el VPS `157.90.157.178`.

## URLs en Producción

- **Frontend (B2C)**: https://escapemaster.es
- **Master Admin (B2B)**: https://master.escapemaster.es
- **API**: https://escapemaster.es/api/v1

## URLs en Pre-producción

- **Frontend**: https://dev.escapemaster.es
- **API**: https://dev.escapemaster.es/api/v2

## Stack

- **Frontend**: Astro 6 SSR + React 19 + Tailwind v4 + Nanostores
- **API**: Astro 5 SSR (Node standalone) + PostgreSQL directo (sin ORM) + jose (JWT)
- **Master Admin**: Astro 5 SSR + React 19 + Radix UI + CVA
- **Infraestructura**: Docker Swarm + Traefik (reverse proxy + SSL) + PostgreSQL 16
- **Storage**: Cloudflare R2 (imágenes)
- **Email**: Resend / AWS SES
- **Payments**: Stripe (Checkout + Connect)

## Estructura del Workspace

```
marketplace/
├── web/
│   ├── frontend/         Astro 6 SSR (B2C)  → repo dgtovar24/escapemaster-market-frontend
│   └── api/              Astro 5 SSR (API)   → repo dgtovar24/escapemaster-market-api
├── master/               Astro 5 SSR (B2B)  → repo dgtovar24/escapemaster-market-admin-panel
├── packages/
│   └── escapemaster-ui-components/  Componentes UI compartidos → repo dgtovar24/escapemaster-branding-kit
└── scripts/              Scripts de deploy    → repo dgtovar24/escapemaster-deploy
```

Cada subdirectorio es un repositorio git independiente.

## Setup Local

### 1. Clonar los repos
```bash
# Este workspace es solo coordinación. Para trabajar en una app:
git clone https://github.com/dgtovar24/escapemaster-market-api.git web/api
git clone https://github.com/dgtovar24/escapemaster-market-frontend.git web/frontend
git clone https://github.com/dgtovar24/escapemaster-market-admin-panel.git master
git clone https://github.com/dgtovar24/escapemaster-branding-kit.git packages/escapemaster-ui-components
```

### 2. Setup de la app API
```bash
cd web/api
npm ci
cp .env.example .env  # editar con tus secrets
npm run dev
```

### 3. Setup del frontend
```bash
cd web/frontend
npm ci
cp .env.example .env
npm run dev
```

### 4. Setup del master
```bash
cd master
npm ci
cp .env.example .env
npm run dev
```

## Documentación

- **[`AGENTS.md`](./AGENTS.md)** — Guía rápida para AI agents y developers.
- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** — Arquitectura detallada: routing, networking, servicios Swarm, secrets.
- **[`docs/DEPLOY.md`](./docs/DEPLOY.md)** — Procedimientos de despliegue, monitoring, troubleshooting.
- **[`CHANGELOG.md`](./CHANGELOG.md)** — Historial de versiones.
- **[`VERSION`](./VERSION)** — Versión actual del marketplace (1.1.0).

## CI/CD

Cada repo tiene workflows de GitHub Actions:

- `ci.yml` — Build check en PRs y pushes
- `deploy-dev.yml` — Deploy automático a dev.escapemaster.es en push a `dev/**`
- `deploy-prod.yml` — Deploy automático a escapemaster.es en push a `main` (con auto-bump de versión)

Para configurar el CD necesitas:

1. Self-hosted runner de GitHub Actions instalado en el VPS (`/opt/actions-runner-manager/`)
2. Secrets del repo en GitHub:
   - `VPS_SSH_KEY` — SSH key del runner
   - `PROD_DB_PASSWORD`, `DEV_DB_PASSWORD`, `JWT_SECRET`, `RESEND_API_KEY`, etc.

Ver `docs/DEPLOY.md` para más detalles.

## Conventional Commits

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/) para auto-bump de versión:

```bash
feat: nueva funcionalidad         → minor (1.1.0 → 1.2.0)
fix: corrección de bug           → patch (1.1.0 → 1.1.1)
feat!: breaking change           → major (1.1.0 → 2.0.0)
docs: solo documentación         → sin bump
chore: tareas menores           → sin bump
```

Override del bump en el cuerpo del PR con `[skip-version]`, `[force-major]`, `[force-minor]`, o `[force-patch]`.

## Licencia

Privado. Todos los derechos reservados.