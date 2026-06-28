# CMS - Editor Visual de Páginas

## Overview

El sistema CMS permite editar completamente la UI del marketplace desde el panel master. Incluye:

- **Editor Visual**: Block editor con drag & drop para arrastrar componentes
- **Live Preview**: Vista previa en tiempo real con múltiples viewports
- **Control de Visibilidad**: Toggle de páginas visible/oculta por locale (ES/EN)
- **SEO Completo**: Meta tags, Open Graph, Twitter Cards, Schema.org
- **A/B Testing**: Variantes de página con tracking de conversiones
- **Historial**: Undo/redo de cambios

---

## Architecture

### Database Schema

```
┌──────────────────┐     ┌───────────────────┐
│  site_pages      │────<│   page_sections   │
│  (páginas)       │     │   (bloques)        │
└────────┬─────────┘     └─────────┬─────────┘
         │                         │
         │                         │
         ▼                         ▼
┌──────────────────┐     ┌───────────────────┐
│  page_visibility │     │ design_components │
│  (visibilidad)   │     │ (catálogo)        │
└──────────────────┘     └───────────────────┘
         │
         ▼
┌──────────────────┐     ┌───────────────────┐
│    page_seo     │     │  page_variants   │
│   (SEO)          │     │  (A/B Testing)    │
└──────────────────┘     └───────────────────┘
```

### Tables

| Table | Purpose |
|-------|---------|
| `site_pages` | Definición de cada página pública |
| `page_sections` | Bloques/componentes de cada página |
| `design_components` | Catálogo de componentes arrastrables |
| `page_visibility` | Control de visibilidad ES/EN |
| `page_seo` | SEO completo por locale |
| `page_variants` | Variantes para A/B testing |
| `ab_conversions` | Tracking de conversiones |
| `page_history` | Historial de cambios |
| `page_templates` | Plantillas reutilizables |

---

## API Endpoints

### Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/pages` | List all pages |
| POST | `/api/cms/pages` | Create new page |
| GET | `/api/cms/pages/:slug` | Get page with sections |
| PUT | `/api/cms/pages/:slug` | Update page metadata |
| DELETE | `/api/cms/pages/:slug` | Delete page |

### Sections

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/pages/:slug/sections` | Get page sections |
| PUT | `/api/cms/pages/:slug/sections` | Save sections (bulk) |
| POST | `/api/cms/pages/:slug/sections` | Add single section |

### Visibility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/pages/:slug/visibility` | Get visibility settings |
| PUT | `/api/cms/pages/:slug/visibility` | Toggle visibility |

### SEO

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/pages/:slug/seo` | Get SEO settings |
| PUT | `/api/cms/pages/:slug/seo` | Update SEO |

### Design Components

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/design/components` | List all components |
| POST | `/api/cms/design/components` | Create component |
| GET | `/api/cms/design/components/:id` | Get component detail |
| PUT | `/api/cms/design/components/:id` | Update component |
| DELETE | `/api/cms/design/components/:id` | Delete component |

---

## Pages

### `/pages` - Gestión de Visibilidad

Tabla con todas las páginas del sistema. Toggle rápido ES/EN.

### `/pages/:slug/edit` - Editor Visual

Editor de bloques con:
- **Sidebar izquierdo**: Paleta de componentes
- **Canvas central**: Vista previa con componentes arrastrables
- **Sidebar derecho**: Panel de propiedades
- **Toolbar**: Undo/redo, viewport, preview, guardar

### `/design` - Catálogo de Componentes

Muestra todos los componentes disponibles organizados por categoría:
- Layout
- Content
- Interactive
- Primitives

---

## Design Components

### Component Schema

```typescript
interface DesignComponent {
  id: string;
  name: string;           // "HeroSearchBar"
  slug: string;           // "hero-search-bar"
  category: string;        // "layout" | "content" | "interactive" | "primitive"
  component_type: string; // "astro" | "react"
  component_path: string; // "@/components/HeroSearchBar"
  icon: string;           // Lucide icon name
  description: string;
  default_props: object;   // Props por defecto
  editable_props: PropDefinition[]; // Props editables en el panel
  variants: object;       // Variantes CVA { variant: [...], size: [...] }
  is_active: boolean;
}
```

### Shared Package Architecture

Los componentes se comparten entre master y frontend via `@escapemaster/ui-components`:

```
escapemaster-workspace/
├── packages/
│   └── escapemaster-ui-components/  # Componentes compartidos
├── web/frontend/                     # Marketplace (usa componentes del paquete)
└── master/                          # Admin (usa componentes del paquete)
```

**Beneficios:**
- Mismos componentes en editor visual y producción
- Actualizaciones centralizadas
- Consistencia visual garantizada

### Available Components

#### Layout
- `Header` - Navegación principal
- `HeroSearchBar` - Barra de búsqueda hero
- `Footer` - Pie de página
- `Container` - Contenedor centrado
- `SectionContainer` - Sección con fondo/padding

#### Content
- `GameCard` - Tarjeta de sala
- `RouteCard` - Tarjeta de ruta
- `NearYouSection` - Sección geolocalizada
- `AdvancedFilters` - Panel de filtros
- `SocialFeed` - Feed social
- `SectionTitle` - Título de sección
- `GameGrid` - Cuadrícula de juegos
- `HeroBanner` - Banner hero

#### Interactive
- `BookingWidget` - Widget de reservas
- `MapSearch` - Mapa con marcadores
- `SingleGameMap` - Mapa de una sala
- `UserDashboard` - Panel de usuario
- `AuthStatus` - Estado de auth
- `ChatWidget` - Chat
- `RouteBulkBooking` - Reserva masiva

#### Primitives
- `Button` (8 variantes)
- `Badge` (7 variantes)
- `Card`
- `Input`

---

## SEO Fields

Cada página tiene SEO configurable por locale:

| Field | Description |
|-------|-------------|
| `meta_title` | Título para SERPs |
| `meta_description` | Descripción para SERPs |
| `meta_keywords` | Keywords |
| `meta_robots` | Index/follow |
| `og_title` | Open Graph title |
| `og_description` | Open Graph description |
| `og_image_url` | Open Graph image |
| `og_type` | website/article/product |
| `twitter_card` | Twitter card type |
| `canonical_url` | URL canónica |
| `schema_type` | Schema.org type |
| `schema_data` | JSON-LD estructurado |

---

## Visibility System

El sistema permite ocultar páginas por locale:

- `/pages` muestra toggle para ES y EN
- Cambio instantáneo en la base de datos
- La web lee `page_visibility` para decidir qué mostrar

---

## A/B Testing

### Creating Variants

1. Ir a `/pages/:slug/edit`
2. Click en "Variants" en el toolbar
3. Crear nueva variante
4. Configurar secciones diferentes
5. Ajustar traffic_percentage

### Tracking

- Cada variante tiene `impressions` y `conversions`
- Se registra en `ab_conversions`
- Conversion rate se calcula automáticamente

---

## Migration

### Run Migration

```bash
cd master
psql $DATABASE_URL -f scripts/cms-schema.sql
```

### Verify Tables

```bash
psql $DATABASE_URL -c "\dt site_pages"
psql $DATABASE_URL -c "\dt design_components"
psql $DATABASE_URL -c "\dt page_sections"
```

---

## Authentication

Todos los endpoints requieren cookie `master_session`.

```typescript
// Auth check en cada request
const session = request.headers.get("cookie");
if (!session?.includes("master_session=")) {
  return { authorized: false };
}
```

---

## Response Format

```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: " mensaje de error" }

// Status codes
200 // Success
201 // Created
400 // Bad request
401 // Unauthorized
404 // Not found
500 // Server error
```
