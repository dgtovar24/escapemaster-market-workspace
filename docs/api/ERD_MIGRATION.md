# ERD to Escapemaster Migration Guide

## Overview

Escapemaster provides a built-in migration system to import data from **ERD (Escape Room Director)**, a Laravel-based escape room management platform. The migration is a **pull-based** system: the Escapemaster API authenticates into the customer's ERD panel and fetches data directly.

## Architecture

```
┌──────────────────────┐         ┌─────────────────────────────────────┐
│   ERD (Laravel)      │         │      Escapemaster API (Rust/Axum)   │
│   erdpanel.com       │◄────────│                                     │
│   (Source System)    │  HTTP   │   /erd/auth  → authenticate         │
└──────────────────────┘         │   /erd/preview → count records       │
                                 │   /erd/execute → migrate data         │
                                 └─────────────────────────────────────┘
                                         │
                                         ▼
                                 ┌─────────────────────────────────────┐
                                 │        PostgreSQL Database           │
                                 │  rooms, bookings, coupons, employees, │
                                 │  gdpr_signatures, booking_guests      │
                                 └─────────────────────────────────────┘
```

## Migration Flow

### Step 1: Authenticate

```http
POST /erd/auth
Content-Type: application/json

{
  "email": "admin@company.es",
  "password": "erd_password"
}
```

**What happens:**
1. API fetches ERD login page → extracts CSRF `_token`
2. POSTs credentials to ERD `/login` with form-encoded body
3. ERD returns session cookies (`XSRF-TOKEN`, `er_director_session`)
4. API fetches dashboard → extracts `<meta name="csrf-token">` (plain token)
5. Session is stored in `erd_migration_sessions` table with 30-min expiry

**Response:**
```json
{
  "success": true,
  "erd_session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Connected to ERD successfully"
}
```

### Step 2: Preview

```http
POST /erd/preview
Content-Type: application/json

{
  "erd_session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**What happens:**
- Fetches counts from each ERD module without importing
- Returns record counts and dependency information

**Response:**
```json
{
  "modules": [
    { "module": "rooms",     "count": 5,  "label": "Salas",      "depends_on": [] },
    { "module": "bookings",  "count": 142, "label": "Reservas",   "depends_on": ["rooms"] },
    { "module": "employees", "count": 8,   "label": "Empleados",  "depends_on": [] },
    { "module": "coupons",  "count": 12,  "label": "Cupones",    "depends_on": [] },
    { "module": "gdpr",      "count": 89,  "label": "Firmas RGPD","depends_on": ["rooms"] }
  ]
}
```

### Step 3: Execute Migration

```http
POST /erd/execute
Content-Type: application/json

{
  "erd_session_id": "550e8400-e29b-41d4-a716-446655440000",
  "modules": ["rooms", "bookings", "coupons", "employees", "gdpr"]
}
```

**Dependency order is resolved automatically:**
1. `rooms` (first — all other modules depend on it)
2. `employees` / `coupons` (independent)
3. `bookings` (depends on rooms for room_id mapping)
4. `gdpr` (depends on rooms)

## Modules

### Rooms

**Source:** ERD `/games` (HTML table) + `/api/prices/get-prices/{id}` + `/api/schedules/index`

**Target table:** `rooms` + `room_schedules`

**Mapping:**
| ERD Field | Escapemaster Field |
|-----------|-------------------|
| `id` | `erd_id` |
| `name` | `name`, `slug` |
| `players_max` | `capacity` |
| `players_min` | `capacity_min` |
| `duration` | `duration_minutes` |
| `difficulty` | `difficulty_level` (1-5 mapping) |
| `active` | `is_active` |
| average price from `/prices` | `price_per_person` |

**Deduplication:** `UNIQUE INDEX idx_rooms_erd_id_org ON rooms(organization_id, erd_id) WHERE erd_id IS NOT NULL`

### Bookings

**Source:** ERD `/api/bookings/get-all?page=N` (paginated JSON)

**Target table:** `bookings` + `booking_guests`

**Mapping:**
| ERD Field | Escapemaster Field |
|-----------|-------------------|
| `id` | `erd_id` |
| `game_id` | `room_id` (via `erd_id` lookup) |
| `date` + `time` | `start_time` |
| `players` | `num_people` |
| `price` | `total_price`, `remaining_balance` |
| `price / players` | `price_per_person` |
| `status` ("confirmed"/"cancelled"/"pending") | `booking_status` |
| `name`, `email`, `phone` | `booking_guests` (created on demand) |

**Guest resolution:** If a guest with the same email exists in the org, reuse their ID. Otherwise create a new `booking_guest`.

### Coupons

**Source:** ERD `/coupons/get-all?page=N` (requires `scheduleToken`)

**Target table:** `coupons`

**Mapping:**
| ERD Field | Escapemaster Field |
|-----------|-------------------|
| `id` | `erd_id` |
| `code` | `code` |
| `type` ("percentage"/"fixed") | `discount_type` |
| `value` | `discount_value` |
| `max_uses` | `max_uses` |
| `uses` | `current_uses` |
| `valid_until` | `valid_until` |
| `active` | `is_active` |

### Employees

**Source:** ERD `/schedule_employees` (HTML with embedded JSON in `v-bind:current-user`)

**Target:** `users` + `user_organizations`

**Logic:**
1. Extract users from Vue component's `current-user` JSON (`companies[0].users`)
2. For each employee with email:
   - If user exists globally → add to `user_organizations`
   - If new → create `users` entry with `bcrypt("ERD_MIGRATED_NEEDS_RESET")` as placeholder password
3. Assign `staff` role (or first non-admin role found)

**Note:** Employees without email are skipped.

### GDPR Signatures

**Source:** ERD `/firms/get-all?page=N`

**Target:** `gdpr_signatures` + `booking_guests`

**Logic:**
1. For each firm with email:
   - Find or create a `booking_guest`
   - Insert `gdpr_signature` with JSON blob containing `name`, `nif`, `rgpd1`, `rgpd2`, `consent_given`

## CSRF Token Strategy

ERD (Laravel) rotates CSRF tokens on every GET request. The migration client must handle this:

```
┌─────────────────────────────────────────────────────────────────┐
│  HOW LARAVEL CSRF WORKS IN ERD                                  │
│                                                                  │
│  1. GET /login → Set-Cookie: XSRF-TOKEN=encrypted_value         │
│  2. Extract _token from HTML form hidden input                   │
│  3. POST /login with _token in body + XSRF-TOKEN in cookie       │
│  4. GET /dashboard → NEW Set-Cookie: XSRF-TOKEN=new_value       │
│  5. Extract <meta name="csrf-token"> (PLAIN token, not encrypted)│
│  6. ALL subsequent POSTs must use the PLAIN meta token            │
│     as X-Csrf-Token AND X-Xsrf-Token headers                     │
└─────────────────────────────────────────────────────────────────┘
```

**Critical:** The `XSRF-TOKEN` cookie value is **encrypted** by Laravel. The only reliable CSRF token is the **plain text** value from `<meta name="csrf-token">`.

**Session refresh:** Before any batch of POST requests, the API calls `refresh_erd_session()` which does a GET to `/` to rotate tokens and capture the fresh plain CSRF.

## Database Schema Additions

Migration support tables (added in `012_erd_migration_support.sql`):

```sql
-- Session storage
CREATE TABLE erd_migration_sessions (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    erd_cookies TEXT NOT NULL,
    erd_csrf_token TEXT NOT NULL,     -- Plain meta csrf-token
    schedule_token TEXT,               -- ERD's scheduleToken for coupons
    expires_at TIMESTAMPTZ DEFAULT (NOW() + '30 min'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deduplication columns
ALTER TABLE rooms    ADD COLUMN erd_id INTEGER;
ALTER TABLE bookings ADD COLUMN erd_id INTEGER;
ALTER TABLE coupons  ADD COLUMN erd_id INTEGER;

-- Unique constraints
CREATE UNIQUE INDEX idx_rooms_erd_id_org    ON rooms(organization_id, erd_id) WHERE erd_id IS NOT NULL;
CREATE UNIQUE INDEX idx_bookings_erd_id_org ON bookings(organization_id, erd_id) WHERE erd_id IS NOT NULL;
CREATE UNIQUE INDEX idx_coupons_erd_id_org  ON coupons(organization_id, erd_id) WHERE erd_id IS NOT NULL;
```

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/erd/auth` | POST | JWT | Authenticate into ERD, returns `erd_session_id` |
| `/erd/preview` | POST | JWT | Get record counts per module |
| `/erd/execute` | POST | JWT | Run migration for selected modules |

## Running Migrations

### Via curl

```bash
# 1. Get JWT token (assuming you have auth endpoint)
TOKEN="your_jwt_token"

# 2. Authenticate
curl -X POST http://localhost:8000/erd/auth \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.es","password":"secret"}'

# 3. Preview
SESSION_ID="550e8400-e29b-41d4-a716-446655440000"
curl -X POST http://localhost:8000/erd/preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"erd_session_id\":\"$SESSION_ID\"}"

# 4. Execute
curl -X POST http://localhost:8000/erd/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"erd_session_id\":\"$SESSION_ID\",\"modules\":[\"rooms\",\"bookings\",\"coupons\",\"employees\",\"gdpr\"]}"
```

### Re-running a Migration

Because of the deduplication indexes (`erd_id` + `organization_id`), re-running a migration is **safe**:

- **Rooms/Coupons:** Skipped if `erd_id` already exists
- **Bookings:** Skipped if `erd_id` already exists
- **Employees:** Existing users are linked to org; new users are created

The `skipped` count in the response indicates records that were already migrated.

## Error Handling

Each module returns a result with:
- `migrated`: Successfully inserted records
- `skipped`: Records already existing (dedup) or filtered out
- `errors`: Array of error messages (non-fatal, migration continues)

```json
{
  "success": true,
  "results": [
    {
      "module": "rooms",
      "status": "completed",
      "migrated": 5,
      "skipped": 0,
      "errors": []
    }
  ]
}
```

**Common error causes:**
- `CSRF token mismatch` → Session expired, re-authenticate
- `Unauthenticated` → ERD session cookies invalid/expired
- `room not found for game_id` → Rooms module didn't run before bookings
- Empty counts in preview → CSRF/auth issue with that specific endpoint

## Files Reference

| File | Purpose |
|------|---------|
| `api/src/routes/erd_migration.rs` | All migration route handlers and HTTP client logic |
| `api/src/schemas/erd_migration.rs` | Request/response types and ERD data structures |
| `api/migrations/012_erd_migration_support.sql` | Database schema additions for migration |
| `migracionERD/README.md` | Legacy Node.js proxy documentation (pre-migration integration) |
| `migracionERD/*.md` | Individual endpoint documentation for the legacy proxy |
