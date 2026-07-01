# Divergencias Web vs Master

Este documento lista todas las diferencias de diseno entre las dos apps del monorepo.

## Paleta de Colores

| Token | Web (B2C) | Master (B2B) | Notas |
|-------|-----------|--------------|-------|
| `tropical-primary` | `#0097b2` | `#0097b2` | Identico |
| `tropical-secondary` | `#00849c` (cyan oscuro) | `#4db8a8` (teal claro) | **DIFERENTE** |
| `tropical-accent` | `#f39c12` (naranja) | `#f4c430` (dorado) | **DIFERENTE** |
| Background | `#f8fafc` (slate-50) | `#e8f5f3` (teal claro) | **DIFERENTE** |
| Text | `#2d2d2d` (gris) | `#0d3d34` (verde oscuro) | **DIFERENTE** |
| Extra colors | — | `tropical-dark`, `tropical-light`, `tropical-sand`, `tropical-wood`, `tropical-alert` | Solo master |
| Tokens semanticos | No | Si (background, foreground, muted, destructive, border, ring, etc.) | Solo master |

## Tipografia

| Aspecto | Web | Master |
|---------|-----|--------|
| Body font | system-ui stack | Inter |
| Heading font | system-ui stack | Outfit |
| Heading weight | `font-bold` | `font-bold` / `font-black` |
| Label weight | `font-bold` | `font-black` |
| Label tracking | `tracking-wider` | `tracking-widest` |

## Button

| Aspecto | Web | Master |
|---------|-----|--------|
| Base radius | `rounded-xl` | `rounded-md` |
| Base font | `font-bold` | `font-medium` |
| Focus ring | `ring-2` con `ring-offset-2` | `ring-1` sin offset |
| Active state | `active:scale-[0.97]` (todas) | Solo en `tropical` |
| Touch optim. | `touch-manipulation select-none` | No |
| SVG handling | No | `[&_svg]:size-4 [&_svg]:shrink-0` |
| Gap | No | `gap-2` |
| Radix Slot | No | Si (`asChild`) |
| CTA variant | Si (naranja) | No |
| Destructive | No | Si (rojo) |
| Sizes responsive | Si (`h-11 sm:h-10`) | No (`h-9` fijo) |
| Default height | 44px mobile, 40px desktop | 36px |

## Badge

| Aspecto | Web | Master |
|---------|-----|--------|
| Variantes | 5 | 7 |
| Extra | — | `success` (verde), `warning` (amber) |

## Card

| Aspecto | Web | Master |
|---------|-----|--------|
| Background | `bg-white` | `bg-card` (token) |
| Text | `text-tropical-text` | `text-card-foreground` |
| Border | `border-tropical-secondary/10` | `border` (token) |
| Shadow | `shadow-sm` | `shadow` |
| Hover | `hover:shadow-md` | No |
| Title color | `text-tropical-primary` | Hereda |
| Title weight | `font-bold` | `font-semibold` |
| Title font | `font-serif` | Hereda |

## Input / Formularios

| Aspecto | Web | Master |
|---------|-----|--------|
| Componente | `<Input>` reutilizable | Inline |
| Radius | `rounded-xl sm:rounded-2xl` | `rounded-2xl` |
| Padding | `px-3 py-2` | `px-4 py-3` |
| iOS zoom fix | Si | No |
| Error state | Integrado | Manual |
| Icon | Integrado | Manual |

## Layout

| Aspecto | Web | Master |
|---------|-----|--------|
| Tipo | Header + content + footer | Sidebar + header + content |
| Nav desktop | Top header links | Sidebar con 17 items |
| Nav mobile | Bottom bar (6 items) | Sidebar oculta |
| Container | `max-w-7xl mx-auto` | Full width con padding |
| Sidebar | No | `w-64` (colapsable a `w-20`) |

## Estilos Exclusivos

### Solo Web
- Mobile utilities (20+): safe-area, momentum-scroll, bottom-sheet, fab, etc.
- `.card-touch` — Cards con feedback tactil
- `.skeleton` — Loading placeholder
- Animations: slide-up, slide-in-right
- Bottom navigation bar
- HeroSearchBar (barra Airbnb)
- GameCard (tarjeta de sala)

### Solo Master
- `.glass` — Glassmorphism effect
- Tokens semanticos completos (shadcn pattern)
- Stats cards con colores semanticos (indigo, emerald, amber, rose)
- Sidebar navigation con collapse
- Google Fonts (Inter + Outfit)
- Badge `success` y `warning`
- Button `destructive`

## Componentes Compartidos

| Componente | Divergencias |
|------------|-------------|
| `CalendarReservations.tsx` | useEffect dependencies ligeramente diferentes |
| `cn()` utility | Identico |
| `Table.tsx` | Identico |
| `Badge.tsx` | Master tiene variantes extra |
| `Button.tsx` | Significativamente diferente (ver arriba) |
| `Card.tsx` | Diferente (web usa tropical-*, master usa tokens) |
