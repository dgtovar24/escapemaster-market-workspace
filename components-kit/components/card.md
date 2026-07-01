# Card — Componente

> Archivo fuente: `web/src/components/ui/Card.tsx` | `master/src/components/ui/Card.tsx`

## Subcomponentes

El Card es un componente compuesto con 6 partes:

| Subcomponente | Proposito |
|---------------|-----------|
| `Card` | Contenedor principal |
| `CardHeader` | Area de titulo + descripcion |
| `CardTitle` | Titulo h3 |
| `CardDescription` | Subtitulo/descripcion |
| `CardContent` | Cuerpo del contenido |
| `CardFooter` | Acciones al pie |

## Clases — Web (B2C)

```tsx
Card:            "rounded-xl bg-white text-tropical-text shadow-sm
                  border border-tropical-secondary/10
                  hover:shadow-md transition-shadow duration-300"

CardHeader:      "flex flex-col space-y-1.5 p-6"

CardTitle:       "text-2xl font-serif font-bold leading-none tracking-tight
                  text-tropical-primary"

CardDescription: "text-sm text-tropical-text/60"

CardContent:     "p-6 pt-0"

CardFooter:      "flex items-center p-6 pt-0"
```

## Clases — Master (B2B)

```tsx
Card:            "rounded-xl border bg-card text-card-foreground shadow"

CardHeader:      "flex flex-col space-y-1.5 p-6"

CardTitle:       "font-semibold leading-none tracking-tight"

CardDescription: "text-sm text-muted-foreground"

CardContent:     "p-6 pt-0"

CardFooter:      "flex items-center p-6 pt-0"
```

## Diferencias

| Aspecto | Web | Master |
|---------|-----|--------|
| Background | `bg-white` (hardcoded) | `bg-card` (token) |
| Text color | `text-tropical-text` | `text-card-foreground` |
| Border | `border-tropical-secondary/10` | `border` (token) |
| Shadow | `shadow-sm` | `shadow` |
| Hover | `hover:shadow-md transition-shadow` | No hover por defecto |
| Title color | `text-tropical-primary` | Hereda color |
| Title weight | `font-bold` | `font-semibold` |
| Title font | `font-serif` | Hereda (Outfit) |
| Title size | `text-2xl` | No definido (hereda) |
| Description | `text-tropical-text/60` | `text-muted-foreground` |

## Ejemplos de Uso

```jsx
// Web — Card tipica
<Card>
  <CardHeader>
    <CardTitle>Escape Room Barcelona</CardTitle>
    <CardDescription>Los mejores escape rooms de la ciudad</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido aqui...</p>
  </CardContent>
  <CardFooter>
    <Button variant="cta">Reservar</Button>
  </CardFooter>
</Card>

// Master — Card de dashboard
<Card className="border-none shadow-sm overflow-hidden">
  <CardHeader className="bg-white border-b border-border/50 px-8 py-8">
    <CardTitle className="text-2xl font-black">Empresas</CardTitle>
    <CardDescription>Gestiona las organizaciones registradas</CardDescription>
  </CardHeader>
  <CardContent className="p-0">
    <Table>...</Table>
  </CardContent>
</Card>

// Card con stats
<Card className="p-6">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
      <Building2 className="w-6 h-6 text-indigo-500" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">Empresas</p>
      <p className="text-3xl font-black">42</p>
    </div>
  </div>
</Card>
```
