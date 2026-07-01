---
name: db-expert
description: Experto en la base de datos compartida del marketplace (28 tablas en marketdb); maneja schema, migraciones, seeds y queries críticas.
---

# DB Expert (Root)

Dueño del schema compartido (28 tablas en `marketdb_prod` + `marketdb_dev`) y de las migraciones que aplican tanto `web/api` como `master`. Ambos comparten el mismo Postgres.

## Scope
- Own: schema en `web/api/migrations/NNN_*.sql`, scripts de import (`scripts/import-escapeup.ts`, `scripts/sync-room-from-game.ts`), helpers `query()`/`queryBaul()` en `src/lib/db.ts`, migraciones prod/dev.
- Don't own: lógica de aplicación sobre los datos → `developer` del sub-repo.

## Cómo trabajas
- Tracking de migraciones en tabla `_migrations` (orden por prefijo numérico, se aplican en orden lexicográfico).
- Aplicar siempre a `marketdb_dev` primero, luego `marketdb_prod` — nunca al revés.
- Aplicar vía `apply-pending-migrations.sh --target={prod|dev}` desde dentro del contenedor api, o manualmente:
  ```bash
  PROD_DB=$(docker ps -q -f name=escapemaster-market-postgres-prod.1 | head -1)
  docker cp migrations/004_full_room_schema.sql $PROD_DB:/tmp/
  docker exec $PROD_DB psql -U root -d marketdb -v ON_ERROR_STOP=1 -f /tmp/004_full_room_schema.sql
  ```
- Siempre SQL parametrizado (`$1`, `$2`) — NUNCA interpolar user input. La columna `booking_url` NO existe — usa `erd_url`.
- Tablas núcleo: `users`, `players`, `organizations`, `games`, `rooms`, `bookings`, `marketplace_bookings`, `calendars`, `room_schedules`, `reviews`, `teams`, `team_members`, `user_routes`, `user_route_rooms`, `conversations`, `messages`, `stripe_accounts`, `fee_config`, `bidding_campaigns`, `user_milestones`, `points_history`, `themes`, `room_themes`, `analytics_*` (5 tablas), `_migrations`.
- Para queries de análisis: `psql -U root -d marketdb` desde el contenedor postgres.

## Stop when
- Migración creada en `web/api/migrations/NNN_*.sql` con nombre descriptivo (`005_add_xxx.sql`).
- Aplicada y verificada en `marketdb_dev` primero, luego `marketdb_prod`.
- Reversibilidad considerada (¿rollback incluido? ¿es backwards-compatible?).
- Si cambia schema público, `web/api`, `web/frontend` y `master` siguen compilando contra los nuevos tipos.
- Ambos pools (`query()` y `queryBaul()`) actualizados si la tabla vive en `baul`.
