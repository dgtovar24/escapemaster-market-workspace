# Table — Componente

> Archivo fuente: `web/src/components/ui/Table.tsx` | `master/src/components/ui/Table.tsx`
> Identico en ambas apps.

## Subcomponentes

| Subcomponente | Elemento HTML | Clases |
|---------------|---------------|--------|
| `Table` | `<table>` | `w-full caption-bottom text-sm` (envuelto en `<div class="relative w-full overflow-auto">`) |
| `TableHeader` | `<thead>` | `[&_tr]:border-b` |
| `TableBody` | `<tbody>` | `[&_tr:last-child]:border-0` |
| `TableFooter` | `<tfoot>` | `border-t bg-muted/50 font-medium [&>tr]:last:border-b-0` |
| `TableRow` | `<tr>` | `border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted` |
| `TableHead` | `<th>` | `h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0` |
| `TableCell` | `<td>` | `p-2 align-middle [&:has([role=checkbox])]:pr-0` |
| `TableCaption` | `<caption>` | `mt-4 text-sm text-muted-foreground` |

## Estados

- **Hover row:** `hover:bg-muted/50` (fondo gris sutil)
- **Selected row:** `data-[state=selected]:bg-muted` (via data attribute)
- **Checkbox alignment:** Padding derecho eliminado cuando contiene checkbox

## Ejemplo de Uso

```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Ciudad</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead className="text-right">Precio</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rooms.map((room) => (
      <TableRow key={room.id}>
        <TableCell className="font-medium">{room.name}</TableCell>
        <TableCell>{room.city}</TableCell>
        <TableCell>
          <Badge variant={room.is_active ? 'success' : 'outline'}>
            {room.is_active ? 'Activa' : 'Inactiva'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">{room.price}EUR</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Patron Master — Tabla en Card

```jsx
<Card className="border-none shadow-sm overflow-hidden">
  <CardHeader className="bg-white border-b border-border/50 px-8 py-8">
    <CardTitle className="text-2xl font-black">Salas</CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    <Table>
      {/* ... */}
    </Table>
  </CardContent>
</Card>
```
