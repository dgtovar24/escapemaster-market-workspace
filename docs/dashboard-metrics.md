# Dashboard and Business Metrics

The Master Admin dashboard provides real-time observability over the financial 
and operational health of the EscapeMaster network.

## Core Widgets

### 1. Revenue Projection
The projection widget calculates the trend for the current month based on the 
growth of the last 4 months of bookings. 
- **Data Source:** `bookings` table.
- **Calculation:** Aggregation of `total_price` by month.

### 2. Operational Highlights
The dashboard highlights upcoming bookings that require immediate attention or 
are starting within the next few hours.

### 3. Activity Heatmap
A visual representation of booking concentration.
- **Axis X:** Days of the week (L to D).
- **Axis Y:** Time of day (aggregated by availability slots).
- **Purpose:** Identifies peak operational hours across the entire platform.

## Key Performance Indicators (KPIs)

- **Pending Payouts:** The sum of all `payouts` with status `pending`. This 
  represents the debt of the platform towards organizations.
- **Organization Onboarding Rate:** Growth of new organizations in the 
  `organizations` table over the last 30 days.
