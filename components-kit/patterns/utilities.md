# Utilidades Custom — Mobile & Touch

> Definidas en `web/src/styles/global.css` (@layer utilities)

## Safe Areas (iOS Notch / Home Indicator)

```css
.safe-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.pt-safe {
  padding-top: env(safe-area-inset-top, 0px);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

**Uso:** Headers fijos, bottom navs, bottom sheets.

## Scroll

### Momentum Scroll (iOS)
```css
.momentum-scroll {
  -webkit-overflow-scrolling: touch;
}
```
**Uso:** Paneles scrolleables en mobile (menus, modals).

### Sin Scrollbar
```css
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
```
**Uso:** Listas horizontales, tabs, carousels.

### Scroll Horizontal con Snap
```css
.scroll-x-smooth {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  /* scrollbar hidden */
}

.snap-card {
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

**Uso:**
```jsx
<div className="scroll-x-smooth -mx-4 px-4">
  <div className="flex gap-4">
    <div className="snap-card w-[280px]">Card 1</div>
    <div className="snap-card w-[280px]">Card 2</div>
  </div>
</div>
```

## Touch Components

### Input Mobile
```css
.input-mobile {
  width: 100%;
  padding: 0.75rem 1rem;
  min-height: 48px;
  font-size: 16px;         /* Previene zoom iOS */
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  outline: none;
  transition: all 0.15s;
}
.input-mobile:focus {
  box-shadow: 0 0 0 2px rgba(77, 184, 168, 0.2);
  border-color: transparent;
}
```

### Button Mobile
```css
.btn-mobile {
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.75rem;
  transition: transform 0.15s;
}
.btn-mobile:active {
  transform: scale(0.98);
}
```

### Touch Target
```css
@media (max-width: 640px) {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .btn-full-mobile {
    width: 100%;
  }

  .mobile-scroll-container {
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
```

## Card Touch
```css
.card-touch {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 1px solid #f3f4f6;
  transition: transform 0.15s;
}
.card-touch:active {
  transform: scale(0.99);
}
```

## FAB (Floating Action Button)
```css
.fab {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  width: 3.5rem;      /* 56px */
  height: 3.5rem;
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-tropical-primary);
  color: white;
  transition: transform 0.15s;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.fab:active {
  transform: scale(0.95);
}
```

## Bottom Sheet
```css
.bottom-sheet {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 50;
  background-color: white;
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  max-height: 90vh;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-sheet-handle {
  width: 3rem;
  height: 0.25rem;
  background-color: #d1d5db;
  border-radius: 9999px;
  margin: 0.75rem auto;
}
```

## Loading: Skeleton
```css
.skeleton {
  background: linear-gradient(to right, #e5e7eb, #f3f4f6, #e5e7eb);
  background-size: 200% 100%;
  border-radius: 0.5rem;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

**Uso:**
```jsx
// Placeholder de texto
<div className="skeleton h-4 w-3/4 mb-2" />
<div className="skeleton h-4 w-1/2" />

// Placeholder de imagen
<div className="skeleton aspect-[4/3] w-full rounded-xl" />

// Placeholder de avatar
<div className="skeleton w-10 h-10 rounded-full" />
```

## Modal Lock
```css
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```

## Master: Glass Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Utilidad cn()

Definida identica en ambas apps en `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Proposito:** Combinar clases Tailwind sin conflictos. `clsx` maneja condicionales, `twMerge` resuelve conflictos (ej: `p-4 p-6` → `p-6`).

```jsx
className={cn(
  "base-classes",
  variant === "primary" && "bg-tropical-primary",
  disabled && "opacity-50",
  className  // permite override desde props
)}
```
