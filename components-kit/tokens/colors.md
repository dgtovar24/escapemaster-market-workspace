# Paleta de Colores — EscapeMaster Design System

> **REGLA CRITICA:** NUNCA hardcodear hex colors. Siempre usar clases `tropical-*` o tokens semanticos.

## Paleta Tropical (Compartida)

| Token | Web (B2C) | Master (B2B) | Uso |
|-------|-----------|--------------|-----|
| `tropical-primary` | `#0097b2` | `#0097b2` | Headers, CTAs primarios, links activos |
| `tropical-secondary` | `#00849c` | `#4db8a8` | Contraste, badges, acentos sutiles |
| `tropical-accent` | `#f39c12` | `#f4c430` | CTAs de urgencia, highlights |
| `tropical-bg` | `#f8fafc` | — | Fondo general (solo web) |
| `tropical-text` | `#2d2d2d` | — | Texto principal (solo web) |
| `tropical-card` | `#ffffff` | — | Fondo de cards (solo web) |
| `tropical-dark` | — | `#006b7d` | Cyan oscuro (solo master) |
| `tropical-light` | — | `#e8f5f3` | Backgrounds claros, hover (solo master) |
| `tropical-sand` | — | `#ffffff` | Blanco (solo master) |
| `tropical-wood` | — | `#d4c5a0` | Beige decorativo (solo master) |
| `tropical-alert` | — | `#f39c12` | Alertas naranja (solo master) |

## Tokens Semanticos (Solo Master)

El master define tokens semanticos adicionales que mapean a colores base:

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#e8f5f3` | Fondo base de la app |
| `foreground` | `#0d3d34` | Texto principal |
| `card` | `#ffffff` | Fondo de cards |
| `card-foreground` | `#0d3d34` | Texto en cards |
| `popover` | `#ffffff` | Fondo de popovers |
| `popover-foreground` | `#0d3d34` | Texto en popovers |
| `primary` | `#0097b2` | Color interactivo principal |
| `primary-foreground` | `#ffffff` | Texto sobre primary |
| `secondary` | `#4db8a8` | Color interactivo secundario |
| `secondary-foreground` | `#0d3d34` | Texto sobre secondary |
| `muted` | `#f1f5f9` | Fondos apagados |
| `muted-foreground` | `#64748b` | Texto apagado |
| `accent` | `#4db8a8` | Acentos |
| `accent-foreground` | `#ffffff` | Texto sobre accent |
| `destructive` | `#ef4444` | Errores, eliminar |
| `destructive-foreground` | `#ffffff` | Texto sobre destructive |
| `border` | `#e2e8f0` | Bordes generales |
| `input` | `#e2e8f0` | Bordes de inputs |
| `ring` | `#0097b2` | Focus ring |

## Colores de Estado (Uso comun)

| Estado | Clase Tailwind | Uso |
|--------|---------------|-----|
| Exito | `bg-green-100 text-green-700` | Badges de exito, confirmaciones |
| Warning | `bg-amber-100 text-amber-700` | Advertencias |
| Error | `bg-destructive text-destructive-foreground` | Errores, eliminar |
| Info | `bg-blue-50 text-blue-600` | Informacion |

## Colores de Stats Cards (Master)

Usados en dashboards para diferenciar metricas:

| Metrica | Background | Icono |
|---------|-----------|-------|
| Empresas | `bg-indigo-50` | `text-indigo-500` |
| Salas | `bg-emerald-50` | `text-emerald-500` |
| Revenue | `bg-amber-50` | `text-amber-500` |
| Alertas | `bg-rose-50` | `text-rose-500` |

## Uso Correcto

```jsx
// BIEN — usando clases tropical
<div className="bg-tropical-primary text-white">Header</div>
<p className="text-tropical-text">Texto principal</p>
<button className="bg-tropical-accent hover:bg-tropical-accent/90">Reservar</button>
<div className="bg-tropical-card border border-tropical-secondary/20">Card</div>

// BIEN — usando opacidad
<span className="text-tropical-text/60">Texto secundario</span>
<div className="bg-tropical-primary/10">Fondo sutil</div>
<div className="border-tropical-secondary/10">Borde sutil</div>

// MAL — hardcodeando hex
<div style={{ color: '#0097b2' }}>NO HACER ESTO</div>
<div className="bg-[#f39c12]">NO HACER ESTO</div>
```

## Archivos Fuente

- Web: `web/src/styles/global.css` (lineas 3-22)
- Master: `master/src/styles/global.css` (lineas 3-47)
