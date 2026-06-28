# Guía de Despliegue — EscapeMaster Marketplace

Procedimientos operativos para desplegar, monitorear y mantener el stack del marketplace en `157.90.157.178`.

## Setup Inicial (solo primera vez)

### 1. Conectar al VPS
```bash
ssh root@157.90.157.178
```

### 2. Verificar Swarm
```bash
docker node ls
docker network ls | grep escapemaster-network
```
La red `escapemaster-network` ya existe (la comparte con el gestor de reservas).

### 3. Crear directorios
```bash
mkdir -p /opt/escapemaster-market/{api,frontend,master,scripts}
mkdir -p /opt/escapemaster-market/scripts
```

### 4. Crear archivo `.env` con secrets
```bash
cat > /opt/escapemaster-market/scripts/.env <<'EOF'
PROD_PG_PASS=<40-char-random>
DEV_PG_PASS=<40-char-random>
JWT_SECRET=<32+-chars>
RESEND_API_KEY=re_xxxxx
MASTER_USER=admin
MASTER_PASS=<strong-password>
STRIPE_SECRET_KEY=sk_live_xxxxx
PUBLIC_STRIPE_KEY=pk_live_xxxxx
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=master
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
EOF
chmod 600 /opt/escapemaster-market/scripts/.env
```

Para generar passwords aleatorios:
```bash
openssl rand -base64 32 | tr -d '/+=' | head -c 40
```

### 5. Crear las DBs Postgres
```bash
# Volúmenes
docker volume create marketdata-prod
docker volume create marketdata-dev

# Servicios (producción)
docker service create \
  --name escapemaster-market-postgres-prod \
  --network escapemaster-network \
  --mount type=volume,source=marketdata-prod,destination=/var/lib/postgresql/data \
  --env POSTGRES_DB=marketdb \
  --env POSTGRES_USER=root \
  --env POSTGRES_PASSWORD="$PROD_PG_PASS" \
  --constraint 'node.role==manager' \
  postgres:16-alpine

# Servicio (dev) — mismo password es OK
docker service create \
  --name escapemaster-market-postgres-dev \
  --network escapemaster-network \
  --mount type=volume,source=marketdata-dev,destination=/var/lib/postgresql/data \
  --env POSTGRES_DB=marketdb \
  --env POSTGRES_USER=root \
  --env POSTGRES_PASSWORD="$DEV_PG_PASS" \
  --constraint 'node.role==manager' \
  postgres:16-alpine

# Verificar
docker exec $(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1) \
  psql -U root -d marketdb -c '\dt'
```

### 6. Aplicar migraciones iniciales (en cada DB)
```bash
PROD=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
for f in 001_core_schema.sql 003_analytics_schema.sql 004_full_room_schema.sql; do
  docker cp /opt/escapemaster-market/api/migrations/$f $PROD:/tmp/
  docker exec $PROD psql -U root -d marketdb -v ON_ERROR_STOP=1 -f /tmp/$f
done
```

### 7. Verificar Traefik
```bash
cat /etc/escapemaster/traefik/traefik.yml | head -30
ls /etc/escapemaster/traefik/dynamic/
```

Si Traefik tiene el provider `docker` activo además de `swarm`, **desactívalo** para evitar conflictos con los routers `market-*`:
```yaml
providers:
  swarm:
    exposedByDefault: false
    watch: true
  # docker:  ← COMENTAR O ELIMINAR
  file:
    directory: /etc/escapemaster/traefik/dynamic
    watch: true
```

### 8. Configurar acme.json como writable
```bash
chmod 600 /etc/escapemaster/traefik/dynamic/acme.json
# Recrear el servicio Traefik con mount rw:
docker service update --mount-rm /etc/escapemaster/traefik/dynamic traefik
docker service update --mount-add type=bind,source=/etc/escapemaster/traefik/dynamic,target=/etc/escapemaster/traefik/dynamic,readonly=false traefik
```

### 9. Importar datos iniciales (opcional, pero recomendado)
```bash
CURRENT=$(docker ps -q -f name=market_api-v1 | head -1)
docker cp /opt/escapemaster-market/api/scripts/import-escapeup.ts $CURRENT:/app/scripts/
docker exec $CURRENT sh -c 'cd /app && DATABASE_URL=postgresql://root:'$PROD_PG_PASS'@escapemaster-market-postgres-prod:5432/marketdb npx tsx scripts/import-escapeup.ts --limit=998'

# Sync games → rooms
docker cp /opt/escapemaster-market/api/scripts/sync-room-from-game.ts $CURRENT:/app/scripts/
docker exec $CURRENT sh -c 'cd /app && DATABASE_URL=postgresql://root:'$PROD_PG_PASS'@escapemaster-market-postgres-prod:5432/marketdb npx tsx scripts/sync-room-from-game.ts'

# Repetir para dev
docker exec $CURRENT sh -c 'cd /app && DATABASE_URL=postgresql://root:'$DEV_PG_PASS'@escapemaster-market-postgres-dev:5432/marketdb npx tsx scripts/import-escapeup.ts --limit=998'
docker exec $CURRENT sh -c 'cd /app && DATABASE_URL=postgresql://root:'$DEV_PG_PASS'@escapemaster-market-postgres-dev:5432/marketdb npx tsx scripts/sync-room-from-game.ts'
```

### 10. Desplegar el stack
```bash
cd /opt/escapemaster-market/scripts
set -a && source .env && set +a
docker stack deploy --compose-file marketplace-stack.yml market
```

### 11. Verificar
```bash
docker service ls --filter name=market_
curl -sk https://escapemaster.es/api/v1/health
curl -sk https://dev.escapemaster.es/api/v2/health
curl -sk https://master.escapemaster.es/
```

## Despliegue Continuo (CD)

### Push a dev
```bash
git checkout -b dev/mi-feature
git push origin dev/mi-feature
```
GitHub Action `deploy-dev.yml` se ejecuta automáticamente:
1. Aplica migraciones pendientes a la DB dev (`apply-pending-migrations.sh --target=dev`)
2. Construye imagen API + redeploy stack (`docker stack deploy`)
3. Verifica `/api/v2/health`

### Push a prod
```bash
git checkout main
git merge dev/mi-feature
git push origin main
```
GitHub Action `deploy-prod.yml`:
1. Detecta Conventional Commits y bumpea versión (`bump-version.sh` → `v1.2.3`)
2. Aplica migraciones a prod (`apply-pending-migrations.sh --target=prod`)
3. Construye imagen con tag nuevo
4. `docker service update --image escapemaster-market-api-v1:vX.Y.Z` por servicio
5. Verifica `/api/v1/health`
6. Crea GitHub Release con notas auto-generadas

## Despliegue Manual (sin CI)

### Re-build imagen API
```bash
cd /opt/escapemaster-market
docker build --no-cache -t escapemaster-market-api-v1:latest -f web/api/Dockerfile .

# Etiquetar para Swarm stack
docker tag escapemaster-market-api-v1:latest escapemaster-market-frontend-prod:latest
docker tag escapemaster-market-api-v1:latest escapemaster-market-frontend-dev:latest
docker tag escapemaster-market-api-v1:latest escapemaster-market-master:latest
```

### Re-deploy stack
```bash
cd /opt/escapemaster-market/scripts
set -a && source .env && set +a
docker stack deploy --compose-file marketplace-stack.yml market
```

### Re-deploy servicio individual
```bash
docker service update --image escapemaster-market-api-v1:latest market_api-v1
docker service update --force --image escapemaster-market-api-v1:latest market_api-v2
```

## Monitoring

### Ver logs en tiempo real
```bash
# API prod
docker service logs market_api-v1 --follow --tail 100

# Todos los market_*
docker service logs market_* --follow

# Solo errores
docker service logs market_api-v1 --follow 2>&1 | grep -E "ERROR|error" | head
```

### Ver routers Traefik activos
```bash
curl -s http://localhost:8080/api/http/routers | python3 -m json.tool | grep -A3 'name'
```

### Ver servicios Swarm
```bash
docker service ls --filter name=market_
docker stack ps market
```

### Ver uso de DBs
```bash
PROD=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
docker exec $PROD psql -U root -d marketdb -c "
SELECT 
  schemaname, 
  relname AS table_name, 
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
"
```

## Rollback Manual

Si un deploy rompe algo, revertir al tag anterior:

```bash
# Listar tags disponibles
git tag --list 'v*' | sort -V | tail -5

# Re-deploy usando imagen con tag anterior
PREV_TAG="v1.0.0"
docker pull escapemaster-market-api-v1:$PREV_TAG  # si estuviera en registry
# O rebuild desde el commit anterior:
git checkout $PREV_TAG
docker build --no-cache -t escapemaster-market-api-v1:$PREV_TAG -f web/api/Dockerfile .
docker tag escapemaster-market-api-v1:$PREV_TAG escapemaster-market-api-v1:latest
docker service update --force --image escapemaster-market-api-v1:latest market_api-v1
docker service update --force --image escapemaster-market-api-v1:latest market_api-v2
```

**Importante**: NO rollback de DB. Las migraciones aplicadas quedan. Si necesitas revertir un cambio de schema, crea una nueva migración que revierta los cambios manualmente.

## Backup de DB

### Snapshot manual del volumen
```bash
# Parar el servicio temporalmente (downtime ~30s)
docker service scale escapemaster-market-postgres-prod=0
# Crear snapshot del volumen
docker run --rm -v marketdata-prod:/data -v /tmp:/backup alpine tar czf /backup/marketdb-prod-$(date +%Y%m%d).tar.gz /data
# Restaurar el servicio
docker service scale escapemaster-market-postgres-prod=1
```

### Dump SQL (sin downtime)
```bash
PROD=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
docker exec $PROD pg_dump -U root -d marketdb | gzip > /tmp/marketdb-prod-$(date +%Y%m%d).sql.gz

# Restaurar
gunzip -c /tmp/marketdb-prod-XXX.sql.gz | docker exec -i $PROD psql -U root -d marketdb
```

## Troubleshooting

### "No se ven salas en escapemaster.es"
```bash
# 1. Verificar que la DB tiene datos
PROD=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
docker exec $PROD psql -U root -d marketdb -c "SELECT count(*) FROM public.games;"

# 2. Si está vacía, importar
docker exec market_api-v1.1.* sh -c 'cd /app && DATABASE_URL=... npx tsx scripts/import-escapeup.ts --limit=998'
docker exec market_api-v1.1.* sh -c 'cd /app && DATABASE_URL=... npx tsx scripts/sync-room-from-game.ts'

# 3. Verificar endpoint
curl -sk "https://escapemaster.es/api/v1/rooms?limit=3"
```

### "401 Unauthorized en /api/v1/rooms"
Probablemente el endpoint `pages/api/v1/rooms/index.ts` (admin) está tomando precedencia sobre `rooms.ts` (público). Renombrar el directorio:
```bash
cd /opt/escapemaster-market/web/api/src/pages/api/v1
mv rooms rooms-admin
cd /opt/escapemaster-market && docker build --no-cache -t escapemaster-market-api-v1:latest -f web/api/Dockerfile .
docker service update --force --image escapemaster-market-api-v1:latest market_api-v1 market_api-v2
```

### "502 Bad Gateway en dev.escapemaster.es"
El cert SSL no se ha emitido. Forzar trigger haciendo un request:
```bash
curl -sk https://dev.escapemaster.es/api/v2/health
# Esperar 1-2 minutos y verificar
curl -skv https://dev.escapemaster.es/api/v2/health 2>&1 | grep -E "subject|issuer"
```

### "Traefik: Router uses a nonexistent certificate resolver"
Significa que el resolver `letsencrypt` no está cargado (probablemente `acme.json` no es writable). Ver:
```bash
docker exec $(docker ps -q -f name=traefik | head -1) sh -c "ls -la /etc/escapemaster/traefik/dynamic/acme.json"
docker service logs traefik --since 10m 2>&1 | grep -i "acme\|certificate"
```

### "Service market_X has no servers"
El Swarm provider no detecta los labels. Verificar:
```bash
docker service inspect market_api-v1 --format "{{json .Spec.Labels}}" | python3 -m json.tool
# Debe tener traefik.enable=true y las router labels en Spec.Labels (NO en Spec.TaskTemplate.ContainerSpec.Labels)
```

Si están en ContainerSpec en lugar de Spec, el problema es que `docker stack deploy` con `services.X.labels` no los pone en `Spec.Labels`. Hay que usar `services.X.deploy.labels` en su lugar.

### "Container keeps restarting"
Ver logs:
```bash
docker service logs market_api-v1 --tail 50
docker exec $(docker ps -q -f name=market_api-v1 | head -1) ls /app/dist/server/manifest_*.mjs  # debe existir
```

## Procedimientos de Mantenimiento

### Cambiar el password de una DB
```bash
NEW_PASS=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
# 1. Actualizar el servicio Postgres
docker service update --env-add "POSTGRES_PASSWORD=$NEW_PASS" escapemaster-market-postgres-prod
# 2. Actualizar el .env
sed -i "s/^PROD_PG_PASS=.*/PROD_PG_PASS=$NEW_PASS/" /opt/escapemaster-market/scripts/.env
# 3. Re-deployar los servicios que usan esa DB
docker stack deploy --compose-file marketplace-stack.yml market
# IMPORTANTE: el volumen preserva los datos, solo cambia el password
```

### Actualizar Traefik
```bash
docker service update --image traefik:v3.7.0 traefik
```

### Limpiar volúmenes huérfanos
```bash
docker volume ls | grep '<none>'
docker volume prune
```

### Renovar certs SSL manualmente
Traefik renueva automáticamente. Para forzar:
```bash
# Borrar acme.json (Traefik lo regenerará)
docker exec $(docker ps -q -f name=traefik | head -1) sh -c "rm /etc/escapemaster/traefik/dynamic/acme.json"
docker service update --force traefik
```