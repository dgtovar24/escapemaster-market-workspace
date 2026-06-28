# EscapeMaster — Database Schema (Updated Mar 2026)

## Connection

- **Host:** Neon (ep-morning-cell-ai0gpsjt-pooler.c-4.us-east-1.aws.neon.tech)
- **Database:** postgres (main) / baul (scraped data)
- **User:** postgres

---

## New Tables (Social Features)

### conversations
Chat conversations (direct messages and squad chats).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| type | VARCHAR(20) | 'direct' or 'squad' |
| squad_id | UUID (FK → squads) | Nullable, set for squad chats |
| title | VARCHAR(255) | Display title for squad chats |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Auto-updated on new message via trigger |

### conversation_participants
Links users to conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| conversation_id | UUID (FK → conversations) | CASCADE delete |
| user_id | UUID (FK → users) | CASCADE delete |
| joined_at | TIMESTAMPTZ | When user joined |
| last_read_at | TIMESTAMPTZ | Last read timestamp (for unread count) |
| is_active | BOOLEAN | Whether user is still in conversation |

**Unique constraint:** (conversation_id, user_id)

### messages
Individual chat messages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| conversation_id | UUID (FK → conversations) | CASCADE delete |
| sender_id | UUID (FK → users) | CASCADE delete |
| content | TEXT | Message text |
| type | VARCHAR(20) | 'text', 'image', or 'system' |
| created_at | TIMESTAMPTZ | Send timestamp |
| edited_at | TIMESTAMPTZ | Nullable, set on edit |
| is_deleted | BOOLEAN | Soft delete flag |

### report_exports
Metadata and history of system-generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| name | VARCHAR(255) | User-friendly report name |
| report_type | VARCHAR(50) | 'financial', 'bookings', etc. |
| format | VARCHAR(20) | 'pdf', 'csv', 'json' |
| size_label | VARCHAR(30) | Human-readable file size |
| author | VARCHAR(120) | User who triggered the report |
| created_at | TIMESTAMPTZ | Creation timestamp |

### payouts
Tracks financial splits and pending balances for organizations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| organization_id | UUID (FK) | Target company |
| amount | NUMERIC | Transaction amount |
| status | VARCHAR(20) | 'pending', 'completed', 'failed' |
| created_at | TIMESTAMPTZ | Transaction date |

---

## Modified Tables

### curated_collections
Added column for user-created routes.

| New Column | Type | Description |
|------------|------|-------------|
| created_by_user_id | UUID (FK → users) | Nullable, set for user-created routes |

---

## Indexes (New)

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| idx_messages_conversation_id | messages | (conversation_id, created_at DESC) | Fast message loading |
| idx_conversation_participants_user | conversation_participants | (user_id, is_active) | Fast conversation list |
| idx_messages_sender | messages | (sender_id) | Message sender lookup |
| idx_conversations_squad | conversations | (squad_id) WHERE squad_id IS NOT NULL | Squad chat lookup |

---

## Triggers (New)

### trigger_update_conversation_ts
After INSERT on `messages`, updates `conversations.updated_at` to NOW().

---

## Existing Core Tables (Reference)

| Table | Purpose |
|-------|---------|
| users | User accounts (email, password_hash, full_name, account_type, is_verified) |
| players | Player profiles (user_id, xp, level, rank, games_played, total_points) |
| rooms | Escape rooms (org_id, name, price, capacity, duration, difficulty, lat/lng) |
| organizations | Companies operating rooms |
| bookings | Reservations (room_id, guest_id, start_time, num_people, total_price) |
| reviews | Post-booking ratings (booking_id, rating 1-5, comment) |
| squads | Teams (name, slug, leader_id, is_public, invite_code) |
| squad_members | Team membership (squad_id, player_id, role, status) |
| curated_collections | Editorial/user routes (title, slug, is_active, is_featured) |
| collection_rooms | Rooms in a collection (collection_id, room_id, display_order) |
| user_routes | User route tracking (user_id, collection_id, mode, status) |
| user_route_rooms | Room progress in route (user_route_id, room_id, completed) |
| room_schedules | Weekly schedule (room_id, day_of_week, open_time, close_time) |
| payments | Payment records |
| marketplace_bookings | Marketplace-specific bookings |
| booking_commissions | Auto-calculated commissions (trigger) |
| fee_config | Fee levels |
| stripe_accounts | Stripe Connect accounts |
| achievements | Achievement definitions |
| player_achievements | Player-achievement links |
| xp_transactions | XP history |
| coupons | Discount codes |
| offers | Promotional offers |
| campaigns | Marketing campaigns |
| email_templates | Email templates |
| email_verifications | Verification codes |
| gdpr_signatures | GDPR consent records |

**Total tables:** 70+ (62 original + 3 chat + 6 analytics)

---

## New Tables (Analytics)

### analytics_events
Raw event log from client-side tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL/UUID (PK) | Auto-generated |
| event_name | VARCHAR | 'page_view', 'click', 'booking_step', 'search_filter', etc. |
| user_id | UUID (FK -> users) | Nullable, set if user is authenticated |
| session_id | VARCHAR | Client-generated session identifier |
| page_path | VARCHAR | Page path at time of event |
| page_lang | VARCHAR(5) | 'es' or 'en' |
| properties | JSONB | Arbitrary event properties |
| ip_address | VARCHAR | Client IP (from request) |
| user_agent | VARCHAR(500) | Browser user agent |
| created_at | TIMESTAMPTZ | Event timestamp |

### analytics_sessions
Session tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL/UUID (PK) | Auto-generated |
| session_id | VARCHAR (UNIQUE) | Client-generated session identifier |
| user_id | UUID (FK -> users) | Nullable |
| started_at | TIMESTAMPTZ | Session start |
| last_activity_at | TIMESTAMPTZ | Last event timestamp |
| is_active | BOOLEAN | Whether session is still active |

### analytics_page_views
Aggregated page view metrics per day.

| Column | Type | Description |
|--------|------|-------------|
| page_path | VARCHAR | Page path |
| page_lang | VARCHAR(5) | Language |
| date | DATE | Aggregation date |
| unique_visitors | INT | Distinct user count |
| total_visits | INT | Total page views |
| avg_duration_seconds | INT | Average time on page |

**Unique constraint:** (page_path, page_lang, date)

### analytics_heatmap_clicks
Click coordinate data for heatmap visualization.

| Column | Type | Description |
|--------|------|-------------|
| click_x | INT | X coordinate of click |
| click_y | INT | Y coordinate of click |
| page_path | VARCHAR | Page where click occurred |
| viewport_width | INT | Browser viewport width |
| viewport_height | INT | Browser viewport height |
| session_id | VARCHAR | Session identifier |
| created_at | TIMESTAMPTZ | Click timestamp |

### analytics_booking_funnels
Tracks booking funnel step progression.

| Column | Type | Description |
|--------|------|-------------|
| step | VARCHAR | Funnel step name |
| properties | JSONB | Step-specific data |
| session_id | VARCHAR | Session identifier |
| user_id | UUID | Nullable |
| created_at | TIMESTAMPTZ | Step timestamp |

### analytics_daily_metrics
Pre-aggregated daily platform metrics.

| Column | Type | Description |
|--------|------|-------------|
| metric_date | DATE (UNIQUE) | Date of metrics |
| new_users | INT | New registrations |
| unique_sessions | INT | Distinct sessions |
| mobile_visits | INT | Mobile device sessions |
| desktop_visits | INT | Desktop sessions |
| tablet_visits | INT | Tablet sessions |
| total_page_views | INT | Total page views |
| total_visits | INT | Total events |
| booking_completions | INT | Completed bookings |
| avg_session_duration | INT | Average session length (seconds) |
| created_at | TIMESTAMPTZ | Aggregation timestamp |
