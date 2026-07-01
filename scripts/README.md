# EscapeMaster Marketplace — Deploy

Scripts y configuración de despliegue para el stack Docker Swarm del marketplace en `157.90.157.178`.

## Estructura

```
.
├── README.md                       ← este archivo
├── marketplace-stack.yml           ← docker stack deploy (compose v3.8)
├── create-marketplace-services.sh  ← DEPRECADO: docker service create (legacy)
├── .env.example                    ← plantilla de variables de entorno
└── deploy/
    ├── traefik-middlewares.yml     ← middlewares globales (https, www→nonwww)
    ├── traefik-www-redirects.yml   ← routers estáticos para www.* (sin servicio)
    └── check_traefik_routers.py    ← script de debug para ver routers activos
```

## Archivos clave

### `marketplace-stack.yml`
Docker Compose v3.8 con **5 servicios Swarm** que constituyen el marketplace:

| Servicio | Imagen | Puerto | Sirve |
|----------|--------|--------|-------|
| `market_api-v1` | escapemaster-market-api-v1:latest | 9101 | `escapemaster.es/api/v1/*` |
| `market_api-v2` | escapemaster-market-api-v1:latest | 9102 | `dev.escapemaster.es/api/v2/*` |
| `market_frontend-prod` | escapemaster-market-frontend-prod:latest | 3101 | `escapemaster.es/` |
| `market_frontend-dev` | escapemaster-market-frontend-dev:latest | 3102 | `dev.escapemaster.es/` |
| `market_master` | escapemaster-market-master:latest | 3103 | `master.escapemaster.es/` |

Las labels de Traefik van en `services.X.deploy.labels` (no en `services.X.labels`) para que se apliquen a `Spec.Labels` y el Swarm provider las detecte.

### `deploy/traefik-middlewares.yml`
Middlewares globales aplicados a todos los routers:

- `redirect-to-https`: fuerza HTTPS para todas las requests entrantes.
- `www-to-nonwww`: redirige `www.escapemaster.es/*` → `escapemaster.es/$1`.
- `www-to-nonwww-dev`: redirige `www.dev.escapemaster.es/*` → `dev.escapemaster.es/$1`.

### `deploy/traefik-www-redirects.yml`
Routers estáticos (file provider) que aplican los middlewares `www-to-nonwww` y `www-to-nonwww-dev`. Usan el servicio `noop-service` apuntando a `127.0.0.1:9999` (nunca se llega al backend porque el middleware redirect responde primero).

## Despliegue

### 1. Configurar secrets

```bash
# Crear /opt/escapemaster-market/scripts/.env con las variables necesarias
cp .env.example /opt/escapemaster-market/scripts/.env
chmod 600 /opt/escapemaster-market/scripts/.env
# Editar con valores reales
nano /opt/escapemaster-market/scripts/.env
```

### 2. Aplicar middlewares Traefik

```bash
scp deploy/traefik-middlewares.yml root@157.90.157.178:/etc/escapemaster/traefik/dynamic/
scp deploy/traefik-www-redirects.yml root@157.90.157.178:/etc/escapemaster/traefik/dynamic/
```

### 3. Desplegar stack

```bash
ssh root@157.90.157.178
set -a && source /opt/escapemaster-market/scripts/.env && set +a
docker stack deploy --compose-file /opt/escapemaster-market/scripts/marketplace-stack.yml market
```

### 4. Verificar

```bash
docker service ls --filter name=market_
curl -sk https://escapemaster.es/api/v1/health
curl -sk https://dev.escapemaster.es/api/v2/health
```

## Variables de Entorno Requeridas

Las mismas que en `web/api/.env.example`, `web/frontend/.env.example` y `master/.env.example`. Lista completa:

```bash
# Databases
PROD_PG_PASS=<40-char-random>
DEV_PG_PASS=<40-char-random>

# Auth
JWT_SECRET=<32+-chars>

# Servicios externos
RESEND_API_KEY=re_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx (prod) / sk_test_xxxxx (dev)
PUBLIC_STRIPE_KEY=pk_live_xxxxx (prod) / pk_test_xxxxx (dev)
MASTER_USER=<admin>
MASTER_PASS=<strong-password>
PUBLIC_GOOGLE_CLIENT_ID=<google oauth client id>
GOOGLE_CLIENT_SECRET=<google oauth secret>

# Cloudflare R2
R2_ACCOUNT_ID=<account id>
R2_ACCESS_KEY_ID=<access key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET_NAME=master
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://<public id>.r2.dev
```

## Migraciones

Las migraciones SQL están en `web/api/migrations/` (del repo `dgtovar24/escapemaster-market-api`):

- `001_core_schema.sql` — Schema base (28 tablas)
- `003_analytics_schema.sql` — Tablas de analytics
- `004_full_room_schema.sql` — Columnas adicionales en rooms/games + tablas themes

Para aplicar manualmente:

```bash
PROD=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
docker cp /opt/escapemaster-market/api/migrations/004_full_room_schema.sql $PROD:/tmp/
docker exec $PROD psql -U root -d marketdb -v ON_ERROR_STOP=1 -f /tmp/004_full_room_schema.sql
```

O usar el script del API:
```bash
docker exec market_api-v1.* /usr/local/bin/apply-pending-migrations.sh --target=prod
```

## Troubleshooting

Ver `docs/DEPLOY.md` del workspace raíz para procedimientos detallados.

### "Marketplace services stuck in 0/1"
Verificar que las imágenes existen:
```bash
docker images | grep escapemaster-market
```

Si no, re-taggear:
```bash
docker tag escape-market-api:v1.0.0 escapemaster-market-api-v1:latest
docker tag escape-market-api:v1.0.0 escapemaster-market-frontend-prod:latest
docker tag escape-market-api:v1.0.0 escapemaster-market-frontend-dev:latest
docker tag escape-market-api:v1.0.0 escapemaster-market-master:latest
```

### "Traefik: Router X uses a nonexistent certificate resolver"
El resolver `letsencrypt` no está cargado. Verificar:
```bash
cat /etc/escapemaster/traefik/traefik.yml | grep -A5 certificatesResolvers
ls -la /etc/escapemaster/traefik/dynamic/acme.json  # debe ser writable por Traefik
```