# Badge — Componente

> Archivo fuente: `web/src/components/ui/Badge.tsx` | `master/src/components/ui/Badge.tsx`

## API

```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'tropical'
            | 'success' | 'warning'  // success y warning solo master
}
```

## Base Classes (Compartidas)

```
inline-flex items-center rounded-md border px-2.5 py-0.5
text-xs font-semibold transition-colors
focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
```

## Variantes — Web

| Variante | Clases |
|----------|--------|
| `default` | `border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80` |
| `secondary` | `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `destructive` | `border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80` |
| `outline` | `text-foreground` (solo borde) |
| `tropical` | `border-transparent bg-tropical-secondary text-white shadow hover:opacity-90` |

## Variantes — Master (Adicionales)

Incluye todas las variantes de web mas:

| Variante | Clases | Uso |
|----------|--------|-----|
| `success` | `border-transparent bg-green-100 text-green-700` | Estado activo, exito |
| `warning` | `border-transparent bg-amber-100 text-amber-700` | Advertencia, pendiente |

## Ejemplos de Uso

```jsx
// Estado de sala (master)
<Badge variant={room.is_active ? 'tropical' : 'outline'}>
  {room.is_active ? 'ACTIVA' : 'INACTIVA'}
</Badge>

// Master — con estilo custom
<Badge variant="tropical" className="rounded-lg font-black text-[10px]">
  ACTIVA
</Badge>

// Web — dificultad
<Badge variant="secondary">Dificil</Badge>

// Web — nuevo
<Badge variant="tropical">Nuevo</Badge>

// Master — estado de pago
<Badge variant="success">Pagado</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="destructive">Cancelado</Badge>

// Outline para categorias
<Badge variant="outline">Terror</Badge>
<Badge variant="outline">Aventura</Badge>
```

## Diferencias Web vs Master

| Aspecto | Web | Master |
|---------|-----|--------|
| Variantes | 5 | 7 (+success, +warning) |
| tropical color | `bg-tropical-secondary` (#00849c web, #4db8a8 master) | Mismo patron, distinto color |
| Hover | `hover:bg-*/80` | Igual |
