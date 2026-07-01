# Button — Componente

> Archivo fuente: `web/src/components/ui/Button.tsx` | `master/src/components/ui/Button.tsx`

## Dependencias
- `class-variance-authority` (CVA) para variantes
- `clsx` + `tailwind-merge` via `cn()`
- Master usa `@radix-ui/react-slot` para `asChild`

## API

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'cta' | 'link' | 'tropical'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean  // Solo master (Radix Slot)
}
```

## Variantes — Web (B2C)

| Variante | Clases | Cuando usar |
|----------|--------|-------------|
| `default` | `bg-tropical-primary text-white hover:bg-tropical-primary/90 shadow-lg hover:shadow-xl` | CTA principal, acciones primarias |
| `secondary` | `bg-tropical-secondary text-white hover:bg-tropical-secondary/90 shadow-md` | Acciones secundarias |
| `outline` | `border-2 border-tropical-primary text-tropical-primary bg-transparent hover:bg-tropical-primary/10` | Acciones alternativas, cancelar |
| `ghost` | `hover:bg-tropical-primary/10 text-tropical-text` | Acciones sutiles, nav items |
| `cta` | `bg-tropical-accent text-white hover:bg-tropical-accent/90 shadow-lg hover:shadow-orange-500/20` | Urgencia: "Reservar ahora", "Comprar" |
| `link` | `text-tropical-primary underline-offset-4 hover:underline` | Links inline en texto |
| `tropical` | `bg-tropical-primary text-white hover:bg-tropical-primary/90 shadow-lg` | Similar a default (legacy) |

### Sizes — Web

| Size | Clases |
|------|--------|
| `default` | `h-11 sm:h-10 px-5 py-2 min-w-[44px]` (responsive) |
| `sm` | `h-9 rounded-lg px-3` |
| `lg` | `h-12 sm:h-12 rounded-xl px-8 text-base min-w-[48px]` |
| `icon` | `h-11 w-11 sm:h-10 sm:w-10` (responsive) |

### Base Classes — Web
```
inline-flex items-center justify-center whitespace-nowrap rounded-xl
text-sm font-bold ring-offset-background transition-all
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:pointer-events-none disabled:opacity-50
active:scale-[0.97] touch-manipulation select-none
```

## Variantes — Master (B2B)

| Variante | Clases | Cuando usar |
|----------|--------|-------------|
| `default` | `bg-primary text-primary-foreground shadow hover:bg-primary/90` | Accion principal |
| `destructive` | `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90` | Eliminar, danger |
| `outline` | `border border-input bg-background shadow-sm hover:bg-accent` | Acciones secundarias |
| `secondary` | `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80` | Acciones complementarias |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | Acciones sutiles |
| `link` | `text-primary underline-offset-4 hover:underline` | Links |
| `tropical` | `bg-tropical-primary text-white shadow hover:opacity-90 active:scale-95` | CTA con estilo tropical |

### Sizes — Master

| Size | Clases |
|------|--------|
| `default` | `h-9 px-4 py-2` |
| `sm` | `h-8 rounded-md px-3 text-xs` |
| `lg` | `h-10 rounded-md px-8` |
| `icon` | `h-9 w-9` |

### Base Classes — Master
```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
text-sm font-medium transition-colors
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
```

## Diferencias Clave

| Aspecto | Web | Master |
|---------|-----|--------|
| Border radius | `rounded-xl` | `rounded-md` |
| Font weight | `font-bold` | `font-medium` |
| Focus ring | `ring-2 ring-offset-2` | `ring-1` (sin offset) |
| Active state | `active:scale-[0.97]` | Solo en `tropical` variant |
| Touch | `touch-manipulation select-none` | No |
| SVG sizing | No | `[&_svg]:size-4 [&_svg]:shrink-0` |
| Icon gap | No | `gap-2` |
| Radix Slot | No | Si (`asChild` prop) |
| CTA variant | Si (naranja) | No |
| Destructive | No | Si (rojo) |
| Sizes responsive | Si (h-11 sm:h-10) | No (fijo h-9) |

## Ejemplos de Uso

```jsx
// Web — CTA principal
<Button variant="cta" size="lg">
  Reservar Ahora
</Button>

// Web — Outline
<Button variant="outline">
  Cancelar
</Button>

// Web — Icon button
<Button variant="ghost" size="icon">
  <Heart className="w-5 h-5" />
</Button>

// Master — Con icono (gap automatico)
<Button variant="tropical" className="rounded-2xl h-12 px-6 font-black uppercase">
  <Plus className="w-5 h-5" />
  Nueva Sala
</Button>

// Master — Destructive
<Button variant="destructive" size="sm">
  Eliminar
</Button>

// Master — Como link (asChild)
<Button variant="link" asChild>
  <a href="/dashboard">Ir al Dashboard</a>
</Button>
```
