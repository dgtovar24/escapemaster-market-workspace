# Input — Componente

> Archivo fuente: `web/src/components/ui/Input.tsx`
> Solo existe como componente reutilizable en **web**. Master usa inputs inline con clases directas.

## API

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string      // Label superior (uppercase, xs)
  error?: string      // Mensaje de error
  icon?: React.ReactNode  // Icono a la izquierda
}
```

## Estructura HTML

```jsx
<div className="flex flex-col gap-1.5 sm:gap-2 w-full">
  {/* Label (opcional) */}
  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-foreground/40 ml-1">
    {label}
  </label>

  {/* Input wrapper */}
  <div className="relative group flex items-center">
    {/* Icon (opcional) */}
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30
                    group-focus-within:text-tropical-primary transition-colors pointer-events-none z-[1]">
      {icon}
    </div>

    {/* Input */}
    <input className="flex h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl
                      border border-input bg-white px-3 py-2 text-base sm:text-sm
                      shadow-sm transition-all
                      placeholder:text-muted-foreground
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-tropical-primary/20
                      focus-visible:border-tropical-primary
                      disabled:cursor-not-allowed disabled:opacity-50
                      touch-manipulation"
           style={{ fontSize: '16px' }} />
  </div>

  {/* Error (opcional) */}
  <span className="text-[10px] text-destructive font-bold uppercase tracking-tight ml-1">
    {error}
  </span>
</div>
```

## Estados

### Default
- Border: `border-input` (#e2e8f0)
- Background: `bg-white`
- Shadow: `shadow-sm`

### Focus
- Ring: `ring-2 ring-tropical-primary/20`
- Border: `border-tropical-primary`
- Icon color: cambia a `text-tropical-primary`

### Error
- Border: `border-destructive` (rojo)
- Ring: `ring-destructive/20`
- Mensaje: `text-destructive` debajo

### Disabled
- Cursor: `cursor-not-allowed`
- Opacity: `0.5`

## Mobile

- Height: `h-11` (44px) en mobile, `h-12` (48px) en desktop
- Font size forzado a `16px` via style para **prevenir zoom en iOS**
- Border radius: `rounded-xl` mobile, `rounded-2xl` desktop
- `touch-manipulation` para respuesta tactil rapida

## Ejemplos de Uso

```jsx
// Basico
<Input placeholder="tu@email.com" />

// Con label y error
<Input
  label="Email"
  type="email"
  error="Email invalido"
  placeholder="tu@email.com"
/>

// Con icono
<Input
  label="Buscar"
  icon={<Search className="w-5 h-5" />}
  placeholder="Buscar salas..."
/>

// Password
<Input
  label="Contrasena"
  type="password"
  icon={<Lock className="w-5 h-5" />}
  placeholder="Min. 8 caracteres"
/>
```

## Patron Master (Inline)

El master no tiene componente Input reutilizable. Usa clases directas:

```jsx
<label className="block space-y-2">
  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
    Nombre
  </span>
  <input className="w-full px-4 py-3 rounded-2xl border border-border bg-white" />
</label>
```

### Diferencias Master vs Web Input

| Aspecto | Web (componente) | Master (inline) |
|---------|-----------------|-----------------|
| Reutilizable | Si | No |
| Label | `text-[10px] font-bold tracking-wider` | `text-[10px] font-black tracking-widest` |
| Height | `h-11 sm:h-12` | Implicito via `py-3` |
| Radius | `rounded-xl sm:rounded-2xl` | `rounded-2xl` |
| Error state | Integrado | Manual |
| Icon | Integrado | Manual |
| iOS zoom fix | Si (`fontSize: 16px`) | No |
