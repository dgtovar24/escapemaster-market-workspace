# EscapeMaster Marketplace — Instrucciones para Copilot

## Proyecto

Plataforma marketplace de escape rooms en España. 3 repos independientes.

## Estructura

- `web/frontend/` — Marketplace B2C (jugadores). Repo: escapemaster-market
- `web/api/` — Backend API. Repo: escapemaster-rooms-api
- `master/` — Panel Admin B2B (empresas). Repo: master-escapemaster

## Stack Principal

- **Framework:** Astro 5 SSR (`output: 'server'`) + React 19 (islands)
- **Estilos:** Tailwind CSS v4 con `@tailwindcss/vite` y paleta tropical custom via `@theme`
- **BD:** PostgreSQL directo con `pg` (NO ORM). Dos BDs: `postgres` (principal) y `baul` (almacén)
- **Auth:** JWT propio (jose + bcryptjs) con verificación email
- **Pagos:** Stripe Checkout Sessions con tarifa de servicio
- **Mapas:** Leaflet
- **Estado:** Nanostores (`$user`, `$token`)
- **i18n:** Astro nativo, `es`/`en`. Web prefija rutas, master no
- **Deploy:** Dokploy (Node standalone)

## Reglas Críticas

### 1. Paleta Tropical — SIEMPRE usar clases `tropical-*`

```
tropical-primary:   #0097b2  (cyan — headers, CTAs)
tropical-secondary: #4db8a8  (turquesa — acentos, bordes)
tropical-bg:        #f4e9cd  (crema — fondo general)
tropical-accent:    #f39c12  (naranja — urgencia, badges)
tropical-text:      #0d3d34  (verde oscuro — texto)
tropical-card:      #e8f5f3  (menta — cards, fondos)
```

**NUNCA** usar `gray-900`, `blue-500`, `#0097b2` hardcoded. Siempre `tropical-*`.

### 2. Componentes UI — CVA Pattern

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
```

### 3. React Islands — Directivas correctas

- `client:load` → Above the fold (Header, MapSearch)
- `client:visible` → Below the fold (BookingWidget, UserDashboard)

### 4. Queries SQL — Directo con pg

```ts
import { query } from '../lib/db';
const { rows } = await query('SELECT * FROM rooms WHERE is_active = $1', [true]);
```

### 5. API Responses

```ts
return new Response(JSON.stringify({ success: true, data: result }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' }
});
```

### 6. Auth — JWT Bearer

```ts
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
```

### 7. Mobile-First

- Touch targets ≥ 44px (`h-11`, `min-h-[44px]`)
- `touch-manipulation` en botones
- Safe area: `safe-top`, `safe-bottom`
- Responsive: mobile → tablet → desktop

## Archivos de Referencia

- `CLAUDE.md` — Contexto completo del proyecto
- `SKILLS_GUIDE.md` — Mapa de skills y modelo de negocio
- `web/CLAUDE.md` — Contexto específico del marketplace
- `master/CLAUDE.md` — Contexto específico del panel admin
