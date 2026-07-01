# EscapeMaster — Components Kit

Documentacion completa del design system para las apps **web** (B2C marketplace) y **master** (B2B admin panel).

> **REGLA CRITICA:** NUNCA hardcodear hex colors. Siempre usar clases `tropical-*`.

## Indice

### Design Tokens

| Archivo | Contenido |
|---------|-----------|
| [tokens/colors.md](tokens/colors.md) | Paleta tropical completa, tokens semanticos, colores de estado |
| [tokens/typography.md](tokens/typography.md) | Fuentes (system-ui vs Inter/Outfit), escala de tamanos, pesos, tracking |
| [tokens/spacing.md](tokens/spacing.md) | Border radius, shadows, spacing scale, z-index, grids |
| [tokens/animations.md](tokens/animations.md) | Keyframes (fade-in, slide-up, slide-in-right, skeleton), transiciones, estados activos |

### Componentes UI

| Archivo | Componente | App |
|---------|------------|-----|
| [components/button.md](components/button.md) | Button (CVA) — 7 variantes web, 7 master | Ambas |
| [components/input.md](components/input.md) | Input con label, error, icon | Web |
| [components/card.md](components/card.md) | Card compuesto (6 subcomponentes) | Ambas |
| [components/badge.md](components/badge.md) | Badge — 5 variantes web, 7 master | Ambas |
| [components/table.md](components/table.md) | Table semantico (8 subcomponentes) | Ambas |
| [components/game-card.md](components/game-card.md) | GameCard — tarjeta de sala estilo Airbnb | Web |
| [components/header.md](components/header.md) | Header — desktop nav, mobile menu, bottom nav | Web |
| [components/hero-search-bar.md](components/hero-search-bar.md) | HeroSearchBar — barra de busqueda principal | Web |
| [components/calendar.md](components/calendar.md) | CalendarReservations — 16 paletas | Compartido |
| [components/modal.md](components/modal.md) | Patrones: bottom-sheet, overlay, fullscreen | Ambas |
| [components/forms.md](components/forms.md) | Patrones de formulario, validacion, layout | Ambas |

### Patrones

| Archivo | Contenido |
|---------|-----------|
| [patterns/responsive.md](patterns/responsive.md) | Breakpoints, mobile-first, grids responsivos, safe areas |
| [patterns/interactions.md](patterns/interactions.md) | Hover, focus, active, touch targets, transiciones |
| [patterns/layout.md](patterns/layout.md) | Layout web (header+footer), layout master (sidebar), containers |
| [patterns/utilities.md](patterns/utilities.md) | Mobile utils, scroll, touch, skeleton, glass, cn() |

### Referencia

| Archivo | Contenido |
|---------|-----------|
| [divergences.md](divergences.md) | Todas las diferencias entre web y master |

## Stack Tecnologico

- **Tailwind CSS v4** con `@theme` (no config file)
- **CVA** (class-variance-authority) para variantes
- **clsx + tailwind-merge** via `cn()` utility
- **Radix UI** para primitivas (dialog, dropdown, avatar, separator, slot)
- **Lucide React** para iconografia
- **React 19** islands en **Astro 5** SSR

## Archivos Fuente Principales

```
web/src/styles/global.css          — Theme tokens, utilidades, animaciones
web/src/components/ui/             — Button, Input, Card, Badge, Table
web/src/components/GameCard.tsx    — Tarjeta de sala
web/src/components/Header.tsx      — Navegacion completa
web/src/lib/utils.ts               — cn() utility

master/src/styles/global.css       — Theme tokens (divergente)
master/src/components/ui/          — Button, Card, Badge, Table
master/src/layouts/AdminLayout.astro — Sidebar + dashboard layout
master/src/lib/utils.ts            — cn() utility
```

## Reglas de Uso

1. **Siempre** usar clases `tropical-*` para colores
2. **Nunca** hardcodear valores hex en componentes
3. **Siempre** usar `cn()` para combinar clases Tailwind
4. **Siempre** incluir estados hover, focus y active
5. **Siempre** respetar touch targets minimos (44px)
6. **Siempre** prevenir zoom iOS en inputs (`fontSize: 16px`)
7. **Siempre** usar `touch-manipulation` en elementos interactivos
8. **Verificar** si el componente es para web o master — los estilos difieren
