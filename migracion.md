# Guía de Migración Docker Image - Escapemaster Frontend

Guía para migrar el deployment del frontend de Git-based a Docker Image usando GHCR con las credenciales del owner `dgtovar`.

## Credenciales

| Campo | Valor |
|-------|-------|
| Registry | `ghcr.io` |
| Username | `dgtovar` |
| Password | `GHCR_PAT` (variable de entorno, nunca hardcodear) |
| Image | `ghcr.io/dgtovar/escapemaster-frontend:v0.2` (o el tag actual) |

## Requisitos

- Docker instalado localmente
- PAT token de GitHub con permisos `write:packages`
- Acceso a Dokploy como administrador
- Acceso SSH al servidor (para troubleshooting)

---

## Paso 1: Login a GHCR

```bash
export GHCR_PAT=your_ghcr_pat_token
echo "$GHCR_PAT" | docker login ghcr.io -u dgtovar --password-stdin
```

> **Nota**: Obtén tu PAT en GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token con `write:packages`.

Debe mostrar: `Login Succeeded`

---

## Paso 2: Build y Push de la Imagen

### Opción A: Usar el script automático (recomendado)

```bash
export GHCR_PAT=your_ghcr_pat_token
./scripts/deploy-frontend.sh https://my.escapemaster.es/api/v1
```

Esto:
1. Incrementa la versión en `VERSION` (0.1 → 0.2 → etc)
2. Build la imagen con los args correctos
3. Hace push a `ghcr.io/dgtovar/escapemaster-frontend:v0.X`
4. Actualiza el servicio en Swarm

### Opción B: Build manual

```bash
# Tag con versión semántica
TAG=v0.2

# Build
docker build -f Dockerfile.production \
  -t ghcr.io/dgtovar/escapemaster-frontend:$TAG \
  --build-arg NEXT_PUBLIC_API_URL="https://my.escapemaster.es/api/v1" \
  --build-arg NEXT_PUBLIC_APP_URL="https://my.escapemaster.es" \
  .

# Push
docker push ghcr.io/dgtovar/escapemaster-frontend:$TAG
```

---

## Paso 3: Configurar Dokploy (Docker Image)

### Si ya tienes el proyecto configurado:

1. Ir al proyecto `manager-frontend-erhb6r` en Dokploy
2. Cambiar **Deployment Type** → **Docker Image**
3. Configurar:
   - **Image**: `ghcr.io/dgtovar/escapemaster-frontend:v0.2`
   - **Registry**: `ghcr.io`
   - **Username**: `dgtovar`
   - **Password**: `GHCR_PAT` (la variable de entorno)
   - **Port**: `3000`
   - **Network**: `dokploy-network`
4. Guardar

### Si quieres actualizar solo la imagen sin cambiar Dokploy:

```bash
# Ir al servidor y ejecutar:
docker service update \
  --image ghcr.io/dgtovar/escapemaster-frontend:v0.2 \
  manager-frontend-erhb6r
```

---

## Paso 4: Verificar el Deploy

```bash
# Estado del servicio
docker service ps manager-frontend-erhb6r

# Respuesta del sitio
curl -s -o /dev/null -w "%{http_code}" https://my.escapemaster.es/
# Debe devolver 307 (redirect a /dashboard) o 200

# Logs del servicio
docker service logs manager-frontend-erhb6r --tail 20
```

---

## Troubleshooting

### "pull access denied" o "manifest unknown"

La imagen no existe en GHCR. Solución:
1. Ejecutar el script de deploy localmente primero
2. Verificar que el push completó sin errores

### "access denied" en login

El PAT es incorrecto o no tiene permisos `write:packages`. Verificar en GitHub:
- Settings → Developer settings → Personal access tokens
- Asegurarse que el token tenga `write:packages`

### 502 Bad Gateway

Problemas de networking. Verificar:
```bash
# Ver redes del contenedor
docker network ls | grep dokploy

# Ver logs del servicio
docker service logs manager-frontend-erhb6r --tail 50

# Verificar que el contenedor está en la red correcta
docker inspect $(docker service ps -q manager-frontend-erhb6r) --format '{{json .NetworkSettings.Networks}}'
```

### Contenedor sale con código 137 (OOM)

Memoria insuficiente. Solución:
```bash
# Ver uso de memoria
docker stats

# Reducir réplicas si hay múltiples contenedores
docker service update --replicas 1 manager-frontend-erhb6r
```

### El sitio carga pero muestra API vieja

La imagen no se actualizó. Forzar re-deploy:
```bash
docker service update --force manager-frontend-erhb6r
```

---

## Comandos Útiles

```bash
# Login a GHCR
export GHCR_PAT=your_ghcr_pat_token
echo "$GHCR_PAT" | docker login ghcr.io -u dgtovar --password-stdin

# Ver imágenes en GHCR
docker manifest inspect ghcr.io/dgtovar/escapemaster-frontend:v0.2

# Ver estado del servicio
docker service ps manager-frontend-erhb6r

# Ver logs
docker service logs manager-frontend-erhb6r --tail 50

# Ver imagen actual del servicio
docker service inspect manager-frontend-erhb6r --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}'

# Actualizar imagen manualmente
docker service update --image ghcr.io/dgtovar/escapemaster-frontend:v0.2 manager-frontend-erhb6r

# Forzar re-deploy
docker service update --force manager-frontend-erhb6r

# Ver redes disponibles
docker network ls

# Ver todos los servicios
docker service ls
```

---

## Variables de Build

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://my.escapemaster.es/api/v1` | URL de la API de producción |
| `NEXT_PUBLIC_APP_URL` | `https://my.escapemaster.es` | URL de la app |

Estas se pasan con `--build-arg` durante el build y se hornean en la imagen.

---

## Notes

1. **Tags únicos siempre**: Nunca reutilizar `latest` ni tags genéricos. Usar versionamiento semántico (`v0.1`, `v0.2`...).

2. **PAT con permisos**: El token necesita `write:packages` para hacer push a GHCR.

3. **Network**: Los servicios deben estar en `dokploy-network` para comunicarse con la base de datos y otros servicios.

4. **Puerto interno**: El contenedor usa puerto `3000` internamente. Traefik routing maneja la exposición externa.
