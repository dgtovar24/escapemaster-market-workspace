# Header — Componente

> Archivo fuente: `web/src/components/Header.tsx`
> Solo existe en **web** (B2C marketplace). Master usa sidebar en AdminLayout.astro.

## Estructura General

El Header tiene 3 partes principales:
1. **Desktop Header** — Barra fija superior (oculta en mobile)
2. **Mobile Menu** — Panel lateral hamburger
3. **Mobile Bottom Nav** — Barra de navegacion inferior fija

## 1. Desktop Header

### Layout
```jsx
<header className="fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300">
  <div className={`
    ${scrolled ? 'bg-white/95 shadow-md' : 'bg-white/80'}
    backdrop-blur-xl border-b border-tropical-secondary/10
  `}>
    <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
      {/* Logo | Nav Links | Actions */}
    </div>
  </div>
</header>
```

### Logo
```jsx
<a className="flex items-center gap-2 group">
  <div className="w-9 h-9 bg-tropical-primary rounded-xl flex items-center justify-center
                  shadow-lg shadow-tropical-primary/20 group-hover:scale-105 transition-transform">
    <span className="text-white font-bold text-lg">E</span>
  </div>
  <div>
    <span className="font-bold text-tropical-primary text-lg tracking-tight">EscapeMaster</span>
    <span className="text-[9px] text-tropical-text/40 block -mt-1">Marketplace</span>
  </div>
</a>
```

### Nav Links (Desktop)
```jsx
<nav className="hidden lg:flex items-center gap-1">
  <a className="px-4 py-2 rounded-xl text-sm font-semibold text-tropical-text/70
               hover:text-tropical-primary hover:bg-tropical-primary/5
               transition-all duration-200">
    Buscador
  </a>
  {/* Equipos, Rutas, Ofertas */}
</nav>
```

### Actions (Desktop)
- Language toggle: `ES | EN` en pill con border
- Chat icon con badge de no leidos (bg-tropical-accent)
- Notifications icon con badge
- "Soy Propietario" link externo
- AuthStatus (login/avatar)

## 2. Mobile Menu

### Trigger
```jsx
<button className="sm:hidden p-2 rounded-xl hover:bg-tropical-primary/5">
  {isOpen ? <X /> : <Menu />}
</button>
```

### Panel
```jsx
<div className="fixed inset-0 z-40 bg-white">
  <div className="h-full overflow-y-auto momentum-scroll pb-24">
    {/* Search bar */}
    {/* User card (si logueado) */}
    {/* Nav links con iconos */}
    {/* Language selector */}
    {/* Logout / Create account */}
  </div>
</div>
```

### User Card (Mobile)
```jsx
<div className="mx-4 p-4 bg-tropical-primary/5 rounded-2xl">
  <div className="flex items-center gap-3">
    {/* Avatar o iniciales */}
    <div>
      <p className="font-bold text-tropical-text">{name}</p>
      <p className="text-xs text-tropical-text/50">{email}</p>
      <div className="flex items-center gap-2 mt-1">
        <Badge>{rank}</Badge>
        <span className="text-[10px] text-tropical-text/40">{xp} XP</span>
      </div>
    </div>
  </div>
</div>
```

## 3. Mobile Bottom Navigation

```jsx
<nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl
                border-t border-tropical-secondary/10 safe-bottom z-50 sm:hidden">
  <div className="flex items-center justify-around h-16 px-2">
    {/* 6 items: Home, Explorar, Equipos, Chat, Avisos, Perfil */}
    <a className="flex flex-col items-center gap-0.5 px-2 py-1">
      <Home className="w-5 h-5 text-tropical-primary" />  {/* o text-tropical-text/40 */}
      <span className="text-[10px] font-medium text-tropical-primary">Inicio</span>
    </a>
  </div>
</nav>
```

### Badges en Bottom Nav
```jsx
{unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 w-4 h-4 bg-tropical-accent
                   rounded-full text-[9px] font-bold text-white flex items-center justify-center">
    {count}
  </span>
)}
```

## Estado

- `scrolled` — Detecta scroll > 10px, cambia opacidad del fondo
- `isOpen` — Mobile menu abierto/cerrado
- `unreadMessages` — Polling cada 15s con Bearer token
- `unreadNotifications` — Polling cada 30s
- `body.modal-open` — Previene scroll cuando menu esta abierto

## Dependencias

- `lucide-react` — Todos los iconos
- `nanostores` — `$user`, `$token` para estado global
- `Astro.params.lang` — i18n (es/en)
