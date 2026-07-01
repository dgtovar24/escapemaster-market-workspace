# GameCard — Componente

> Archivo fuente: `web/src/components/GameCard.tsx`
> Solo existe en **web** (B2C marketplace).

## Proposito

Tarjeta de sala de escape estilo Airbnb. Muestra imagen, nombre, rating, ubicacion y precio.

## Estructura

```
GameCard (link wrapper)
├── Imagen (aspect-4/3)
│   ├── Boton favorito (top-right)
│   └── Hover overlay (desktop only)
│       ├── Duracion
│       ├── Jugadores
│       └── Tags de tema
├── Rating (estrellas + count)
├── Nombre de la sala
├── Ubicacion (ciudad)
├── Info mobile (duracion + jugadores)
└── Precio (por persona o por sesion)
```

## Clases Clave

### Container
```jsx
<a className="group block">
```
El `group` permite hover effects cascading en hijos.

### Imagen
```jsx
<div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
  <img className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
</div>
```
- Aspect ratio: `4:3`
- Hover zoom: `scale-[1.03]` con `duration-300`
- Lazy loading: `loading="lazy"`

### Boton Favorito
```jsx
<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80
                   backdrop-blur-sm flex items-center justify-center
                   hover:scale-110 transition-transform z-10">
  <Heart className="w-4 h-4" />
</button>
```

### Hover Overlay (Desktop)
```jsx
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                hidden sm:flex flex-col justify-end p-4">
  {/* Duracion, jugadores, tags */}
</div>
```
- Oculto en mobile (`hidden sm:flex`)
- Gradiente desde abajo: `from-black/60`

### Rating
```jsx
<div className="flex items-center gap-1 mb-1">
  <Star className="w-3.5 h-3.5 fill-current text-tropical-primary" />
  <span className="text-sm font-semibold">{rating}</span>
  <span className="text-sm text-gray-500">({count})</span>
</div>
```

### Nombre
```jsx
<h3 className="font-semibold text-[15px] sm:text-sm text-gray-900 line-clamp-1">
  {name}
</h3>
```

### Ubicacion
```jsx
<p className="text-sm text-gray-500 flex items-center gap-1">
  <MapPin className="w-3.5 h-3.5" />
  {city}
</p>
```

### Precio
```jsx
<p className="text-[15px] sm:text-sm font-bold mt-1">
  Desde {price}EUR
  <span className="font-normal text-gray-500"> /persona</span>
</p>
```

## Responsive

- Mobile: muestra duracion y jugadores inline (sin overlay)
- Desktop: oculta info inline, muestra en hover overlay
- Text sizes: `text-[15px]` mobile, `text-sm` desktop
