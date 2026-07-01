# HeroSearchBar — Componente

> Archivo fuente: `web/src/components/HeroSearchBar.tsx`
> Solo existe en **web** (B2C marketplace).

## Proposito

Barra de busqueda principal tipo Airbnb en la pagina de inicio. Permite buscar por destino, fecha, numero de jugadores y filtros avanzados.

## Estructura

```
HeroSearchBar (pill container)
├── Destino (input text)
├── Divider
├── Fecha (hidden sm, date picker)
├── Divider
├── Jugadores (hidden sm, counter)
├── Divider
├── Filtros (icon button)
└── Boton Buscar (circular, tropical-primary)
```

## Clases Principales

### Container
```jsx
<div className="bg-white rounded-full shadow-lg border border-gray-200 h-[66px]
                flex items-center relative">
```

### Secciones
```jsx
<div className="flex-1 px-6 py-3 hover:bg-gray-50 transition-colors rounded-full cursor-pointer">
  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
    Destino
  </div>
  <input className="w-full bg-transparent border-none outline-none text-sm font-medium
                    placeholder:text-gray-400" />
</div>
```

### Dividers
```jsx
<div className="border-r border-gray-200 h-8" />
```

### Boton Buscar
```jsx
<button className="absolute right-2 w-12 h-12 bg-tropical-primary
                   hover:opacity-90 active:scale-95 rounded-full shadow-md
                   flex items-center justify-center transition-all">
  <Search className="w-5 h-5 text-white" />
</button>
```

## Responsive

- Mobile: solo muestra destino + boton buscar
- Desktop (`sm:+`): muestra fecha, jugadores, filtros
- Secciones opcionales: `hidden sm:flex`

## Interacciones

- Hover section: `hover:bg-gray-50` con border radius
- Boton buscar: `hover:opacity-90 active:scale-95`
- Input: transparente, sin bordes, integrado en la pill
