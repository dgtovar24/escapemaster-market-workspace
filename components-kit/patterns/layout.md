# Layout — Patrones de Estructura

## Web: Layout.astro (B2C Marketplace)

> Archivo fuente: `web/src/layouts/Layout.astro`

### Estructura
```
┌─────────────────────────────────────────┐
│ Header (fixed top, z-50)                │
│ backdrop-blur, h-16                     │
├─────────────────────────────────────────┤
│                                         │
│ <slot /> (page content)                 │
│ max-w-7xl mx-auto px-4 sm:px-6         │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
│ 4 columnas: Brand | Soporte | Legal |   │
│             Social                      │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Mobile Bottom Nav (sm:hidden, fixed)    │
│ 6 icons: Home | Search | Teams | Chat | │
│          Notifications | Profile        │
└─────────────────────────────────────────┘
```

### Clases clave
```jsx
// Header
<header className="fixed top-0 left-0 right-0 z-50 safe-top">
  <div className="backdrop-blur-xl bg-white/95 border-b border-tropical-secondary/10">
    <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6">

// Content spacing
<main className="pt-16 pb-20 sm:pb-0">
  {/* pt-16 = header height, pb-20 = mobile bottom nav */}

// Footer
<footer className="bg-white border-t border-tropical-secondary/10">
  <div className="max-w-7xl mx-auto px-6 py-12">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
```

### Container Pattern
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6">
  {/* max-width: 1280px, centrado, con padding responsivo */}
</div>
```

## Web: BareLayout.astro (Auth Pages)

> Archivo fuente: `web/src/layouts/BareLayout.astro`

Layout minimo sin header ni footer. Usado para paginas de login, registro, reset password.

```jsx
<body className="bg-tropical-bg min-h-screen">
  <slot />
</body>
```

## Master: AdminLayout.astro (B2B Admin Panel)

> Archivo fuente: `master/src/layouts/AdminLayout.astro`

### Estructura
```
┌────────────┬────────────────────────────┐
│            │ Top Header (sticky, z-40)  │
│            │ h-20, Production badge     │
│  Sidebar   ├────────────────────────────┤
│  (fixed)   │                            │
│  w-64      │ Content Area               │
│  z-50      │ px-6 py-8 lg:px-12 lg:py-12│
│            │ animate-fade-in            │
│  hidden    │                            │
│  lg:flex   │                            │
│            │                            │
│  17 nav    │                            │
│  items     │                            │
│            │                            │
│  User card │                            │
│  (bottom)  │                            │
└────────────┴────────────────────────────┘
```

### Sidebar
```jsx
<aside className="fixed inset-y-0 z-50 hidden lg:flex w-64
                  flex-col bg-white border-r border-border shadow-sm
                  transition-all duration-300">

  {/* Logo */}
  <div className="p-8 flex items-center gap-3">
    <div className="w-10 h-10 bg-tropical-primary rounded-xl flex items-center justify-center
                    text-white font-bold text-xl shadow-lg shadow-tropical-primary/20">
      E
    </div>
    <div>
      <span className="font-heading font-bold text-lg text-foreground">EscapeMaster</span>
      <span className="text-[10px] text-foreground/30 block">Admin Panel</span>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-4 space-y-1 mt-4">
    <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  text-foreground/50 hover:bg-tropical-light hover:text-tropical-primary
                  transition-all duration-200">
      <LayoutDashboard className="w-5 h-5" />
      Empresas
    </a>
  </nav>

  {/* Active state */}
  <a className="bg-tropical-light text-tropical-primary">

  {/* User card */}
  <div className="p-6 border-t border-border/50">
    <div className="bg-tropical-light/50 rounded-2xl p-4 border border-tropical-secondary/10">
```

### Sidebar Collapse (JavaScript)
```javascript
// Toggle entre w-64 y w-20
sidebar.classList.toggle('w-64');
sidebar.classList.toggle('w-20');
// Texto se oculta con opacity-0 pointer-events-none
```

### Main Content Area
```jsx
<main className="flex-1 lg:ml-64 transition-all duration-300 min-h-screen">
  {/* Header */}
  <header className="h-20 flex items-center px-6 lg:px-12 bg-white/80 backdrop-blur-md
                     border-b border-border/50 sticky top-0 z-40">
    <Badge className="text-[10px] font-bold">Production</Badge>
  </header>

  {/* Content */}
  <div className="px-6 py-8 lg:px-12 lg:py-12 animate-fade-in">
    <slot />
  </div>
</main>
```

## Patrones de Grid

### Game Cards (Web)
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
```

### Stats Dashboard (Master)
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

### Footer (Web)
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
```

### Form 2-Column
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

### Flex Layouts
```jsx
// Horizontal con wrap
<div className="flex flex-wrap gap-2">

// Stack vertical mobile, horizontal desktop
<div className="flex flex-col md:flex-row gap-4">

// Space between
<div className="flex items-center justify-between">

// Center
<div className="flex items-center justify-center">
```
