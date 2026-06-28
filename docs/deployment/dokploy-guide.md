# Deployment Guide - Dokploy

## Overview

This guide covers deploying all three apps to Dokploy.

## Apps

| App | Port | Dockerfile | docker-compose |
|-----|------|------------|----------------|
| **web/frontend** | 4321 | ✅ | ✅ |
| **web/api** | 8000 | ✅ | ✅ |
| **master** | 4322 | ✅ | ✅ |

---

## Pre-deployment Checklist

1. [ ] All builds pass locally
2. [ ] Environment variables configured
3. [ ] Database migrations run
4. [ ] Dockerfiles tested locally

---

## Build Verification

```bash
# Build all apps
cd web/frontend && npm run build
cd ../api && npm run build
cd ../master && npm run build
```

### Build Results

| App | Status | Output |
|-----|--------|--------|
| web/frontend | ✅ Complete | `dist/` ~190KB client JS |
| web/api | ✅ Complete | `dist/` |
| master | ✅ Complete | `dist/` with VisualEditor |

---

## Docker Local Testing

### Test each app locally

```bash
# web/frontend
cd web/frontend
docker build -t escapemaster-frontend .
docker run -p 4321:4321 --env-file .env escapemaster-frontend

# web/api
cd web/api
docker build -t escapemaster-api .
docker run -p 8000:8000 --env-file .env escapemaster-api

# master
cd master
docker build -t escapemaster-master .
docker run -p 4322:4322 --env-file .env escapemaster-master
```

---

## Dokploy Setup

### 1. Create Networks

```bash
docker network create dokploy-network
```

### 2. Create Projects in Dokploy

Create 3 projects:
- `escapemaster-frontend` → web/frontend
- `escapemaster-api` → web/api
- `escapemaster-master` → master

### 3. Environment Variables

For each project, configure:

#### web/frontend
```env
NODE_ENV=production
DATABASE_URL=postgresql://root:Diegoelmejor1.0@localhost:5432/marketdb
PUBLIC_API_URL=http://localhost:8000
PUBLIC_CMS_API_URL=http://localhost:4322
```

#### web/api
```env
NODE_ENV=production
DATABASE_URL=postgresql://root:Diegoelmejor1.0@localhost:5432/marketdb
JWT_SECRET=your_jwt_secret_here
```

#### master
```env
NODE_ENV=production
DATABASE_URL=postgresql://root:Diegoelmejor1.0@localhost:5432/marketdb
JWT_SECRET=your_jwt_secret_here
MASTER_USER=Randalls
MASTER_PASS=Randalls_Master_2026!
```

---

## Database Migration

Before deploying master, run the CMS migration:

```bash
cd master
psql $DATABASE_URL -f scripts/cms-schema.sql
```

### Verify Tables

```sql
\dt site_pages
\dt design_components
\dt page_sections
\dt page_seo
\dt page_visibility
```

---

## Deploy Commands

### web/frontend
```bash
docker-compose -f web/frontend/docker-compose.yml up -d
```

### web/api
```bash
docker-compose -f web/api/docker-compose.yml up -d
```

### master
```bash
docker-compose -f master/docker-compose.yml up -d
```

---

## Health Checks

After deployment, verify:

```bash
# web/frontend
curl -f http://localhost:4321/

# web/api
curl -f http://localhost:8000/health

# master  
curl -f http://localhost:4322/
```

---

## Rollback

If issues arise:

```bash
# Pull previous image/tag
docker pull escapemaster/frontend:latest

# Or restart with previous tag
docker-compose -f web/frontend/docker-compose.yml pull
docker-compose -f web/frontend/docker-compose.yml up -d
```

---

## Monitoring

Check logs:

```bash
docker logs escapemaster-frontend
docker logs escapemaster-api
docker logs escapemaster-master
```

---

## New Features

When deploying updates with new CMS features:

1. **Rebuild** the app locally first
2. **Test** the Docker image locally
3. **Push** to registry (if using remote registry)
4. **Deploy** via Dokploy UI or CLI

### With Registry

```bash
# Tag
docker tag escapemaster-master:latest registry.dokploy.io/user/escapemaster-master:latest

# Push
docker push registry.dokploy.io/user/escapemaster-master:latest
```
