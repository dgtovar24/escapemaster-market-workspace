# Forms — Patrones de Formulario

## Patron Web (B2C)

Usa el componente `Input` reutilizable (ver [input.md](./input.md)).

### Layout Tipico
```jsx
<form className="space-y-4 sm:space-y-6">
  <Input
    label="Email"
    type="email"
    icon={<Mail className="w-5 h-5" />}
    error={errors.email}
    placeholder="tu@email.com"
  />

  <Input
    label="Contrasena"
    type="password"
    icon={<Lock className="w-5 h-5" />}
    error={errors.password}
    placeholder="Min. 8 caracteres"
  />

  <Button variant="cta" className="w-full" type="submit">
    Crear Cuenta
  </Button>
</form>
```

### Formulario 2 Columnas
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Input label="Nombre" />
  <Input label="Apellido" />
</div>
```

### Validacion
```jsx
// Error display via Input component
<Input label="Email" error="Email ya registrado" />

// Resultado:
// - Border cambia a rojo
// - Ring cambia a rojo
// - Mensaje en text-[10px] text-destructive uppercase
```

## Patron Master (B2B)

No usa componente Input reutilizable. Inputs inline con clases directas.

### Layout Tipico
```jsx
<form className="space-y-6">
  <label className="block space-y-2">
    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
      Nombre de la Empresa
    </span>
    <input
      className="w-full px-4 py-3 rounded-2xl border border-border bg-white"
      placeholder="Ej: Escape Room Barcelona"
    />
  </label>

  <label className="block space-y-2">
    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">
      Descripcion
    </span>
    <textarea
      className="w-full px-4 py-3 rounded-2xl border border-border bg-white min-h-[120px] resize-none"
      placeholder="Describe tu empresa..."
    />
  </label>

  <Button variant="tropical" className="rounded-2xl h-12 px-6 font-black uppercase">
    Guardar
  </Button>
</form>
```

### Select
```jsx
<select className="w-full px-4 py-3 rounded-2xl border border-border bg-white">
  <option value="">Seleccionar...</option>
  <option value="1">Opcion 1</option>
</select>
```

### Checkbox (Master)
```jsx
<label className="flex items-center gap-3 cursor-pointer group">
  <input type="checkbox" className="w-4 h-4 rounded border-border accent-tropical-primary" />
  <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground">
    Sala activa
  </span>
</label>
```

## Comparativa

| Aspecto | Web | Master |
|---------|-----|--------|
| Componente | `<Input>` reutilizable | Inline con clases |
| Label style | `text-[10px] font-bold tracking-wider` | `text-[10px] font-black tracking-widest` |
| Input radius | `rounded-xl sm:rounded-2xl` | `rounded-2xl` |
| Input height | `h-11 sm:h-12` | Implicito (`py-3`) |
| Input padding | `px-3 py-2` | `px-4 py-3` |
| Error handling | Props `error` | Manual |
| Icon support | Props `icon` | Manual |
| iOS zoom fix | `style={{ fontSize: '16px' }}` | No |
| Focus ring | `ring-2 ring-tropical-primary/20` | Default browser |
| Border | `border-input` | `border-border` |

## Formularios Especificos

### RegisterForm (Web)
- 2 pasos: tipo cuenta + datos + verificacion email
- Account type: cards seleccionables (customer vs enterprise)
- Verificacion: 6 inputs de 1 digito cada uno

### BookingWidget (Web)
- 4 pasos: Fecha > Horario > Datos > Pago
- Cada paso es un formulario independiente
- Navegacion anterior/siguiente con progress bar
- Paso final: resumen + redirect a Stripe

### Room Form (Master)
- Formulario largo: nombre, descripcion, precio, capacidad, duracion, dificultad
- Grid 2 columnas para campos cortos
- Textarea para descripcion
- Subida de imagen
