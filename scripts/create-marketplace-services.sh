#!/usr/bin/env bash
# create-marketplace-services.sh
set -euo pipefail

: "${PROD_PG_PASS:?Set PROD_PG_PASS}"
: "${DEV_PG_PASS:?Set DEV_PG_PASS}"
: "${JWT_SECRET:?Set JWT_SECRET}"
: "${RESEND_API_KEY:?Set RESEND_API_KEY}"
: "${MASTER_USER:=admin}"
: "${MASTER_PASS:?Set MASTER_PASS}"
: "${R2_ACCOUNT_ID:?Set R2_ACCOUNT_ID}"
: "${R2_ACCESS_KEY_ID:?Set R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?Set R2_SECRET_ACCESS_KEY}"
: "${R2_BUCKET_NAME:=master}"
: "${R2_ENDPOINT:?Set R2_ENDPOINT}"
: "${R2_PUBLIC_BASE_URL:?Set R2_PUBLIC_BASE_URL}"
: "${PUBLIC_GOOGLE_CLIENT_ID:?Set PUBLIC_GOOGLE_CLIENT_ID}"
: "${STRIPE_SECRET_KEY:=sk_placeholder}"
: "${PUBLIC_STRIPE_KEY:=pk_placeholder}"
: "${GOOGLE_CLIENT_SECRET:=placeholder}"

NETWORK="escapemaster-network"

create() {
  local name="$1"
  echo "=== Creating $name ==="
  docker service create --name "$name" "$@" 2>&1 | tail -3
}

# --- API v1 (production) ---
create escapemaster-market-api-v1 \
  --network "$NETWORK" \
  --env "DATABASE_URL=postgresql://root:${PROD_PG_PASS}@escapemaster-market-postgres-prod:5432/marketdb" \
  --env "PUBLIC_API_URL=https://escapemaster.es/api/v1" \
  --env "CORS_ORIGINS=https://escapemaster.es,https://master.escapemaster.es" \
  --env "ENVIRONMENT=production" \
  --env "API_VERSION=v1" \
  --env "PORT=9101" \
  --env "JWT_SECRET=${JWT_SECRET}" \
  --env "PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "RESEND_API_KEY=${RESEND_API_KEY}" \
  --env "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
  --env "R2_ACCOUNT_ID=${R2_ACCOUNT_ID}" \
  --env "R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}" \
  --env "R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}" \
  --env "R2_BUCKET_NAME=${R2_BUCKET_NAME}" \
  --env "R2_ENDPOINT=${R2_ENDPOINT}" \
  --env "R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}" \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=${NETWORK}" \
  --label "traefik.http.routers.market-api-v1.entrypoints=websecure" \
  --label "traefik.http.routers.market-api-v1.rule=Host(\`escapemaster.es\`) && PathPrefix(\`/api/v1\`)" \
  --label "traefik.http.routers.market-api-v1.tls=true" \
  --label "traefik.http.routers.market-api-v1.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.market-api-v1.loadbalancer.server.port=9101" \
  escapemaster-market-api-v1:latest

# --- API v2 (pre-prod) ---
create escapemaster-market-api-v2 \
  --network "$NETWORK" \
  --env "DATABASE_URL=postgresql://root:${DEV_PG_PASS}@escapemaster-market-postgres-dev:5432/marketdb" \
  --env "PUBLIC_API_URL=https://dev.escapemaster.es/api/v2" \
  --env "CORS_ORIGINS=https://dev.escapemaster.es" \
  --env "ENVIRONMENT=preproduction" \
  --env "API_VERSION=v2" \
  --env "PORT=9102" \
  --env "JWT_SECRET=${JWT_SECRET}" \
  --env "PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "RESEND_API_KEY=${RESEND_API_KEY}" \
  --env "STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}" \
  --env "R2_ACCOUNT_ID=${R2_ACCOUNT_ID}" \
  --env "R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}" \
  --env "R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}" \
  --env "R2_BUCKET_NAME=${R2_BUCKET_NAME}" \
  --env "R2_ENDPOINT=${R2_ENDPOINT}" \
  --env "R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}" \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=${NETWORK}" \
  --label "traefik.http.routers.market-api-v2.entrypoints=websecure" \
  --label "traefik.http.routers.market-api-v2.rule=Host(\`dev.escapemaster.es\`) && PathPrefix(\`/api/v2\`)" \
  --label "traefik.http.routers.market-api-v2.tls=true" \
  --label "traefik.http.routers.market-api-v2.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.market-api-v2.loadbalancer.server.port=9102" \
  escapemaster-market-api-v1:latest

# --- Frontend prod ---
create escapemaster-market-frontend-prod \
  --network "$NETWORK" \
  --env "PUBLIC_API_URL=https://escapemaster.es/api/v1" \
  --env "NODE_ENV=production" \
  --env "PORT=3101" \
  --env "PUBLIC_STRIPE_KEY=${PUBLIC_STRIPE_KEY}" \
  --env "PUBLIC_CMS_API_URL=https://master.escapemaster.es" \
  --env "PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}" \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=${NETWORK}" \
  --label "traefik.http.routers.market-frontend-prod.entrypoints=websecure" \
  --label "traefik.http.routers.market-frontend-prod.rule=Host(\`escapemaster.es\`) && !PathPrefix(\`/api\`)" \
  --label "traefik.http.routers.market-frontend-prod.priority=1" \
  --label "traefik.http.routers.market-frontend-prod.tls=true" \
  --label "traefik.http.routers.market-frontend-prod.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.market-frontend-prod.loadbalancer.server.port=3101" \
  escapemaster-market-frontend-prod:latest

# --- Frontend dev (separar imagen) ---

# --- Frontend dev ---
create escapemaster-market-frontend-dev \
  --network "$NETWORK" \
  --env "PUBLIC_API_URL=https://dev.escapemaster.es/api/v2" \
  --env "NODE_ENV=production" \
  --env "PORT=3102" \
  --env "PUBLIC_STRIPE_KEY=${PUBLIC_STRIPE_KEY}" \
  --env "PUBLIC_CMS_API_URL=https://master.escapemaster.es" \
  --env "PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}" \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=${NETWORK}" \
  --label "traefik.http.routers.market-frontend-dev.entrypoints=websecure" \
  --label "traefik.http.routers.market-frontend-dev.rule=Host(\`dev.escapemaster.es\`) && !PathPrefix(\`/api\`)" \
  --label "traefik.http.routers.market-frontend-dev.priority=1" \
  --label "traefik.http.routers.market-frontend-dev.tls=true" \
  --label "traefik.http.routers.market-frontend-dev.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.market-frontend-dev.loadbalancer.server.port=3102" \
  escapemaster-market-frontend-dev:latest

# --- Master admin ---
create escapemaster-market-master \
  --network "$NETWORK" \
  --env "DATABASE_URL=postgresql://root:${PROD_PG_PASS}@escapemaster-market-postgres-prod:5432/marketdb" \
  --env "MASTER_USER=${MASTER_USER}" \
  --env "MASTER_PASS=${MASTER_PASS}" \
  --env "JWT_SECRET=${JWT_SECRET}" \
  --env "RESEND_API_KEY=${RESEND_API_KEY}" \
  --env "PUBLIC_API_URL=https://escapemaster.es/api/v1" \
  --env "NODE_ENV=production" \
  --env "PORT=3103" \
  --env "R2_ACCOUNT_ID=${R2_ACCOUNT_ID}" \
  --env "R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}" \
  --env "R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}" \
  --env "R2_BUCKET_NAME=${R2_BUCKET_NAME}" \
  --env "R2_ENDPOINT=${R2_ENDPOINT}" \
  --env "R2_PUBLIC_BASE_URL=${R2_PUBLIC_BASE_URL}" \
  --env "PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID}" \
  --env "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}" \
  --label "traefik.enable=true" \
  --label "traefik.docker.network=${NETWORK}" \
  --label "traefik.http.routers.market-master.entrypoints=websecure" \
  --label "traefik.http.routers.market-master.rule=Host(\`master.escapemaster.es\`)" \
  --label "traefik.http.routers.market-master.tls=true" \
  --label "traefik.http.routers.market-master.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.market-master.loadbalancer.server.port=3103" \
  escapemaster-market-master:latest

echo "=== ALL CREATED ==="
docker service ls --filter name=escapemaster-market