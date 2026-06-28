# EscapeMaster API Documentation

## Base URL

All API endpoints are served from the web application at `/{lang}/` prefix for pages and `/api/` for REST endpoints.

## Authentication

Most endpoints require a JWT bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/login` and stored in `localStorage` as `em_token`.

## Canonical integration roadmap

This repository still documents the current `marketplace/web` API surface, but
the target architecture moves canonical booking and payment operations to
`manager/api`.

Use these documents as the source for the rollout:

- [`manager/api` canonical ADR](../../../manager/api/docs/adr-manager-api-canonico.md)
- [Bidirectional onboarding](../../../manager/api/docs/onboarding-bidireccional-marketplace.md)
- [Marketplace booking API v1](../../../manager/api/docs/api-reservas-marketplace-v1.md)
- [Publication and catalog sync](../../../manager/api/docs/publicacion-marketplace.md)
- [Payments and settlement](../../../manager/api/docs/pagos-liquidacion-marketplace.md)
- [Marketplace migration plan](../migracion-manager-canonico.md)

---

## Auth Endpoints

### POST /api/auth/register
Create a new user account with email verification.

**Body:**
```json
{ "email": "user@example.com", "password": "...", "full_name": "..." }
```

### POST /api/auth/login
Authenticate and receive a JWT token.

**Body:**
```json
{ "email": "user@example.com", "password": "..." }
```

**Response:**
```json
{ "token": "eyJ...", "user": { "id": "...", "email": "...", "full_name": "..." } }
```

---

## Remote & External APIs (Marketplace Integration)

These endpoints facilitate communication between the Master Admin and the 
public Marketplace.

### GET /api/external/auth
Validates a marketplace API key and returns an authentication token for 
further requests.

### GET /api/external/rooms
Retrieves the full catalog of active rooms for a specific organization. 
Requires a valid Bearer token obtained from `/api/external/auth`.

---

## Analytics Endpoints

Event collection and aggregation for platform analytics.

### POST /api/analytics/events (web)
Collect batched analytics events from the client-side tracking utility (`web/src/lib/tracking.ts`). No auth required.

**Body:**
```json
{
  "events": [{ "event_name": "page_view", "properties": { "page_path": "/es/search", "device_type": "mobile" } }],
  "session_id": "1711234567890_abc123def",
  "user_id": "uuid (optional)",
  "timestamp": "2026-03-20T12:00:00.000Z"
}
```

Events are inserted into `analytics_events`. Sessions are tracked in `analytics_sessions`.

### POST /api/analytics/aggregate (web)
Daily aggregation cron job. Rolls up raw events into `analytics_daily_metrics` and `analytics_page_views`. Requires `x-api-key` header matching `ANALYTICS_JOB_KEY` env var.

**Response:**
```json
{
  "success": true,
  "aggregated": { "daily_metrics": true, "page_views": 42, "heatmap_pages": 5, "date": "2026-03-19" }
}
```

### POST /api/analytics/export (master)
Export analytics data as Excel (.xlsx). Returns a binary file download.

**Body:**
```json
{ "reportType": "full" | "analytics" | "bookings" | "users" | "pages", "startDate": "2026-03-01", "endDate": "2026-03-20" }
```

Sheets included depend on `reportType`: "Analytics" (daily metrics) and/or "Page Views". Requires `exceljs`.

### GET /api/analytics/heatmap-data (master)
Fetch normalized click heatmap data for a specific page.

**Query params:** `page` (path, required), `days` (default 7)

**Response:**
```json
{
  "success": true,
  "page": "/es/search",
  "days": 7,
  "clicks": [{ "click_x": 45, "click_y": 22, "weight": 12, "viewport_width": 1920, "viewport_height": 1080 }],
  "pageInfo": { "maxWidth": 1920, "maxHeight": 1080, "totalVisitors": 150 }
}
```

---

## Reports Endpoints

Endpoints for data extraction and system-generated reports.

### POST /api/reports
Triggers the generation of a new report.

**Body:**
```json
{ "report_type": "financial" | "bookings" | "users" | "analytics" }
```

### GET /api/reports
Downloads a specific report. Use `format=csv` for data extraction.

**Query params:** `type` (e.g., `bookings`), `format` (`csv` | `json` | `pdf`),
`period` (number of days).

---

### GET /api/auth/me
Get current authenticated user. Requires token.

### POST /api/auth/google
Authenticate with Google OAuth. Verifies Google ID token, auto-registers new users, and preserves existing `account_type` on returning users. Defaults to `customer` if no explicit type provided. Returns a local JWT.

**Body:**
```json
{ "idToken": "google-id-token", "accountType": "customer" | "enterprise" (optional), "organizationName": "..." (required if enterprise) }
```

**Response:**
```json
{ "access_token": "eyJ...", "user": { "id": "...", "email": "...", "account_type": "customer", ... } }
```

### POST /api/auth/forgot-password
Request password reset email.

### POST /api/auth/reset-password
Reset password with token from email.

### GET /api/auth/verify?code=XXXXXX
Verify email with 6-digit code.

### POST /api/auth/resend
Resend verification code.

---

## Rooms Endpoints

### GET /api/rooms/availability
Get available time slots for a room.

**Query params:** `roomId`, `date` (YYYY-MM-DD)

**Response:**
```json
{
  "slots": [{ "time": "10:00", "available": true, "booked": false, "past": false }],
  "closed": false,
  "room": { "name": "...", "duration": 60, "capacity_min": 2, "capacity_max": 6, "price_per_person": 15 }
}
```

### GET /api/rooms/nearby
Get rooms near coordinates.

**Query params:** `lat`, `lng`, `radius` (km)

---

## Teams (Squads) Endpoints

### GET /api/teams
List public squads. Supports search with `?q=`.

### POST /api/teams
Create a new squad. Requires auth.

**Body:**
```json
{
  "name": "Los Escapistas",
  "motto": "Ningun enigma se nos resiste",
  "description": "...",
  "is_public": true
}
```

**Response:**
```json
{ "id": "uuid", "invite_code": "ABC123" }
```

### GET /api/teams/my-teams
List authenticated user's squads.

### POST /api/teams/:id/join
Join a squad by invite code.

**Body:**
```json
{ "invite_code": "ABC123" }
```

---

## Routes Endpoints

### GET /api/routes/user
List authenticated user's custom routes.

### POST /api/routes/user
Create a custom user route. Requires auth.

**Body:**
```json
{
  "title": "Mi Ruta de Terror",
  "description": "Las mejores salas de terror de Madrid",
  "room_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response:**
```json
{ "success": true, "route_id": "uuid", "collection_id": "uuid" }
```

### DELETE /api/routes/user?id=uuid
Delete a user route. Requires auth + ownership.

### POST /api/routes/start
Start a curated route. Requires auth.

**Body:**
```json
{ "collectionId": "uuid", "mode": "solo" | "team", "teamId": "uuid" }
```

### POST /api/routes/reorder
Reorder rooms within a user route.

---

## Chat Endpoints

### GET /api/chat/conversations
List user's conversations with last message, unread count, and display name.

**Response:**
```json
{
  "conversations": [{
    "id": "uuid",
    "type": "direct" | "squad",
    "display_name": "Carlos Martinez",
    "last_message": "Hola!",
    "unread_count": 3,
    "updated_at": "2026-02-11T..."
  }]
}
```

### POST /api/chat/conversations
Create a new conversation.

**Body (direct):**
```json
{ "type": "direct", "target_user_id": "uuid" }
```

**Body (squad):**
```json
{ "type": "squad", "squad_id": "uuid" }
```

**Response:**
```json
{ "conversation_id": "uuid", "existing": false }
```

### GET /api/chat/messages
Fetch paginated messages for a conversation.

**Query params:** `conversation_id`, `before` (cursor), `limit` (default 50, max 100)

**Response:**
```json
{
  "messages": [{
    "id": "uuid",
    "content": "Hola!",
    "type": "text",
    "created_at": "2026-02-11T...",
    "sender_id": "uuid",
    "sender_name": "Carlos Martinez",
    "is_deleted": false
  }],
  "has_more": false
}
```

### POST /api/chat/messages
Send a message. Requires auth + conversation membership.

**Body:**
```json
{ "conversation_id": "uuid", "content": "Hola!" }
```

### GET /api/chat/unread
Get total unread message count (used for header badge).

**Response:**
```json
{ "count": 5 }
```

---

## Enterprise (B2B) Endpoints

### GET /api/enterprise/me
Get organization details for the authenticated enterprise user.

**Response:**
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": "uuid",
      "name": "...",
      "slug": "...",
      "city": "...",
      "email": "...",
      "logo": "..."
    }
  }
}
```

### GET /api/enterprise/dashboard
Get key metrics and recent bookings for the organization.

**Response:**
```json
{
  "success": true,
  "data": {
    "organizationId": "uuid",
    "roomsCount": 5,
    "bookings30": 24,
    "revenue30": 1250.50,
    "upcoming": 8,
    "recentBookings": [...],
    "dailySeries": [...]
  }
}
```

### POST /api/enterprise/connect-erd
Authenticate with ERD Panel and extract room list. Returns rooms with name, price, schedule and raw data from ERD panel.

**Body:**
```json
{ "email": "erd-user@example.com", "password": "..." }
```

**Response:**
```json
{
  "success": true,
  "cookies": "csrf_token=...; session=...",
  "rooms": [{
    "id": "123",
    "name": "La Mansión del Terror",
    "erd_game_id": 123,
    "price": "25",
    "schedule": "10:00 - 22:00",
    "raw_data": ["La Mansión del Terror", "25", "10:00 - 22:00", "2-6 jugadores"]
  }]
}
```

### POST /api/enterprise/import-erd-rooms
Import rooms from ERD Panel into the marketplace. Requires auth + organization.

**Body:**
```json
{
  "erdRooms": [{
    "id": "123",
    "name": "La Mansion del Terror",
    "erd_game_id": 123
  }],
  "erdCookies": "csrf_token=xxx; session=yyy"
}
```

**Response:**
```json
{
  "success": true,
  "imported": 5,
  "total": 7
}
```

---

## Players Endpoints

### GET /api/players/me
Get full player profile including stats and preferences.

### POST /api/players/me/onboarding
Complete player onboarding.

### GET /api/players/me/history
Get player's booking history.

### GET /api/players/search?q=...
Search for other players by name or email.

---

## Social Feed Endpoint

### GET /api/social/feed
Public social feed with recent platform activity.

**Response:**
```json
{
  "activities": [{
    "id": "uuid",
    "type": "game_completed" | "team_created" | "route_started" | "review_posted",
    "player_name": "Carlos Martinez",
    "player_id": "uuid",
    "detail": "ha completado La Mansion del Terror",
    "extra": "Madrid",
    "created_at": "2026-02-11T..."
  }]
}
```

---

## Payments Endpoints

### POST /api/payments/create-checkout
Create a Stripe Checkout Session. Requires auth.

### POST /api/payments/webhook
Stripe webhook handler (signature verification).

---

## Migration Endpoints (Development Only)

### POST /api/migrate-chat?key=migrate2026
Run chat system database migration (creates conversations, messages, conversation_participants tables).

### POST /api/seed?key=seed2026
Insert seed data (12 users, 8 squads, routes).

---

## Error Response Format

All endpoints return errors in this format:
```json
{ "error": "Descriptive error message" }
```

HTTP status codes:
- `200` — Success
- `201` — Created
- `400` — Bad request (validation error)
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (no access)
- `404` — Not found
- `409` — Conflict (duplicate)
- `500` — Internal server error
