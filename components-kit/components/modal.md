# Modal — Patrones

> No existe un componente Modal reutilizable unico. Se usan varios patrones segun la app.

## Patron 1: Bottom Sheet (Web Mobile)

Definido como utilidad CSS en `web/src/styles/global.css`.

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

### Uso
```jsx
<div className="bottom-sheet">
  <div className="bottom-sheet-handle" />
  <div className="p-6 overflow-y-auto momentum-scroll" style={{ maxHeight: 'calc(90vh - 2rem)' }}>
    {/* Contenido */}
  </div>
</div>
```

## Patron 2: Overlay Modal (Master)

Usado en `RoomAvailabilityModal.tsx` y otros.

```jsx
// Overlay
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

  // Modal container
  <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl
                  animate-in fade-in duration-200 zoom-in-95">

    // Header
    <div className="bg-[#0D3D34] px-6 py-4 rounded-t-3xl flex items-center justify-between">
      <h2 className="text-white font-bold text-lg">{title}</h2>
      <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>

    // Content
    <div className="p-6 bg-slate-50 max-h-[80vh] overflow-y-auto">
      {/* Contenido */}
    </div>
  </div>
</div>
```

### Claves del overlay modal:
- Fondo: `bg-black/50 backdrop-blur-sm`
- Animacion entrada: `animate-in fade-in zoom-in-95`
- Header oscuro: `bg-[#0D3D34]` (verde muy oscuro)
- Radius: `rounded-3xl` (24px)
- Max height: `80vh` con overflow scroll
- Close button: circle con hover

## Patron 3: Mobile Menu Full Screen (Web)

```jsx
// Activado con body.modal-open
<div className="fixed inset-0 z-40 bg-white">
  <div className="h-full overflow-y-auto momentum-scroll pb-24">
    {/* Header con X button */}
    {/* Contenido */}
  </div>
</div>
```

## Patron 4: Filter Modal (Web Mobile)

```jsx
<div className="fixed inset-0 z-50 bg-white sm:hidden">
  <div className="flex flex-col h-full">
    {/* Header con titulo + close */}
    <div className="flex-1 overflow-y-auto p-4">
      {/* Filtros */}
    </div>
    {/* Footer con boton aplicar */}
    <div className="p-4 border-t safe-bottom">
      <Button variant="cta" className="w-full">Aplicar Filtros</Button>
    </div>
  </div>
</div>
```

## Prevencion de Scroll

Cuando un modal esta abierto, se agrega la clase al body:

```css
body.modal-open {
  overflow: hidden;
  position: fixed;
  width: 100%;
}
```
