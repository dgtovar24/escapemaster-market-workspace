# Interacciones — Hover, Focus, Active

## Focus States (Accesibilidad por Teclado)

### Web
```jsx
className="focus-visible:outline-none focus-visible:ring-2
           focus-visible:ring-tropical-primary/20
           focus-visible:border-tropical-primary"
```

### Master
```jsx
className="focus-visible:outline-none focus-visible:ring-1
           focus-visible:ring-ring"
```

### Diferencia clave
- Web: `ring-2` con `ring-offset-2` y color `tropical-primary/20`
- Master: `ring-1` sin offset, color `ring` (token)

## Hover Effects

### Texto
```jsx
// Nav links
className="text-tropical-text/70 hover:text-tropical-primary transition-colors"

// Links sutiles
className="text-foreground/40 hover:text-tropical-primary transition-colors"
```

### Background
```jsx
// Sutil
className="hover:bg-tropical-primary/5"

// Medio
className="hover:bg-tropical-primary/10"

// Nav items (master sidebar)
className="hover:bg-tropical-light hover:text-tropical-primary"

// Table rows
className="hover:bg-muted/50"

// Search sections
className="hover:bg-gray-50"
```

### Shadow
```jsx
// Cards
className="shadow-sm hover:shadow-md transition-shadow duration-300"

// Buttons
className="shadow-lg hover:shadow-xl"
```

### Scale
```jsx
// Imagenes (sutil)
className="group-hover:scale-[1.03] transition-transform duration-300"

// Iconos
className="hover:scale-110 transition-transform"

// Logo
className="group-hover:scale-105 transition-transform"
```

### Opacity
```jsx
// Buttons primary
className="hover:bg-tropical-primary/90"   // Web
className="hover:opacity-90"                // Master
```

## Active/Pressed States

```jsx
// Web buttons
className="active:scale-[0.97]"

// Master buttons (tropical)
className="active:scale-95"

// FAB
className="active:scale-95"

// Card touch
className="active:scale-[0.99]"  // .card-touch

// Button mobile
className="active:scale-[0.98]"  // .btn-mobile

// Search button
className="active:scale-95"
```

## Touch Optimization

```jsx
// Todos los botones
className="touch-manipulation"   // Elimina delay de 300ms en mobile

// Seleccion
className="select-none"          // Previene seleccion de texto en buttons

// Highlight
// En global.css: -webkit-tap-highlight-color: transparent
```

## Touch Targets

```jsx
// Minimo recomendado: 44x44px
className="min-h-[44px] min-w-[44px]"   // .touch-target

// Buttons web
className="h-11"  // 44px en mobile

// Inputs web
className="h-11 sm:h-12"  // 44-48px

// .btn-mobile
min-height: 48px

// .input-mobile
min-height: 48px
```

## Transiciones Estandar

| Patron | Clase | Uso |
|--------|-------|-----|
| Rapida | `transition-colors` | Hover de texto/background simple |
| Media | `transition-all duration-200` | Buttons, links |
| Lenta | `transition-all duration-300` | Cards, shadows, transforms |
| Shadow | `transition-shadow duration-300` | Card hover |
| Transform | `transition-transform duration-300` | Image zoom, icon scale |
| Opacity | `transition-opacity duration-200` | Fade in/out overlays |

## Patron: Group Hover

Permite que un hover en el padre afecte a los hijos:

```jsx
<a className="group">
  <img className="group-hover:scale-[1.03]" />
  <div className="opacity-0 group-hover:opacity-100">Overlay</div>
  <ChevronRight className="group-hover:translate-x-1" />
</a>
```

## Disabled States

```jsx
className="disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
```
