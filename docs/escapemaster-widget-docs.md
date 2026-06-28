# 📚 EscapeMaster Widget — Documentación Técnica Completa

> Versión 1.0 · Abril 2026  
> Autor: EscapeMaster Platform  
> Propósito: Referencia completa para integrar, personalizar y administrar el widget de reservas en cientos de salas de escape room.

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [API de ERD Panel — Endpoints completos](#2-api-de-erd-panel--endpoints-completos)
3. [Datos obtenidos de cada endpoint](#3-datos-obtenidos-de-cada-endpoint)
4. [Calendario: un game vs varios games](#4-calendario-un-game-vs-varios-games)
5. [Obtener solo la imagen de una sala](#5-obtener-solo-la-imagen-de-una-sala)
6. [Sistema de estilos — Variables CSS](#6-sistema-de-estilos--variables-css)
7. [Guía de personalización visual completa](#7-guía-de-personalización-visual-completa)
8. [Implementación multi-sala (cientos de salas)](#8-implementación-multi-sala-cientos-de-salas)
9. [Panel de administración — Diseño propuesto](#9-panel-de-administración--diseño-propuesto)
10. [Esquema de base de datos sugerido](#10-esquema-de-base-de-datos-sugerido)
11. [API REST interna de EscapeMaster](#11-api-rest-interna-de-escapemaster)
12. [Embed del widget por sala](#12-embed-del-widget-por-sala)
13. [Referencia rápida de variables CSS](#13-referencia-rápida-de-variables-css)

---

## 1. Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                 CLIENTE (navegador)                  │
│                                                      │
│  booking-widget.html (autocontenido)                 │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │  CSS Tokens  │    │     JavaScript (IIFE)      │  │
│  │  (Variables) │    │  Estado + Flujo de 4 pasos │  │
│  └──────────────┘    └────────────┬──────────────┘  │
└───────────────────────────────────┼─────────────────┘
                                    │ fetch() POST JSON
                    ┌───────────────▼───────────────────┐
                    │      ERD Panel API                  │
                    │  https://erdpanel.com/api           │
                    │                                     │
                    │  /prices          → metadatos sala  │
                    │  /schedules/month → disponibilidad  │
                    │  /schedules       → horarios/slots  │
                    │  /games           → listado salas   │
                    └─────────────────────────────────────┘
```

El widget es un **único archivo HTML estático** sin dependencias de build. Se comunica directamente con la API de ERD Panel usando `fetch()` con CORS abierto (`access-control-allow-origin: *`), por lo que puede ser embebido en cualquier web sin backend propio.

---

## 2. API de ERD Panel — Endpoints completos

**Base URL:** `https://erdpanel.com/api`  
**Método:** `POST` en todos los endpoints  
**Content-Type:** `application/json`  
**CORS:** Abierto (`*`) — llamadas válidas desde el navegador

### 2.1 `/prices` — Metadatos de una sala

```http
POST https://erdpanel.com/api/prices
Content-Type: application/json

{
  "token": "1boIAa1xCJAlc30Q",
  "game": 221
}
```

> ⚠️ **`game` debe ser un entero** (no array). Es el único endpoint que acepta integer.

**Respuesta:**
```json
{
  "game": {
    "id": 221,
    "name": "El Invernadero (Barcelona)",
    "capacity": "4 a 10",
    "pay": 30,
    "type_pay": 1,
    "duration": 70,
    "last_minute_text": "Llama al 617 554 261...",
    "way_pay": ["REDSYS"],
    "start_date": "2021-06-09",
    "age": "12",
    "genre": "Royal Escape",
    "background_url": "https://www.residentriddle.es/barcelona/wp-content/...",
    "background_opacity": ".4",
    "legal_text": "<p>RESIDENT RIDDLE S.L.:...</p>",
    "block_hours_before": 0,
    "block_hours_after": 0,
    "last_minute": 0,
    "active": 1,
    "schedule_auto": 0
  }
}
```

---

### 2.2 `/schedules/month` — Disponibilidad mensual del calendario

```http
POST https://erdpanel.com/api/schedules/month
Content-Type: application/json

{
  "token": "1boIAa1xCJAlc30Q",
  "game": [221],
  "date": "2026-04-01"
}
```

> ⚠️ **`game` debe ser un array** aunque sea un solo ID. Un entero suelto devuelve `Server Error 500`.  
> `date` puede ser cualquier día del mes — la API devuelve todo el mes.

**Respuesta:** Array plano de strings, uno por cada día del mes (posición 0 = día 1):

```json
[
  "available",
  "available",
  "complete",
  "free",
  "available",
  "complete",
  "free",
  ...
]
```

**Valores posibles por día:**

| Valor | Significado | Color en calendario |
|-------|-------------|---------------------|
| `"available"` | Hay huecos libres | Punto dorado (●) |
| `"complete"` | Todos los slots ocupados | Punto rojo oscuro (●) |
| `"free"` | Sin sesiones programadas | Sin punto, gris |

---

### 2.3 `/schedules` — Slots/horarios de un día concreto

```http
POST https://erdpanel.com/api/schedules
Content-Type: application/json

{
  "token": "1boIAa1xCJAlc30Q",
  "game": [221],
  "date": "2026-04-15"
}
```

> ⚠️ **`game` debe ser un array**. La respuesta es siempre `[[...slots_del_game...]]`.  
> Si pasas `[221, 222]`, la respuesta es `[[slots_221], [slots_222]]`.

**Respuesta con un solo game `[221]`:**
```json
[
  [
    {
      "variation": 0,
      "date": "2026/04/15",
      "format_date": "15/04/2026",
      "time": "10:00",
      "tariff": null,
      "game_id": 221,
      "game_name": "El Invernadero (Barcelona)",
      "last_minute_text": "Llama al 617 554 261...",
      "status": 0,
      "way_pay": ["REDSYS"],
      "start_date": "2021-06-09",
      "age": "12",
      "genre": "Royal Escape",
      "duration": 70,
      "background_url": "https://www.residentriddle.es/.../1.jpeg",
      "background_opacity": ".4",
      "event": 0,
      "capacity": "4 a 10",
      "event_full_capacity": 0,
      "event_capacity": "4 a 10",
      "event_private": 0,
      "event_private_price": 0,
      "schedule_auto": 0
    },
    { "time": "12:00", "status": 0, ... },
    { "time": "14:00", "status": 1, ... }
  ]
]
```

**Valores de `status` en slots:**

| Valor | Significado | Apariencia |
|-------|-------------|------------|
| `0` | Disponible | Verde / Normal |
| `1` | Últimas plazas | Borde ámbar |
| `2` | Bloqueado por admin | Opaco, deshabilitado |
| `3` | Completo / lleno | Opaco, deshabilitado |

---

### 2.4 `/games` — Listado de salas por token

```http
POST https://erdpanel.com/api/games
Content-Type: application/json

{
  "token": "1boIAa1xCJAlc30Q",
  "games": [221, 222]
}
```

**Respuesta:**
```json
[
  { "id": 221, "name": "El Invernadero (Barcelona)", ... },
  { "id": 222, "name": "Randalls Party", ... }
]
```

Usado principalmente para **validar token + IDs** antes de guardar configuración en el panel.

---

## 3. Datos obtenidos de cada endpoint

### Mapa completo de campos utilizados

| Campo API | Endpoint | Uso en widget |
|-----------|----------|---------------|
| `game.name` | `/prices` | Nombre de la sala en la card y resumen |
| `game.background_url` | `/prices` | Imagen de fondo de la game card |
| `game.background_opacity` | `/prices` | Opacidad del overlay sobre la imagen |
| `game.capacity` | `/prices` | Texto "4 a 10 jugadores" en la card |
| `game.pay` | `/prices` | Precio base por persona (€) |
| `game.duration` | `/prices` | Duración en minutos |
| `game.genre` | `/prices` | Tag de género (ej: "Royal Escape") |
| `game.age` | `/prices` | Edad mínima (ej: "12") |
| `game.last_minute_text` | `/prices` | Aviso de reservas last-minute |
| `game.legal_text` | `/prices` | Texto RGPD / política de privacidad |
| Día `"available"/"complete"/"free"` | `/schedules/month` | Estado visual de cada día en el calendario |
| `slot.time` | `/schedules` | Hora del slot (ej: "10:00") |
| `slot.status` | `/schedules` | Estado del slot (0=libre, 1=últimas, 2-3=bloqueado) |
| `slot.capacity` | `/schedules` | Capacidad del slot específico |
| `slot.duration` | `/schedules` | Duración (confirma o sobreescribe la de `/prices`) |
| `slot.last_minute_text` | `/schedules` | Texto específico del slot si difiere |

---

## 4. Calendario: un game vs varios games

### Un solo game (recomendado para widget de sala específica)

```javascript
// /schedules/month — pasar siempre como array de uno
const response = await fetch('https://erdpanel.com/api/schedules/month', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'TU_TOKEN',
    game: [221],          // ← array con un solo ID
    date: '2026-04-01'
  })
});
const data = await response.json();
// data = ["available", "complete", "free", ...]  — array plano, un string por día

// /schedules — obtener slots del día seleccionado
const slotsResponse = await fetch('https://erdpanel.com/api/schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'TU_TOKEN',
    game: [221],
    date: '2026-04-15'
  })
});
const slotsData = await slotsResponse.json();
// slotsData = [[{time:"10:00", status:0,...}, {time:"12:00",...}]]
const slots = slotsData[0];   // ← siempre tomar el índice 0
```

### Varios games (widget multi-sala / marketplace)

```javascript
// /schedules/month — disponibilidad combinada (el sistema devuelve vista unificada)
const monthData = await fetch('https://erdpanel.com/api/schedules/month', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'TU_TOKEN',
    game: [221, 222],     // ← múltiples IDs
    date: '2026-04-01'
  })
}).then(r => r.json());
// monthData = ["available", "complete", ...]  — vista combinada

// /schedules — slots por juego seleccionado
const allSlotsData = await fetch('https://erdpanel.com/api/schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'TU_TOKEN',
    game: [221, 222],
    date: '2026-04-15'
  })
}).then(r => r.json());
// allSlotsData = [[slots_221], [slots_222]]

// Extraer slots de un game concreto por su posición en el array enviado
const gameIds = [221, 222];
const selectedGameId = 221;
const gameIndex = gameIds.indexOf(selectedGameId);
const slots = allSlotsData[gameIndex];  // → slots_221
```

> **⚠️ Regla de oro:** Pasar el mismo array de IDs en el mismo orden tanto en `/schedules/month` como en `/schedules`. El índice de posición en la respuesta corresponde al índice del ID enviado.

### Tabla de diferencias

| Aspecto | Un solo game | Varios games |
|---------|-------------|--------------|
| `game` param | `[221]` | `[221, 222, 223]` |
| Respuesta `/month` | Array plano de strings | Array plano combinado |
| Respuesta `/schedules` | `[[slots]]` → tomar `[0]` | `[[slots_221],[slots_222],...]` |
| Extracción de slots | `data[0]` | `data[gameIds.indexOf(selectedId)]` |
| Uso ideal | Widget embebido en página de sala | Marketplace / panel multi-sala |

---

## 5. Obtener solo la imagen de una sala

La imagen de cada sala se obtiene del campo `background_url` en `/prices`:

```javascript
async function getRoomImage(token, gameId) {
  const response = await fetch('https://erdpanel.com/api/prices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, game: gameId })  // gameId como integer
  });
  const data = await response.json();
  return {
    url: data.game.background_url,
    opacity: parseFloat(data.game.background_opacity) || 0.4,
    name: data.game.name
  };
}

// Uso:
const img = await getRoomImage('1boIAa1xCJAlc30Q', 221);
console.log(img.url);
// → "https://www.residentriddle.es/barcelona/wp-content/uploads/sites/2/2023/10/1.jpeg"

// Usarla como fondo CSS:
element.style.backgroundImage = `url('${img.url}')`;
element.style.backgroundSize = 'cover';
element.style.backgroundPosition = 'center';
```

### Obtener imágenes de múltiples salas en paralelo

```javascript
async function getAllRoomImages(token, gameIds) {
  const results = await Promise.allSettled(
    gameIds.map(id => getRoomImage(token, id))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

const images = await getAllRoomImages('TU_TOKEN', [221, 222, 223]);
// → [{ url, opacity, name }, { url, opacity, name }, ...]
```

> 💡 Las imágenes están en servidores de WordPress de cada empresa. Úsalas con `<img loading="lazy">` o como `background-image` en CSS. No hay endpoint dedicado solo para imágenes; siempre vienen dentro de `/prices`.

---

## 6. Sistema de estilos — Variables CSS

El widget usa un sistema de **CSS Custom Properties (variables)** organizado en tres capas:

### Capa 1: Tokens de tipografía y espaciado

```css
:root {
  /* ── Escala tipográfica fluida (clamp) ── */
  --text-xs:   clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
  --text-sm:   clamp(0.875rem, 0.8rem  + 0.35vw, 1rem);
  --text-base: clamp(1rem,     0.95rem + 0.25vw, 1.125rem);
  --text-lg:   clamp(1.125rem, 1rem    + 0.75vw, 1.5rem);
  --text-xl:   clamp(1.5rem,   1.2rem  + 1.25vw, 2.25rem);

  /* ── Espaciado (múltiplos de 0.25rem) ── */
  --sp1: 0.25rem;   /* 4px  */
  --sp2: 0.5rem;    /* 8px  */
  --sp3: 0.75rem;   /* 12px */
  --sp4: 1rem;      /* 16px */
  --sp5: 1.25rem;   /* 20px */
  --sp6: 1.5rem;    /* 24px */
  --sp8: 2rem;      /* 32px */
  --sp10: 2.5rem;   /* 40px */
  --sp12: 3rem;     /* 48px */

  /* ── Familias tipográficas ── */
  --fd: 'Cinzel', 'Georgia', serif;        /* Display / Títulos */
  --fb: 'Inter', 'Helvetica Neue', sans-serif; /* Body / UI */

  /* ── Border radius ── */
  --r-sm:   0.375rem;    /* 6px  - inputs pequeños */
  --r-md:   0.5rem;      /* 8px  - botones, inputs */
  --r-lg:   0.75rem;     /* 12px - cards */
  --r-xl:   1rem;        /* 16px - card principal */
  --r-full: 9999px;      /* Píldora/círculo */

  /* ── Transición global ── */
  --tr: 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Capa 2: Tokens de color (tema oscuro)

```css
[data-theme="dark"] {
  /* ── Fondos / Superficies ── */
  --bg:         #0c0b09;   /* Fondo general de la página */
  --sf:         #131210;   /* Card principal */
  --sf2:        #191714;   /* Inputs, slots, elementos internos */
  --sf3:        #1f1c18;   /* Hover de superficies */
  --sfo:        #282420;   /* Offset / seleccionado inactivo */

  /* ── Bordes y separadores ── */
  --bd:         #2a2620;   /* Borde general de cards/inputs */
  --dv:         #201d18;   /* Divisor entre paneles */

  /* ── Texto ── */
  --tx:         #e6ddd0;   /* Texto principal */
  --txm:        #857a6d;   /* Texto secundario/muted */
  --txf:        #46423c;   /* Texto muy tenue/placeholder */

  /* ── Color primario (ámbar dorado) ── */
  --pr:         #c8860a;   /* Color primario base */
  --prh:        #e09820;   /* Hover del primario */
  --pra:        #f0a830;   /* Active/focus del primario */
  --prg:        oklch(0.65 0.18 65 / 0.18);  /* Glow del primario */
  --prhl:       #281f0e;   /* Highlight background (primario muy tenue) */

  /* ── Colores funcionales ── */
  --dng:        #c0392b;   /* Peligro/error */
  --dngm:       #6b2020;   /* Peligro muted (puntos "completo" en calendario) */
  --suc:        #27a065;   /* Éxito */

  /* ── Sombras ── */
  --sh-sm: 0 1px 3px oklch(0 0 0 / 0.4);
  --sh-md: 0 4px 20px oklch(0 0 0 / 0.55);
  --sh-lg: 0 12px 48px oklch(0 0 0 / 0.7);
  --sh-gl: 0 0 28px var(--prg);    /* Glow del primario */
}
```

---

## 7. Guía de personalización visual completa

### 7.1 Cambiar la paleta de colores

Para cambiar el widget de tema oscuro ámbar a cualquier otro look, solo hay que sobreescribir las variables CSS. Ejemplos:

**Tema neón verde (cyberpunk):**
```css
[data-theme="dark"] {
  --bg:    #050a05;
  --sf:    #0a120a;
  --sf2:   #0f1a0f;
  --bd:    #1a2e1a;
  --tx:    #c8f5c8;
  --txm:   #6a9e6a;
  --txf:   #2d4a2d;
  --pr:    #00e676;
  --prh:   #33eb91;
  --prg:   oklch(0.75 0.2 145 / 0.18);
  --prhl:  #001a0a;
  --suc:   #00e676;
}
```

**Tema claro minimalista:**
```css
[data-theme="light"] {
  --bg:    #f8f7f5;
  --sf:    #ffffff;
  --sf2:   #f3f1ee;
  --sf3:   #ebe8e4;
  --sfo:   #e0dcd6;
  --bd:    #d4cfc8;
  --dv:    #e8e4df;
  --tx:    #1a1714;
  --txm:   #6b6460;
  --txf:   #a09890;
  --pr:    #b8720a;
  --prh:   #9a5e08;
  --prg:   oklch(0.55 0.15 65 / 0.15);
  --prhl:  #fef3e2;
  --sh-lg: 0 12px 48px oklch(0 0 0 / 0.12);
}
```

### 7.2 Cambiar las fuentes

Sustituir en el `<head>` el link de Google Fonts y actualizar las variables:

```html
<!-- Ejemplo: Playfair Display + Outfit -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300..700&display=swap" rel="stylesheet">
```

```css
:root {
  --fd: 'Playfair Display', 'Georgia', serif;
  --fb: 'Outfit', 'Helvetica Neue', sans-serif;
}
```

### 7.3 Cambiar los border-radius (redondez)

```css
:root {
  /* Estilo muy redondeado (moderno/amigable) */
  --r-sm:   0.5rem;
  --r-md:   0.875rem;
  --r-lg:   1.25rem;
  --r-xl:   1.75rem;

  /* Estilo cuadrado (corporativo/serio) */
  --r-sm:   0.125rem;
  --r-md:   0.25rem;
  --r-lg:   0.375rem;
  --r-xl:   0.5rem;
}
```

### 7.4 Ajustar el espaciado general

```css
:root {
  /* Versión compacta (widget pequeño) */
  --sp4: 0.75rem;
  --sp6: 1rem;
  --sp8: 1.5rem;

  /* Versión espaciosa (pantallas grandes) */
  --sp4: 1.25rem;
  --sp6: 2rem;
  --sp8: 2.5rem;
}
```

### 7.5 Componentes individuales editables

| Componente | Selectores CSS | Variables clave |
|------------|---------------|-----------------|
| Card principal | `.card` | `--sf`, `--bd`, `--r-xl`, `--sh-lg` |
| Game cards | `.gc`, `.gc.selected` | `--r-lg`, `--pr`, `--sh-gl` |
| Días del calendario | `.day.available`, `.day.selected` | `--pr`, `--prg`, `--r-md` |
| Slots de horario | `.slot`, `.slot.selected` | `--sf2`, `--pr`, `--r-md` |
| Botón primario | `.btn-pr` | `--pr`, `--prh`, `--prg` |
| Inputs del form | `.finput:focus` | `--pr`, `--r-md` |
| Topbar config | `.topbar` | `--sf`, `--bd`, `--r-lg` |
| Badge activo | `.topbar-badge` | `--pr` |
| Modal de config | `.modal` | `--sf`, `--bd`, `--r-xl` |

---

## 8. Implementación multi-sala (cientos de salas)

### 8.1 Modelo de widget embebido

Cada sala puede tener su propio widget con su configuración específica. El widget acepta atributos `data-*` para inicializarse:

```html
<!-- Sala específica embebida en su propia página -->
<script
  src="https://tudominio.com/widget/escapemaster.js"
  data-token="TOKEN_DE_LA_EMPRESA"
  data-games="221,222"
  data-title="Resident Riddle Barcelona"
  data-primary="#c8860a"
  data-bg="#0c0b09"
  data-font-display="Cinzel"
  data-font-body="Inter"
  data-radius="0.75rem"
></script>
```

### 8.2 Widget como Web Component

La implementación ideal para escalar a cientos de salas es encapsular el widget como un **Custom Element**:

```javascript
// escapemaster-widget.js
class EscapeMasterWidget extends HTMLElement {
  static get observedAttributes() {
    return ['token', 'games', 'primary', 'bg', 'title'];
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    const token   = this.getAttribute('token');
    const games   = this.getAttribute('games').split(',').map(Number);
    const primary = this.getAttribute('primary') || '#c8860a';
    const bg      = this.getAttribute('bg')      || '#0c0b09';
    const title   = this.getAttribute('title')   || 'EscapeMaster';

    shadow.innerHTML = buildWidgetHTML({ token, games, primary, bg, title });
    initWidget(shadow, { token, games, primary, bg, title });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.connectedCallback(); // re-renderiza
  }
}

customElements.define('escapemaster-widget', EscapeMasterWidget);
```

```html
<!-- En cualquier página del cliente -->
<escapemaster-widget
  token="1boIAa1xCJAlc30Q"
  games="221,222"
  primary="#c8860a"
  title="Mi Escape Room"
></escapemaster-widget>
```

### 8.3 Configuración por sala en JSON

Cada sala en EscapeMaster almacena su configuración de widget:

```json
{
  "room_id": "sala-bcn-001",
  "name": "Resident Riddle Barcelona",
  "erd_token": "1boIAa1xCJAlc30Q",
  "erd_game_ids": [221, 222],
  "widget_config": {
    "theme": {
      "primary": "#c8860a",
      "bg": "#0c0b09",
      "surface": "#131210",
      "border": "#2a2620",
      "text": "#e6ddd0",
      "text_muted": "#857a6d",
      "danger": "#c0392b",
      "success": "#27a065"
    },
    "typography": {
      "font_display": "Cinzel",
      "font_body": "Inter",
      "size_scale": "default"
    },
    "layout": {
      "border_radius": "0.75rem",
      "max_width": "860px",
      "spacing": "default"
    },
    "branding": {
      "title": "Resident Riddle Barcelona",
      "subtitle": "Reservas online",
      "logo_url": null
    }
  }
}
```

---

## 9. Panel de administración — Diseño propuesto

### 9.1 Secciones del panel para cada sala

```
┌─────────────────────────────────────────────────────────────────┐
│  PANEL DE ADMIN — EscapeMaster                                  │
├──────────────┬──────────────────────────────────────────────────┤
│              │  Sala: Resident Riddle Barcelona                  │
│  📋 Salas    │  Token ERD: 1boIA••••30Q  [Editar]               │
│  🎨 Temas    │  Game IDs: 221, 222       [Gestionar]            │
│  🔑 Tokens   │                                                   │
│  📊 Stats    │  ┌──── EDITOR DE TEMA ──────────────────────┐    │
│  ⚙️ Config   │  │                                           │    │
│              │  │  Colores principales                      │    │
│              │  │  ┌─────────────┐ ┌──────────────────┐    │    │
│              │  │  │ Primario    │ │ Fondo            │    │    │
│              │  │  │ ████ #c8860a│ │ ████ #0c0b09    │    │    │
│              │  │  └─────────────┘ └──────────────────┘    │    │
│              │  │                                           │    │
│              │  │  Tipografía                               │    │
│              │  │  Display: [Cinzel        ▼]               │    │
│              │  │  Body:    [Inter         ▼]               │    │
│              │  │                                           │    │
│              │  │  Redondez de bordes                       │    │
│              │  │  ○ Cuadrado  ● Normal  ○ Redondeado       │    │
│              │  │                                           │    │
│              │  │  [Vista previa]    [Guardar cambios]      │    │
│              │  └───────────────────────────────────────────┘    │
└──────────────┴──────────────────────────────────────────────────┘
```

### 9.2 Campos del editor de tema (admin)

```typescript
interface WidgetThemeConfig {
  // Colores
  primary:      string;   // Color de acento (hex)
  primaryHover: string;   // Hover del acento
  bg:           string;   // Fondo de la página
  surface:      string;   // Card principal
  surface2:     string;   // Superficies internas
  border:       string;   // Bordes
  text:         string;   // Texto principal
  textMuted:    string;   // Texto secundario
  textFaint:    string;   // Placeholders

  // Tipografía
  fontDisplay:  string;   // Fuente de títulos
  fontBody:     string;   // Fuente de UI

  // Formas
  radiusSm:     string;   // Border-radius pequeño
  radiusMd:     string;   // Border-radius medio
  radiusLg:     string;   // Border-radius grande
  radiusXl:     string;   // Border-radius card

  // Layout
  maxWidth:     string;   // Ancho máximo del widget
}
```

### 9.3 Generador de CSS desde el panel

El backend transforma la configuración JSON a variables CSS inline:

```javascript
// Backend: genera el bloque <style> personalizado
function generateWidgetCSS(config) {
  return `
    <style id="em-theme">
      :root {
        --pr:   ${config.primary};
        --prh:  ${config.primaryHover};
        --bg:   ${config.bg};
        --sf:   ${config.surface};
        --sf2:  ${config.surface2};
        --bd:   ${config.border};
        --tx:   ${config.text};
        --txm:  ${config.textMuted};
        --txf:  ${config.textFaint};
        --fd:   '${config.fontDisplay}', Georgia, serif;
        --fb:   '${config.fontBody}', sans-serif;
        --r-sm: ${config.radiusSm};
        --r-md: ${config.radiusMd};
        --r-lg: ${config.radiusLg};
        --r-xl: ${config.radiusXl};
      }
    </style>
  `;
}
```

---

## 10. Esquema de base de datos sugerido

```sql
-- Empresas / clientes de EscapeMaster
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  erd_token   TEXT NOT NULL,              -- Token de ERD Panel
  plan        TEXT DEFAULT 'free',        -- free | starter | pro
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Salas individuales
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID REFERENCES companies(id),
  erd_game_id INTEGER NOT NULL,           -- ID de ERD Panel
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  active      BOOLEAN DEFAULT true,
  UNIQUE(company_id, erd_game_id)
);

-- Configuración visual del widget por sala
CREATE TABLE widget_configs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       UUID REFERENCES rooms(id) UNIQUE,
  primary_color TEXT DEFAULT '#c8860a',
  bg_color      TEXT DEFAULT '#0c0b09',
  surface_color TEXT DEFAULT '#131210',
  border_color  TEXT DEFAULT '#2a2620',
  text_color    TEXT DEFAULT '#e6ddd0',
  text_muted    TEXT DEFAULT '#857a6d',
  font_display  TEXT DEFAULT 'Cinzel',
  font_body     TEXT DEFAULT 'Inter',
  radius_sm     TEXT DEFAULT '0.375rem',
  radius_md     TEXT DEFAULT '0.5rem',
  radius_lg     TEXT DEFAULT '0.75rem',
  radius_xl     TEXT DEFAULT '1rem',
  max_width     TEXT DEFAULT '860px',
  title         TEXT,
  subtitle      TEXT DEFAULT 'Reservas online',
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Caché de metadatos de sala (evita llamadas repetidas a ERD)
CREATE TABLE room_meta_cache (
  room_id        UUID REFERENCES rooms(id) PRIMARY KEY,
  background_url TEXT,
  capacity       TEXT,
  duration       INTEGER,
  price          NUMERIC,
  genre          TEXT,
  age            TEXT,
  last_minute    TEXT,
  legal_text     TEXT,
  cached_at      TIMESTAMPTZ DEFAULT now()
);
```

---

## 11. API REST interna de EscapeMaster

Para que el panel de admin pueda actualizar la configuración del widget en tiempo real:

### `GET /api/rooms/:roomId/widget-config`

```json
{
  "token": "TU_TOKEN_ESCAPEMASTER",
  "room_id": "uuid-de-la-sala",
  "config": {
    "primary_color": "#c8860a",
    "font_display": "Cinzel",
    "radius_lg": "0.75rem",
    ...
  }
}
```

### `PATCH /api/rooms/:roomId/widget-config`

```json
{
  "primary_color": "#00e676",
  "font_display": "Playfair Display",
  "bg_color": "#050a05"
}
```

### `POST /api/rooms/:roomId/validate-erd`

Valida el token + game IDs contra la API de ERD:

```json
{
  "erd_token": "1boIAa1xCJAlc30Q",
  "erd_game_ids": [221, 222]
}
```

**Respuesta:**
```json
{
  "valid": true,
  "games": [
    { "id": 221, "name": "El Invernadero (Barcelona)" },
    { "id": 222, "name": "Randalls Party" }
  ]
}
```

### `GET /api/rooms/:roomId/embed-code`

Devuelve el snippet HTML listo para copiar y pegar en cualquier web:

```json
{
  "embed_html": "<script src=\"https://widget.escapemaster.io/v1/em.js\" data-room=\"uuid\" async></script>",
  "iframe_url": "https://widget.escapemaster.io/embed/uuid",
  "direct_url": "https://widget.escapemaster.io/sala/resident-riddle-barcelona"
}
```

---

## 12. Embed del widget por sala

### Método 1: Script tag (recomendado)

```html
<script
  src="https://widget.escapemaster.io/v1/em.js"
  data-room="uuid-de-la-sala"
  async
></script>
```

El script inyecta automáticamente el widget con todos los estilos personalizados cargados desde la API de EscapeMaster.

### Método 2: iFrame (máximo aislamiento)

```html
<iframe
  src="https://widget.escapemaster.io/embed/uuid-de-la-sala"
  width="100%"
  height="700px"
  frameborder="0"
  allow="payment"
  loading="lazy"
></iframe>
```

### Método 3: HTML estático generado (actual)

Descargar el `booking-widget.html` ya configurado desde el panel:

```
Panel Admin → Sala → Widget → Descargar HTML → subir al servidor del cliente
```

---

## 13. Referencia rápida de variables CSS

| Variable | Descripción | Default |
|----------|-------------|---------|
| `--pr` | Color primario / acento | `#c8860a` |
| `--prh` | Primario hover | `#e09820` |
| `--pra` | Primario active | `#f0a830` |
| `--prg` | Primario glow (sombra) | `oklch(0.65 0.18 65 / 0.18)` |
| `--prhl` | Primario highlight bg | `#281f0e` |
| `--bg` | Fondo página | `#0c0b09` |
| `--sf` | Card / superficie | `#131210` |
| `--sf2` | Superficie interna | `#191714` |
| `--sf3` | Superficie hover | `#1f1c18` |
| `--sfo` | Superficie offset | `#282420` |
| `--bd` | Borde general | `#2a2620` |
| `--dv` | Divisor entre paneles | `#201d18` |
| `--tx` | Texto principal | `#e6ddd0` |
| `--txm` | Texto muted | `#857a6d` |
| `--txf` | Texto faint | `#46423c` |
| `--dng` | Error / peligro | `#c0392b` |
| `--dngm` | Error muted | `#6b2020` |
| `--suc` | Éxito | `#27a065` |
| `--fd` | Fuente display | `'Cinzel', serif` |
| `--fb` | Fuente body | `'Inter', sans-serif` |
| `--r-sm` | Radius pequeño | `0.375rem` |
| `--r-md` | Radius medio | `0.5rem` |
| `--r-lg` | Radius grande | `0.75rem` |
| `--r-xl` | Radius XL (card) | `1rem` |
| `--r-full` | Radius píldora | `9999px` |
| `--tr` | Transición global | `180ms cubic-bezier(...)` |
| `--sh-sm` | Sombra pequeña | `0 1px 3px ...` |
| `--sh-md` | Sombra media | `0 4px 20px ...` |
| `--sh-lg` | Sombra grande | `0 12px 48px ...` |
| `--sh-gl` | Sombra glow | `0 0 28px var(--prg)` |
| `--text-xs` | Tamaño fuente XS | `clamp(0.75rem, ...)` |
| `--text-sm` | Tamaño fuente SM | `clamp(0.875rem, ...)` |
| `--text-base` | Tamaño fuente base | `clamp(1rem, ...)` |
| `--text-lg` | Tamaño fuente LG | `clamp(1.125rem, ...)` |
| `--text-xl` | Tamaño fuente XL | `clamp(1.5rem, ...)` |

---

*Documentación generada para EscapeMaster Platform · 2026*  
*Para soporte técnico, consultar el repositorio interno de EscapeMaster.*
