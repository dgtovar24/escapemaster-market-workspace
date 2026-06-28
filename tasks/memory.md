# EscapeMaster — Memory

## Project

- **Tipo**: Marketplace + Red Social de escape rooms en España
- **Repos**: `web/frontend` (market), `web/api` (API), `master/` (B2B admin)
- **Stack**: Astro 5 SSR + React 19 islands + Tailwind v4 + PostgreSQL directo (pg) + Stripe + JWT auth
- **BD**: PostgreSQL en localhost — 70+ tablas en schema `public` y catálogo externo (baul)
- **Deploy**: Dokploy (Node standalone) — Docker cache fix aplicado (ADD cachebust)

## Current state

### Activo
- Red social de escape rooms COMPLETADA (todas las fases implementadas)
- Sistema de analytics implementado (6 tablas nuevas, tracking client-side, agregacion diaria, export Excel, heatmaps)
- Auth Google mejorado (preserva account_type, mejores mensajes de error)
- Login simplificado (sin boton "Soy propietario", auto-deteccion de tipo de cuenta)
- Email migrado de Resend a AWS SES (Abr 2026)
- Responsive sidebar en master (mobile overlay, desktop sticky)
- Dashboard master refactorizado (borderless cards, responsive grid)

### Blockers
- AWS SES credentials pendientes de configurar en Dokploy (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` vazías)
- `PUBLIC_API_URL` en web/frontend prod apunta a localhost

### Contexto técnico
- Filtros: `AdvancedFilters.tsx` (917 lineas) con debounce 800ms
- Paleta: Fondo blanco (#ffffff), variable `--color-tropical-bg` actualizada
- Chat: 3 tablas nuevas (conversations, conversation_participants, messages) + trigger de timestamp
- Chat API: /api/chat/conversations (GET/POST), /api/chat/messages (GET/POST), /api/chat/unread (GET)
- ChatWidget.tsx: React island con polling cada 5s
- Rutas usuario: API en /api/routes/user + pagina /[lang]/routes/create con selector de salas
- Perfiles: /[lang]/player/[id] con stats, equipos, rutas, historial, boton "Enviar Mensaje"
- Feed social: /api/social/feed combina bookings, squads, routes, reviews en un feed unificado
- Seed: POST /api/seed?key=seed2026 — 12 usuarios, 8 equipos, rutas
- Migracion: POST /api/migrate-chat?key=migrate2026 — tablas de chat + indices + trigger
- Analytics: 6 tablas nuevas (analytics_events, analytics_sessions, analytics_page_views, analytics_heatmap_clicks, analytics_booking_funnels, analytics_daily_metrics)
- Analytics client: `web/src/lib/tracking.ts` — singleton con event batching (batch size 10, flush cada 5s)
- Analytics API (web): POST /api/analytics/events (collect), POST /api/analytics/aggregate (cron con x-api-key)
- Analytics API (master): POST /api/analytics/export (Excel via exceljs), GET /api/analytics/heatmap-data
- Rooms (master): eliminadas referencias a columna `booking_url` (no existe), usa `erd_url`
- Organizations (master):新增 email, phone, address, city columns
- Rooms (master): 新增 fear_type, fear_contact, experience_type columns
- Experience types: Aventura, Miedo, Terror, Misterio, Familiar (con conditional fear_type/fear_contact)
- Accessibility levels: Todos los públicos, Accesible silla de ruedas, Requiere agilidad mínima
- Email: AWS SES con remitentes noreply@, reservas@, support@escapemaster.es

### Skills instaladas
- `astro` (astrolicious/agent-skills) — instalada globalmente
- Skills del sistema: react-expert, frontend-design, tailwind-v4-shadcn, api-designer, sql-pro, postgres-pro, secure-code-guardian, websocket-engineer, architecture-designer, code-documenter, playwright-expert, i18n-expert

## Key decisions

- 2026-02-11: EscapeMaster transformado en red social (chat, perfiles, feed)
- 2026-02-11: Fondo beige (#f4e9cd) reemplazado por blanco (#ffffff) en web y master
- 2026-02-11: Chat v1 con polling HTTP cada 5s; WebSocket para v2 futura
- 2026-02-11: Seed data con 12 usuarios, 8 equipos (publicos/privados), rutas vinculadas
- 2026-02-11: Rutas de usuario usan curated_collections con campo created_by_user_id
- 2026-02-11: Chat grupal vinculado automaticamente al crear equipo (squad_id en conversations)
- 2026-03-20: Analytics system — client-side event batching (tracking.ts singleton), server-side aggregation cron, 6 tablas nuevas
- 2026-03-20: Google auth — preservar account_type existente al hacer login (no sobrescribir con default)
- 2026-03-20: Login simplificado — eliminado boton "Soy propietario", auto-deteccion de tipo de cuenta en backend
- 2026-03-20: Rooms master — eliminada columna booking_url (no existe en BD), se usa erd_url para reservas externas
- 2026-03-20: Agregacion diaria protegida por ANALYTICS_JOB_KEY env var (header x-api-key)
- 2026-04-07: Email migrado de Resend a AWS SES (@aws-sdk/client-ses) — web/api, web/frontend, master
- 2026-04-07: Docker cache fix — ADD cachebust en los 3 Dockerfiles para forzar rebuild en cada deploy
- 2026-04-07: Sidebar master responsive — overlay mobile, sticky desktop, dos elementos separados
- 2026-04-07: Dashboard master refactorizado — borderless cards, responsive 2→3→5 cols, smaller headings
- 2026-04-07: Forms master actualizados — experience types, accessibility, pre-select org via ?org_id=, Tarjeta de Contacto

## Completed

- f-01: Fix boton filtros mobile (quitar showMobile del AdvancedFilters dentro del modal)
- f-02: Fondo beige → blanco (global.css, Layout.astro, game/[id].astro, profile.astro, master global.css)
- f-03: Filtros verificados (desktop sidebar + mobile modal + URL params + SQL dinamico)
- f-04: Seed usuarios (12 con correos @escapemaster.test, XP variados, ranks)
- f-05: Seed equipos (8 squads, mezcla publicos/privados, miembros asignados)
- f-06: Seed rutas (vinculadas a curated_collections existentes)
- f-07: Pagina "Crear Mi Ruta" (/[lang]/routes/create) con selector + busqueda
- f-08: API rutas usuario (GET/POST/DELETE en /api/routes/user)
- f-09: Equipos mejorados (nombre, motto, descripcion, publico/privado)
- f-10: Perfil equipo (ya existia en teams/[id].astro)
- f-11: Tablas chat (conversations, conversation_participants, messages + indices + trigger)
- f-12: API chat (conversations, messages, unread — 3 endpoints)
- f-13: UI chat (ChatWidget.tsx + pagina /[lang]/chat)
- f-14: Chat grupal (vinculado a squads via squad_id)
- f-15: Perfil publico (/[lang]/player/[id] con stats, equipos, rutas, boton mensaje)
- f-16: Feed social (SocialFeed.tsx + /api/social/feed, integrado en home)
- f-17: Documentacion API (docs/api/README.md)
- f-18: Documentacion BD (docs/api/database-schema.md)
- f-19: CLAUDE.md actualizado con nuevas features y estado
- f-29: exceljs en master/package.json (requerido por endpoint export en master)
- f-30: Sanitizar daysBack en heatmap-data.ts (SQL injection risk)
- Docker cache fix: ADD cachebust en web/frontend, web/api, master Dockerfiles
- Email SES migration: email.ts reescrito en web/api, creado en web/frontend y master
- Payment webhook: booking confirmation email on successful payment
- Organizations: nuevas columnas email, phone, address, city (migrate-contact.cjs)
- Rooms master: fear_type, fear_contact, experience_type columns
- Responsive sidebar master (mobile overlay + desktop sticky)
- Dashboard master refactorizado

## Pending (from todo.md)

- f-31: Dashboard analytics en master (recharts visualization)
- f-32: Cron job analytics aggregation
- f-33: Chat v2 WebSocket/SSE (reemplazar polling 5s)
- f-34: Notificaciones push para mensajes
- f-35: Refactorizar AdvancedFilters.tsx (917 lineas)
- f-36: Unificar CalendarReservations.tsx (duplicated in web/ and master/)
- f-37: Implementar auth real en master (cookie simple → JWT)
- f-38: Proteger /api/seed y /api/migrate-chat con auth real

## Notes / gotchas

- `AdvancedFilters.tsx` tiene 917 lineas — candidato a refactor futuro
- `shared_vendor/CalendarReservations.tsx` esta duplicado en web/ y master/
- `lib/r2.ts` duplicado en web/frontend y master/ — cambios en uno no se reflejan en el otro
- `web/api` NO está en el npm workspace — gestionar independientemente
- Master no tiene auth JWT propia (cookie simple `master_session` via env vars)
- SQL de search.astro usa queries parametrizadas correctamente ($1, $2, etc.)
- El endpoint /api/seed y /api/migrate-chat estan protegidos por clave simple
- La columna `booking_url` NO existe en la tabla rooms — usar `erd_url`
- `PUBLIC_API_URL` en web/frontend/.env = localhost:8000 — debe configurarse en Dokploy para producción
- Docker cache: sin cachebust, Dokploy reutiliza capas y no ve cambios hasta reiniciar container
- ADD con URL externa nunca se cachea en Docker — usado para cachebust en todos los Dockerfiles
- AGENTS.md reescrito (384 → 170 lines) — facts verified against actual files
- Los 3 Dockerfiles empujados: web/frontend (7777a9a), web/api (b3ef3eb), master (5ab90e5)

## Planes activos

- `docs/migracion-manager-canonico.md` — plan de migracion a manager/api canónico
- `.agent/refactor_flujo_empresa_onboarding_ed9babe7.plan.md` — refactor onboarding enterprise (pendiente, no iniciado)
