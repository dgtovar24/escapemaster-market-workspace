# Spacing, Radius y Shadows — EscapeMaster Design System

## Border Radius

| Clase | Tamano | Uso |
|-------|--------|-----|
| `rounded-md` | 6px | Master buttons (default) |
| `rounded-lg` | 8px | Web buttons sm, badges |
| `rounded-xl` | 12px | Web buttons, cards, inputs |
| `rounded-2xl` | 16px | Web inputs (sm+), master forms, modals |
| `rounded-3xl` | 24px | Master modals (RoomAvailabilityModal) |
| `rounded-full` | 9999px | Pills, avatares, FAB, language toggle |

### Configuracion Master
```css
--radius-lg: 1rem;           /* 16px */
--radius-md: calc(1rem - 2px); /* 14px */
--radius-sm: calc(1rem - 4px); /* 12px */
```

### Configuracion Web
```css
--radius-xl: 1rem; /* 16px */
```

## Shadows

| Clase | Uso |
|-------|-----|
| `shadow-sm` | Cards en reposo, elementos sutiles |
| `shadow` | Cards con presencia, master buttons |
| `shadow-md` | Buttons secundarios, hover de cards |
| `shadow-lg` | Buttons primarios, FAB, header on scroll |
| `shadow-xl` | Hover intenso, modals |
| `shadow-2xl` | Modal containers (RoomAvailabilityModal) |

### Shadows con Color
```jsx
// Shadow teñido del primary
className="shadow-lg shadow-tropical-primary/20"

// Shadow naranja (CTA hover)
className="hover:shadow-orange-500/20"
```

## Spacing Scale

### Gaps
| Clase | Pixeles | Uso |
|-------|---------|-----|
| `gap-1` | 4px | Micro spacing |
| `gap-1.5` | 6px | Input label-to-input |
| `gap-2` | 8px | Icon + text en buttons, badges inline |
| `gap-3` | 12px | Nav items, sidebar items |
| `gap-4` | 16px | Sections internas, grid items |
| `gap-6` | 24px | Cards grid, form groups |
| `gap-8` | 32px | Secciones principales |
| `gap-12` | 48px | Footer columns, large sections |

### Padding
| Patron | Uso |
|--------|-----|
| `p-2` | Table cells |
| `p-4` | Cards internas, mobile padding |
| `p-6` | CardHeader, CardContent, CardFooter |
| `p-8` | Sidebar logo area (master) |
| `px-3 py-2` | Buttons sm, badges |
| `px-4 py-2` | Buttons default (master) |
| `px-4 py-3` | Inputs, forms (master) |
| `px-5 py-2` | Buttons default (web) |
| `px-8` | Buttons lg |
| `px-4 sm:px-6` | Container padding responsive |
| `px-6 py-8 lg:px-12 lg:py-12` | Content area (master) |

## Container

```jsx
// Web
<div className="max-w-7xl mx-auto px-4 sm:px-6">
  {/* max-width: 1280px */}
</div>

// Master
<div className="px-6 py-8 lg:px-12 lg:py-12">
  {/* Full-width dentro del area de contenido */}
</div>
```

## Grid Patterns

```jsx
// Game cards (web)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

// Stats cards (master)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

// Footer (web)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

// Forms 2 columns
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

## Z-Index Stack

| Valor | Uso |
|-------|-----|
| `z-0` | Contenido normal |
| `z-10` | Dropdowns, popovers |
| `z-40` | Header sticky (master) |
| `z-50` | Sidebar, modals, FAB, bottom-sheet |
