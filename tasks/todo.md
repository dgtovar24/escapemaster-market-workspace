# EscapeMaster — TODO

## Completed Features

### Fase 1: Bugfixes y Ajustes Visuales

- [x] **f-01** Fix: Boton de filtros mobile no funciona
- [x] **f-02** Fix: Eliminar fondo beige (#f4e9cd) y reemplazar por blanco
- [x] **f-03** Verificar filtros desktop y mobile funcionan end-to-end

### Fase 2: Seed Data (API + BD)

- [x] **f-04** Crear datos seed: Usuarios ficticios (12 usuarios con correos @escapemaster.test)
- [x] **f-05** Crear datos seed: Equipos (8 squads, mezcla publicos y privados)
- [x] **f-06** Crear datos seed: Rutas de usuario (vinculadas a curated_collections)

### Fase 3: Social — Creacion de Rutas por Usuarios

- [x] **f-07** UI: Pagina "Crear Mi Ruta" (/[lang]/routes/create)
- [x] **f-08** API: Endpoints para crear/editar rutas de usuario (/api/routes/user)

### Fase 4: Social — Sistema de Equipos Mejorado

- [x] **f-09** Mejorar creacion de equipos: nombre personalizado + privado/publico
- [x] **f-10** Pagina de perfil de equipo mejorada (teams/[id].astro)

### Fase 5: Social — Chat entre Usuarios

- [x] **f-11** Diseno de BD: Tablas de mensajeria (conversations, conversation_participants, messages)
- [x] **f-12** API: Endpoints de chat (conversations, messages, unread)
- [x] **f-13** UI: ChatWidget.tsx con polling cada 5s
- [x] **f-14** Chat grupal en equipos (vinculado a squads via squad_id)

### Fase 6: Red Social — Perfiles y Descubrimiento

- [x] **f-15** Perfil publico de usuario (/[lang]/player/[id])
- [x] **f-16** Feed social / actividad reciente (SocialFeed.tsx + /api/social/feed)

### Fase 7: Documentacion

- [x] **f-17** Documentar todos los endpoints API nuevos
- [x] **f-18** Documentar esquema de BD actualizado
- [x] **f-19** Actualizar CLAUDE.md con el estado actual del proyecto

### Fase 8: Analytics y Mejoras Auth (Mar 2026)

- [x] **f-20** Analytics: tablas BD (analytics_events, analytics_sessions, analytics_page_views, analytics_heatmap_clicks, analytics_booking_funnels, analytics_daily_metrics)
- [x] **f-21** Analytics: client-side tracking utility (web/src/lib/tracking.ts — event batching, page views, clicks, booking funnel, search)
- [x] **f-22** Analytics: event collection endpoint (web POST /api/analytics/events)
- [x] **f-23** Analytics: daily aggregation cron endpoint (web POST /api/analytics/aggregate)
- [x] **f-24** Analytics: Excel export (master POST /api/analytics/export via exceljs)
- [x] **f-25** Analytics: heatmap data endpoint (master GET /api/analytics/heatmap-data)
- [x] **f-26** Auth: Google login preserva account_type existente, mejores mensajes de error
- [x] **f-27** Login: simplificado — eliminado boton "Soy propietario", auto-deteccion de tipo de cuenta
- [x] **f-28** Rooms master: eliminadas referencias a columna booking_url, usa erd_url

### Fase 9: Bugfixes Analytics

- [x] **f-29** exceljs en master/package.json (export endpoint requiere dependencia)
- [x] **f-30** Sanitizar daysBack en heatmap-data.ts — SQL injection risk

### Fase 10: Email AWS SES Migration (Abr 2026)

- [x] **f-39** Migrar de Resend a AWS SES (@aws-sdk/client-ses) en web/api
- [x] **f-40** Crear email.ts y email-templates.ts en web/frontend y master
- [x] **f-41** Conectar booking confirmation email en payment webhook
- [x] **f-42** Database migration: agregar columnas faltantes (organizations: email, phone, address, city; rooms: fear_type, fear_contact, experience_type)

### Fase 11: UI/UX Improvements (Abr 2026)

- [x] **f-43** Responsive sidebar master (mobile overlay, desktop sticky, two separate elements)
- [x] **f-44** Dashboard master refactorizado (borderless cards, responsive grid, smaller headings)
- [x] **f-45** Forms master actualizados (experience types, accessibility levels, pre-select org via ?org_id=, Tarjeta de Contacto)
- [x] **f-46** AGENTS.md reescrito (384 → 170 lines, facts verified)
- [x] **f-47** Docker cache fix: ADD cachebust en los 3 Dockerfiles

---

## Pending Features

### Analytics — Mejoras pendientes

- [ ] **f-31** Dashboard de analytics en master (visualizacion con recharts de metricas diarias, graficos de tendencias)
- [ ] **f-32** Configurar cron job en Vercel para /api/analytics/aggregate (actualmente manual)

### Chat v2

- [ ] **f-33** WebSocket/SSE para mensajes en tiempo real (reemplazar polling HTTP cada 5s)
- [ ] **f-34** Notificaciones push para mensajes nuevos

### Refactoring

- [ ] **f-35** Refactorizar AdvancedFilters.tsx (917 lineas — dividir en subcomponentes)
- [ ] **f-36** Unificar CalendarReservations.tsx (actualmente duplicado en web/ y master/)
- [ ] **f-48** Refactorizar OnboardingEnterpriseWizard multi-paso (plan en .agent/refactor_flujo_empresa_onboarding_ed9babe7.plan.md)

### Infraestructura

- [ ] **f-37** Implementar auth real en master (actualmente cookie simple con env vars)
- [ ] **f-38** Proteger endpoints /api/seed y /api/migrate-chat con auth real (actualmente clave simple)

### Pending en Dokploy (requiere accion humana)

- [ ] Configurar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en los 3 proyectos
- [ ] Configurar PUBLIC_API_URL para web/frontend en produccion

---

## Skills Disponibles y Relevantes

| Skill | Uso en este proyecto |
|-------|---------------------|
| `astro` | Framework principal — pages, islands, SSR, i18n |
| `react-expert` | Islands interactivos (chat, filtros, equipos, rutas, analytics dashboard) |
| `frontend-design` | UI/UX de calidad, paleta tropical |
| `tailwind-v4-shadcn` | Sistema de estilos, variables CSS, componentes CVA |
| `api-designer` | Diseno de endpoints REST (chat, rutas, equipos, analytics) |
| `backend-patterns` | Patrones de API, autenticacion, DB |
| `sql-pro` | Queries, migraciones, seed data, analytics aggregation |
| `postgres-pro` | Indices, performance, JSONB |
| `secure-code-guardian` | Auth JWT, validacion, OWASP Top 10 |
| `websocket-engineer` | Chat en tiempo real (Fase 2 del chat) |
| `architecture-designer` | Diseno del sistema de mensajeria y analytics |
| `frontend-patterns` | Estado con Nanostores, performance |
| `playwright-expert` | Tests E2E de filtros y flujos criticos |
| `code-documenter` | Documentacion API y esquema BD |
| `i18n-expert` | Traducciones es/en para nuevas features |

---

## Prioridad de Ejecucion

1. **Inmediato**: configurar AWS credentials en Dokploy (falta solo action)
2. **Corto plazo**: f-31, f-32 (analytics dashboard y cron), f-37 (auth master)
3. **Medio plazo**: f-33, f-34 (chat v2 WebSocket), f-35 (AdvancedFilters refactor)
4. **Largo plazo**: f-36 (CalendarReservations), f-38 (proteger seed/migrate), f-48 (onboarding enterprise)
