# CalendarReservations — Componente Compartido

> Archivo fuente: `web/src/components/shared_vendor/CalendarReservations.tsx`
> Duplicado en: `master/src/components/shared_vendor/CalendarReservations.tsx`

## Proposito

Calendario de disponibilidad para salas de escape. Muestra un grid mensual con slots disponibles y ocupados.

## API

```tsx
interface CalendarReservationsProps {
  palette?: string          // Nombre de la paleta de colores (default: "tropical")
  gameId?: string           // ID de la sala
  numPeople?: number        // Numero de jugadores
  erdToken?: string         // Token para ERD panel
  erdGameId?: string        // ID de juego ERD
  fetchAvailability?: boolean  // Activar fetch de disponibilidad
  onDateSelect?: (date: string) => void  // Callback al seleccionar fecha
}
```

## 16 Paletas de Color

| Paleta | Primary | Secondary | Accent | Highlight | Dark |
|--------|---------|-----------|--------|-----------|------|
| `tropical` | #1F6357 | #4DB8A8 | #F4E9CD | #F4C430 | #F39C12 |
| `warm` | #D4451A | #F2994A | #FFF3E0 | #FFD54F | #E65100 |
| `cool` | #1A73E8 | #4FC3F7 | #E3F2FD | #81D4FA | #0D47A1 |
| `contrast` | #212121 | #757575 | #F5F5F5 | #FFD600 | #000000 |
| `neon` | #00E676 | #00BFA5 | #E0F7FA | #FFEA00 | #00C853 |
| `fire` | #FF3D00 | #FF6E40 | #FFF3E0 | #FFD600 | #DD2C00 |
| `ocean` | #0277BD | #4FC3F7 | #E1F5FE | #80DEEA | #01579B |
| `sunset` | #E65100 | #FF9800 | #FFF8E1 | #FFCC02 | #BF360C |
| `nature` | #2E7D32 | #66BB6A | #E8F5E9 | #FDD835 | #1B5E20 |
| `lavender` | #7B1FA2 | #BA68C8 | #F3E5F5 | #E1BEE7 | #4A148C |
| `electric` | #6200EA | #7C4DFF | #EDE7F6 | #B388FF | #311B92 |
| `mint` | #00695C | #4DB6AC | #E0F2F1 | #80CBC4 | #004D40 |
| `purple` | #4A148C | #9C27B0 | #F3E5F5 | #CE93D8 | #311B92 |
| `meadow` | #33691E | #8BC34A | #F1F8E9 | #DCEDC8 | #1B5E20 |
| `twilight` | #283593 | #5C6BC0 | #E8EAF6 | #9FA8DA | #1A237E |
| `vista` | #004D40 | #26A69A | #E0F2F1 | #80CBC4 | #00251A |

## Grid Layout

```jsx
// Header dias de la semana
<div className="grid grid-cols-7 gap-0 border-b border-gray-200 bg-gray-50">
  {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
    <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">
      {day}
    </div>
  ))}
</div>

// Grid de dias
<div className="grid grid-cols-7 gap-0 border border-gray-200">
  <div className="min-h-[120px] border border-gray-200 p-2 bg-white hover:bg-gray-50
                  transition-colors cursor-pointer">
    <span className="text-sm font-semibold text-gray-700">{dayNumber}</span>
    {/* Badges de disponibilidad */}
  </div>
</div>
```

## Badges de Disponibilidad

```jsx
// Disponible
<span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
      style={{ color: palette.primary, backgroundColor: `${palette.primary}15` }}>
  09:00
</span>

// Reservado
<span className="text-[10px] px-1.5 py-0.5 rounded font-bold text-gray-400 bg-gray-100">
  11:00
</span>
```

## Navegacion Mensual

```jsx
<div className="flex items-center justify-between p-4">
  <button className="p-2 hover:bg-gray-100 rounded-lg">
    <ChevronLeft className="w-5 h-5" />
  </button>
  <h3 className="text-lg font-bold">{monthName} {year}</h3>
  <button className="p-2 hover:bg-gray-100 rounded-lg">
    <ChevronRight className="w-5 h-5" />
  </button>
</div>
```

## Diferencia Web vs Master

La version web usa `fetchAvailability` en el useEffect dependency array, mientras que master usa `erdToken` y `erdGameId`. Funcionalmente equivalentes pero ligeramente divergentes.
