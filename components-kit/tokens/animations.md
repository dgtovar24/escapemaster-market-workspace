# Animaciones y Transiciones — EscapeMaster Design System

## Keyframes

### fade-in
Entrada suave con movimiento vertical sutil.
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
```
**Uso:** Contenido que aparece en pagina, cards que se cargan.

> Nota: Master usa `0.5s` en lugar de `0.3s`.

### slide-up
Entrada desde abajo (full height).
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
```
**Uso:** Bottom sheets, popups de mapa, modals mobile.

### slide-in-right
Entrada desde la derecha.
```css
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
```
**Uso:** Paneles laterales, notificaciones.

### skeleton-loading
Shimmer effect para placeholders de carga.
```css
@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skeleton {
  background: linear-gradient(to right, #e5e7eb, #f3f4f6, #e5e7eb);
  background-size: 200% 100%;
  border-radius: 0.5rem;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```
**Uso:** Placeholders mientras se cargan datos.

## Transiciones CSS

| Clase | Duracion | Uso |
|-------|----------|-----|
| `transition-colors` | 150ms | Hover de texto, backgrounds simples |
| `transition-all duration-200` | 200ms | Buttons, links rapidos |
| `transition-all duration-300` | 300ms | Cards, shadows, transformaciones |
| `transition-shadow duration-300` | 300ms | Card hover shadow |
| `transition-transform duration-300` | 300ms | Hover scale en imagenes |
| `transition-opacity duration-200` | 200ms | Fade in/out |

## Estados Interactivos con Transform

### Active (Press)
```jsx
// Web buttons
className="active:scale-[0.97]"

// Master buttons
className="active:scale-95"

// FAB
className="active:scale-95"

// Card touch
className="active:scale-[0.99]"  // .card-touch

// Button mobile
className="active:scale-[0.98]"  // .btn-mobile
```

### Hover Scale
```jsx
// Imagenes en GameCard
className="group-hover:scale-[1.03] transition-transform duration-300"

// Iconos favorito
className="hover:scale-110"

// Logo header
className="group-hover:scale-105"

// Iconos sidebar (master)
className="group-hover:scale-110"
```

## Patron de Hover Completo

```jsx
// Boton con todas las transiciones
<button className="
  bg-tropical-primary text-white
  hover:bg-tropical-primary/90
  hover:shadow-xl
  active:scale-[0.97]
  transition-all duration-200
  touch-manipulation
">
  Reservar
</button>

// Card con hover
<div className="
  bg-white rounded-xl shadow-sm
  border border-tropical-secondary/10
  hover:shadow-md
  transition-shadow duration-300
">
  Card content
</div>

// Link con icon animation
<a className="
  group flex items-center gap-2
  text-foreground/40
  hover:text-tropical-primary
  transition-colors
">
  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
  Volver
</a>
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

## Archivos Fuente

- Web: `web/src/styles/global.css` (lineas 216-247)
- Master: `master/src/styles/global.css` (lineas 67-93)
