# CHANGELOG

## [1.1.0] - 2026-06-28

### Importación Inicial de Datos
- **Script `import-escapeup.ts`**: Nuevo script que descarga juegos desde la API pública de EscapeUp (`https://api.escapeup.es/api/games/`) e inserta registros en `public.games` y `public.rooms`. Crea una organización placeholder "EscapeUp Imports" y un room por juego.
  - Soporta formato EU de precios (`17,5` con coma).
  - Slugs únicos con sufijo de 8 chars de external_id para evitar colisiones.
  - Rating clampeado a 9.99 (max de `numeric(3,2)`).
- **Script `sync-room-from-game.ts`**: Sincroniza datos de `games` → `rooms` (city, province, address, latitude, longitude, duration_minutes, price_per_person, description, image_url, average_rating, themes, booking_url, etc.).
- **Resultado**: 714 juegos importados en prod y dev (de 998 disponibles, resto skipped por campos faltantes o duplicados).

### Schema Completo
- **Migración `004_full_room_schema.sql`**: Añade las columnas que el código de la API espera en `rooms` (description, city, province, address, latitude, longitude, capacity, duration_minutes, difficulty_level, fear_level, price_per_person, image_url, average_rating, total_reviews, pricing_model, etc.) y en `games` (description, themes, images). Crea las tablas `themes` y `room_themes`.

### Bugfixes Críticos
- **Conflicto `rooms.ts` vs `rooms/index.ts`**: Astro daba precedencia a `pages/api/v1/rooms/index.ts` (autenticado, admin) sobre `rooms.ts` (público), causando 401 en `/api/v1/rooms`. Renombrado el directorio admin a `rooms-admin/` para evitar colisión.
- **Endpoint `rooms.ts` duplicado en `pages/api/v2/`**: Creado `pages/api/v2/rooms.ts` para que `/api/v2/rooms` funcione en dev (la imagen es la misma para v1 y v2, Traefik decide según el path prefix).
- **Stack Traefik**: Migrado de `docker stack deploy` con `services.X.labels` (ContainerSpec) a `services.X.deploy.labels` (Spec.Labels) para que el Swarm provider detecte correctamente las labels.
- **Traefik file provider + acme.json**: Removido el `read_only` del mount `/etc/escapemaster/traefik/dynamic` y permisos `600` en `acme.json` para que Let's Encrypt pueda emitir y renovar certificados.
- **Astro `base: '/api'`**: Removido el `base` ya que causaba doble `/api/api/v1/...` en las URLs. Ahora las rutas se sirven nativamente en `/api/v1/...` sin prefijo artificial.
- **Stack `docker service create` vs `docker stack deploy`**: Migrado el script `create-marketplace-services.sh` (basado en `docker service create`) a `marketplace-stack.yml` (basado en `docker stack deploy` con compose v3.8) porque Docker Swarm mode no soporta flags de red/ambiente como argumentos del comando del container.

### CI/CD
- **Workflows GitHub Actions**:
  - `ci.yml`: Build check en cada PR y push a `main`/`dev/**`.
  - `deploy-dev.yml`: Despliega a `dev.escapemaster.es` cuando se hace push a `dev/**` (con `apply-pending-migrations.sh --target=dev`).
  - `deploy-prod.yml`: Despliega a `escapemaster.es` cuando se hace push a `main` (auto-bump semver + migraciones prod + GitHub Release).
- **Scripts bash de deploy** (en `web/api/scripts/`):
  - `build-api-image.sh`: Construye la imagen Docker de la API con contexto workspace.
  - `deploy-dev-stack.sh`: Redeploy del stack con `docker stack deploy`.
  - `deploy-prod-stack.sh`: `docker service update --image` por servicio.
  - `health-check.sh`: Curl con retries para validar después de deploy.
  - `bump-version.sh`: Auto-bump semver desde Conventional Commits.
- **Conventional Commits**: `feat:` → minor, `fix:` → patch, `feat!:`/`BREAKING CHANGE:` → major. Overrides con `[skip-version]`, `[force-major|minor|patch]`.

### Routing Final
```
escapemaster.es/api/v1/*      → api-v1 (escapemaster-market-api, :9101)
escapemaster.es/api/v2/*      → no matchea (v2 solo en dev)
escapemaster.es/ (resto)      → frontend-prod (:3101)
escapemaster.es/master/*      → no usado (master está separado)

dev.escapemaster.es/api/v1/*   → no matchea (v1 solo en prod)
dev.escapemaster.es/api/v2/*   → api-v2 (escapemaster-market-api, :9102)
dev.escapemaster.es/ (resto)   → frontend-dev (:3102)

master.escapemaster.es/        → master (:3103)

www.escapemaster.es/           → 301 redirect → escapemaster.es/
```

### Redirección `www` → no-www
- Middleware `www-to-nonwww` y `www-to-nonwww-dev` en Traefik file provider.
- Router estático `market-www-prod@file` y `market-www-dev@file` con rule `Host(www.escapemaster.es)` o `Host(www.dev.escapemaster.es)` que aplican el middleware redirect.

### Servicio `noop-service`
- Para que los routers de redirect tengan un service asociado sin necesidad de un container real, se creó un servicio `noop-service` en `www-redirects.yml` apuntando a `http://127.0.0.1:9999` (nunca se usa porque el middleware redirect responde antes de enrutar al backend).

---

## [1.0.0] - 2026-06-27

### Nueva Arquitectura de Despliegue Dual
- **Migración completa a Docker Swarm + Traefik** en VPS `157.90.157.178` (sustituye Dokploy).
- **Entornos separados**: Producción (`escapemaster.es`) y Pre-producción (`dev.escapemaster.es`).
- **API v1 y v2 coexistentes** detrás de routing Traefik con strip prefix.
- **PostgreSQL dedicado** por entorno (servicios Swarm separados, volúmenes `marketdata-prod` y `marketdata-dev`).
- **Coexistencia con el gestor de reservas** (escapemaster-marketplace): prefijo `escapemaster-market-*` para evitar conflictos con los servicios existentes `escapemaster-*`.

### Migraciones
- **Nuevo sistema de migraciones SQL** basado en archivos `NNN_*.sql` con tabla `_migrations` de tracking.
- `apply-pending-migrations.sh` detecta archivos nuevos en `migrations/` y los aplica en orden, marcando cada uno como aplicado.
- Eliminación de `auto-migrate.ts` (legacy Supabase).
- Schema inicial consolidado: 28 tablas en `migrations/001_core_schema.sql` + `migrations/003_analytics_schema.sql`.

### Refactorización de la API
- Astro v5 API restructurada a `src/pages/api/v1/*` y `src/pages/api/v2/*`.
- Routing público: `escapemaster.es/api/v1/*` (prod) y `dev.escapemaster.es/api/v2/*` (pre-prod).
- Removido `base: '/api'`; las rutas se sirven nativamente en `/api/v1/...`.
- Imports relativos actualizados a la nueva profundidad (`../../../lib/db` desde `pages/api/v1/[id]/`, etc.).
- Endpoints de salud (`/api/v1/health`, `/api/v2/health`).

### Refactorización del Branding Kit
- `@diegogzt/ui-components` ahora es workspace dep en lugar de remote git (que requería auth SSH).
- Componentes faltantes (Button, Card, Container, etc.) reemplazados por imports locales en `src/components/ui/`.
- `CMSPageRenderer.tsx` y `component-registry.tsx` reescritos para usar imports locales.

### Docker
- **Node 22** en todos los Dockerfiles (requerido por Astro 6).
- Alpine + `@rollup/rollup-linux-x64-musl` binary workaround (npm bug con optional dependencies).
- Puertos dedicados por servicio: API 9101/9102, Frontend 3101/3102, Master 3103.
- `docker-pre-start.sh` actualizado con PORT default para cada servicio.
- `.dockerignore` añadido en la raíz del workspace para excluir `node_modules`, `dist`, `.env`, etc.

### Migración de Repositorios
- Repositorios movidos de `diegogzt/*` → `dgtovar24/*`:
  - `escapemaster-market` → `escapemaster-market-frontend`
  - `escapemaster-rooms-api` → `escapemaster-market-api`
  - `master-escapemaster` → `escapemaster-market-admin-panel`
  - `escapemaster-ui-components` → `escapemaster-branding-kit`
- Repos originales en `diegogzt` archivados (read-only).
- Nuevo repo `dgtovar24/escapemaster-deploy` para scripts de despliegue y middlewares Traefik.
- `git config` global actualizado: user.name/email a `dgtovar24` y `dgtovar24@users.noreply.github.com`.
- `~/.gitconfig` actualizado: credential helper apunta a `/opt/homebrew/bin/gh` (corregido del path x86_4 roto).

### Traefik
- Routing con Swarm provider (Docker provider mantenido para compatibilidad con servicios del gestor).
- Middlewares globales: `redirect-to-https`, `www-to-nonwww`, `www-to-nonwww-dev`.
- Let's Encrypt con certs automáticos para todos los dominios.
- `acme.json` ahora writable (mount rw en lugar de ro).

### Servicios Swarm Finales
| Servicio | Imagen | Puerto | Volumen | Sirve |
|----------|--------|--------|---------|-------|
| `escapemaster-market-postgres-prod` | postgres:16-alpine | 5432 | `marketdata-prod` | DB prod |
| `escapemaster-market-postgres-dev` | postgres:16-alpine | 5432 | `marketdata-dev` | DB dev |
| `market_api-v1` | `escapemaster-market-api-v1:latest` | 9101 | - | `escapemaster.es/api/v1/*` |
| `market_api-v2` | `escapemaster-market-api-v1:latest` | 9102 | - | `dev.escapemaster.es/api/v2/*` |
| `market_frontend-prod` | `escapemaster-market-frontend-prod:latest` | 3101 | - | `escapemaster.es/` |
| `market_frontend-dev` | `escapemaster-market-frontend-dev:latest` | 3102 | - | `dev.escapemaster.es/` |
| `market_master` | `escapemaster-market-master:latest` | 3103 | - | `master.escapemaster.es/` |

### Seguridad
- Secrets almacenados en `/opt/escapemaster-market/scripts/.env` (chmod 600) en el VPS.
- Contraseñas de DB generadas con `openssl rand -base64 32 | tr -d '/+='`.
- DBs no expuestas a internet (solo accesibles desde la red overlay `escapemaster-network`).
- `.env` excluido del build de Docker (incluido en `.dockerignore`).

---

## [0.6] - 2026-03-15

### Nuevas Funcionalidades
- **Mercadillo de Entradas**: Sistema completo para comprar y vender entradas de escape room.
  - Página pública del mercadillo (`/es/marketplace`, `/en/marketplace`)
  - Detalle de cada entrada con información de la sala y reserva
  - Botón "Vender Entrada" en reservas próximas del perfil de usuario
  - Chat integrado para contactar vendedores directamente
  - Página de administración en master (`/marketplace`) con estadísticas
  - Comisión del 7.5% por venta

### Solución de Errores & Estabilización
- **Limpieza de Código**: Eliminación de scripts obsoletos con referencias a servidores antiguos.

---

## [0.5] - 2026-03-12

### Solución de Errores & Estabilización
- **Compilación de Producción**: Solucionado error crítico de sintaxis en `master/src/pages/login.astro` (redundancia en declaración de errores) que bloqueaba la construcción (`build`) del portal de administración.
- **Validación Entornos**: Confirmación de construcción estática y de servidor (Vite/Astro) libre de errores para los entornos web y master (`0.5.0`).
- **Actualización de Versiones**: Incremento coordinado de la versión principal del sistema base y paquetes NPM (`/VERSION`, `master/package.json`, `web/package.json`).

---

## [0.5] - 2026-03-13

### Corrección de Errores (Master)
- **Fix Master Login**: Se solucionó un bucle de redirecciones infinito al acceder al panel de administración.
  - Se excluyeron las rutas `/api` del chequeo general del `middleware.ts` en el proyecto `master`.
  - Se actualizó la cookie `master_session` en `login.ts` para que use `secure: true` (basado en `import.meta.env.PROD`) en producción.

---

## [0.4] - 2026-03-10

### Mejoras UI/UX
- **Onboarding (Usuario Normal) - Rediseño Premium**: Rediseño completo del wizard de onboarding para usuarios tipo `customer`, alineado con los tokens `tropical-*` y los principios del `frontend-design` skill.
  - Fondo de malla de gradiente atmosférico animado con tres orbes de color.
  - Tarjeta glassmórfica (`backdrop-blur-[40px]`, `bg-white/70`) con sombra suave teñida de color primario.
  - Tipografía premium: **Outfit** (800/900) para títulos y **Plus Jakarta Sans** para cuerpo.
  - Indicador de pasos con glow en el paso activo y animaciones de transición entre pasos.
  - Micro-animaciones en cada paso (`slide-in-from-right`, `zoom-in-95`, `fade-in`).
- **Cambio de Cuenta a Empresa**: Opción en el perfil de usuario para convertir una cuenta normal en cuenta de empresa, iniciando el flujo de onboarding empresarial.
- **API de Cambio de Cuenta**: Nuevo endpoint `POST /api/auth/switch-to-enterprise` para gestionar la conversión de cuenta de forma segura.

---

## [0.3] - 2026-03-10

### Nuevo
- **Login con Google (v1)**: Implementación completa del flujo OAuth 2.0 en la web pública.
- **Guía de Configuración**: Nueva documentación detallada en `docs/guides/google-login-setup.md` para la activación de Google Cloud y Vercel.

### Mejoras
- **Diagnósticos de Auth**: Mejora sustancial en los mensajes de error del backend de autenticación para facilitar la depuración de variables de entorno faltantes.
- **Sincronización de Entorno**: Actualización masiva de archivos `.env`, `.env.development` y `.env.local` con las nuevas credenciales de Google.

---

## [0.2] - 2026-03-09

### Solución de Errores
- **Vinculación Vercel**: Se corrigió el enlace de los proyectos locales a los entornos de producción correctos (`master-escapemaster` y `escapemaster-rooms`).
- **Diseño Tropical**: Restauración de estilos corporativos en la página de login de administración.
- **Build Stabilization**: Solución de errores de sintaxis en el componente de detalle de sala.

### Mejoras
- **Gestión de Sesión**: Rotación de credenciales maestras para el usuario `Randalls`.

---

## [0.1] - 2026-03-08

### Lanzamiento Inicial
- Configuración base del monorepo (`master/` y `web/`).
- Despliegue inicial a Vercel.
- Implementación del sistema de diseño premium "Tropical".