# Responsive Design — Patrones

## Breakpoints (Tailwind CSS v4)

| Prefijo | Ancho minimo | Dispositivo tipico |
|---------|-------------|-------------------|
| (ninguno) | 0px | Mobile (default) |
| `sm:` | 640px | Tablets |
| `md:` | 768px | Tablets landscape |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Desktop grande |

## Filosofia: Mobile-First

Todos los estilos base son para mobile. Se agregan modificadores para pantallas mas grandes:

```jsx
// MAL — desktop-first
className="flex hidden sm:flex"   // Redundante

// BIEN — mobile-first
className="hidden sm:flex"        // Oculto en mobile, visible en sm+
className="block sm:hidden"       // Visible en mobile, oculto en sm+
```

## Patrones Comunes

### Visibilidad
```jsx
// Solo mobile
className="sm:hidden"

// Solo desktop
className="hidden lg:flex"

// Hidden hasta tablet
className="hidden sm:block"
```

### Grids Responsivos
```jsx
// 1 col mobile → 2 tablet → 3 desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

// 1 col mobile → 2 tablet → 4 desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// 2 col mobile → 4 desktop (stats)
className="grid grid-cols-2 sm:grid-cols-4 gap-4"

// Flex wrap
className="flex flex-col md:flex-row gap-4"
```

### Padding Responsivo
```jsx
// Container
className="px-4 sm:px-6"

// Content area (master)
className="px-6 py-8 lg:px-12 lg:py-12"

// Sections
className="p-4 sm:p-6"
```

### Texto Responsivo
```jsx
// Tamano
className="text-[15px] sm:text-sm"
className="text-2xl sm:text-3xl lg:text-5xl"

// Input label
className="text-[10px] sm:text-xs"
```

### Alturas Responsivas
```jsx
// Buttons (web)
className="h-11 sm:h-10"     // 44px mobile, 40px desktop

// Icon buttons (web)
className="h-11 w-11 sm:h-10 sm:w-10"

// Inputs (web)
className="h-11 sm:h-12"     // 44px mobile, 48px desktop
```

### Ancho Responsivo
```jsx
// Botones full width en mobile
className="w-full sm:w-auto"

// Sidebar (master)
className="w-64"  // Fijo 256px, hidden en mobile (hidden lg:flex)
```

### Border Radius Responsivo
```jsx
// Input (web)
className="rounded-xl sm:rounded-2xl"
```

## Patron: Mobile Bottom Nav + Desktop Header

```jsx
// Desktop header (web)
<header className="hidden sm:block fixed top-0 ...">

// Mobile bottom nav (web)
<nav className="sm:hidden fixed bottom-0 ...">

// Mobile: content necesita padding-bottom para la bottom nav
<main className="pb-20 sm:pb-0">
```

## Patron: Sidebar Desktop + Fullscreen Mobile (Master)

```jsx
// Sidebar
<aside className="hidden lg:flex w-64 fixed inset-y-0">

// Main content
<main className="lg:ml-64">  // Margen izquierdo solo en desktop

// Mobile: sidebar como overlay fullscreen (togglable)
```

## Patron: Scroll Horizontal Mobile

```jsx
<div className="scroll-x-smooth -mx-4 px-4">  // Edge-to-edge
  <div className="flex gap-4">
    <div className="snap-card w-[280px]">Card 1</div>
    <div className="snap-card w-[280px]">Card 2</div>
    <div className="snap-card w-[280px]">Card 3</div>
  </div>
</div>
```

## Safe Areas (iOS Notch)

```jsx
// Header
<header className="safe-top">  // padding-top con notch

// Bottom nav
<nav className="safe-bottom">  // padding-bottom con home indicator

// Bottom sheet
<div className="bottom-sheet">  // padding-bottom automatico
```
