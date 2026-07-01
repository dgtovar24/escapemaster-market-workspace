# Tipografia — EscapeMaster Design System

## Familias de Fuentes

### Web (B2C)
Usa system fonts para maximo rendimiento (sin descargas):

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-serif: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

> Nota: `font-serif` y `font-sans` son identicos en web. Los headings usan `font-serif font-bold` pero renderizaran con system-ui.

### Master (B2B)
Usa Google Fonts dedicadas:

```css
--font-body: "Inter", system-ui, sans-serif;    /* Cuerpo de texto */
--font-heading: "Outfit", system-ui, sans-serif; /* Titulos */
```

| Uso | Web | Master |
|-----|-----|--------|
| Body text | `font-sans` (system-ui) | `font-body` (Inter) |
| Headings | `font-serif font-bold` (system-ui) | `font-heading font-bold` (Outfit) |

## Escala de Tamanos

| Clase | Tamano | Uso tipico |
|-------|--------|------------|
| `text-[10px]` | 10px | Labels de inputs, IDs monospace, micro-text |
| `text-xs` | 12px | Badges, captions, metadata |
| `text-sm` | 14px | Texto general, nav items, tabla cells |
| `text-base` | 16px | Inputs (prevenir zoom iOS), body text largo |
| `text-lg` | 18px | Subtitulos, texto destacado |
| `text-xl` | 20px | Titulos de seccion |
| `text-2xl` | 24px | CardTitle, titulos de pagina |
| `text-3xl` | 30px | Heroes, headings principales |
| `text-5xl` | 48px | Estadisticas grandes (master dashboard) |

## Pesos

| Clase | Peso | Uso |
|-------|------|-----|
| `font-medium` | 500 | Body text, master buttons |
| `font-semibold` | 600 | Nav items, badges, table headers |
| `font-bold` | 700 | Web buttons, headings, card titles |
| `font-black` | 900 | Master headings, CTAs prominentes |

## Tracking (Letter Spacing)

| Clase | Uso |
|-------|-----|
| `tracking-tighter` | Headings grandes (master) |
| `tracking-tight` | CardTitle, headings medios |
| `tracking-wider` | Labels de inputs (web) |
| `tracking-widest` | Labels uppercase (master), nav labels |

## Patrones Comunes

### Labels de Formulario
```jsx
// Web
<label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">
  Email
</label>

// Master
<span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
  Nombre de la Sala
</span>
```

### Titulos de Pagina
```jsx
// Web
<h1 className="text-2xl font-serif font-bold text-tropical-primary">
  Buscar Escape Rooms
</h1>

// Master
<h1 className="text-5xl font-black tracking-tighter text-foreground">
  Dashboard
</h1>
```

### Texto Secundario
```jsx
// Web
<p className="text-sm text-tropical-text/60">Descripcion sutil</p>

// Master
<p className="text-sm text-foreground/50">Descripcion sutil</p>
```

### IDs Monospace (Master)
```jsx
<span className="text-[10px] text-foreground/30 font-mono uppercase">
  ID: abc-123
</span>
```

## Archivos Fuente

- Web: `web/src/styles/global.css` (lineas 12-14, 40-43)
- Master: `master/src/styles/global.css` (lineas 45-46, 57-64)
