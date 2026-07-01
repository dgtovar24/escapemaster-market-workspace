
### Floating/fixed UI artifact: investigar ANTES de fixear en source (2026-06-29)
Type: workflow

Cuando un usuario reporta un 'dock negro flotante', 'menú cortado a la mitad' o
cualquier elemento fixed/inset-x en una SPA/MPA en dev, ANTES de tocar código:

1. **Inspeccionar el DOM** con Playwright/Chrome devtools en la página en cuestión.
   `document.querySelector('astro-dev-toolbar')` (Astro), `document.querySelector('[data-vite-dev-overlay]')` (Vite), o variantes para tu framework.
2. Si devuelve un **custom element con shadow DOM** (`<element>.shadowRoot !== null`),
   es un overlay **auto-inyectado por el dev server**, no parte del proyecto.
3. **Verificar en build de producción**: `dist/` no debe contener ese elemento. Si no
   está, es dev-only.
4. **No 'arreglar' el código de la app** para esconder un dev toolbar. Si el dev toolbar
   molesta al usuario, recomendarle: (a) el toggle del propio toolbar, (b) `astro preview` /
   `vite preview` en lugar de dev, o (c) `devToolbar: { enabled: false }` en config (con
   consciencia de que pierdes la herramienta).

Caso real verificado 2026-06-29 en EscapeMaster web/frontend: el usuario reportó
'dock negro flotante cortado a la mitad' en /es/profile. El elemento era
`<astro-dev-toolbar>` con botones Menu/Inspect/Audit. Confirmado vía
`document.querySelector('astro-dev-toolbar').shadowRoot` → custom element válido.
`dist/` ya construido, sin rastro del toolbar. El branch del producer no necesitaba
ningún cambio; se documentó con captura en el deliverable.

### Tailwind `divide-x` con grid wrap: implementar hideOnMobile (2026-06-29)
Type: workflow

La clase `divide-x` de Tailwind añade bordes SOLO entre hermanos DOM adyacentes en
la misma fila. Si un grid tiene más hijos que columnas, los hijos sobrantes **wrap a
una segunda fila y pierden el divisor visual** entre ellos y la última celda de la
primera fila.

Síntoma típico:
```jsx
<div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-gray-200">
  {[{hideOnMobile:false}, {hideOnMobile:false}, {hideOnMobile:false},
    {hideOnMobile:true}, {hideOnMobile:true}].map(...)}
</div>
```
En mobile (3 cols): las 2 celdas con `hideOnMobile:true` harían wrap a fila 2 y
romperían el divisor entre la celda 2 y la celda 3.

**Fix recomendado (más limpio que `border-l first:border-l-0` por celda):**
```jsx
<div className={`p-3 sm:p-4 text-center ${stat.hideOnMobile ? 'hidden sm:block' : ''}`}>
```
Resultado: en mobile solo se renderizan las 3 celdas visibles (sin wrap, divisor
coherente). En sm+ se renderizan las 5 (1 fila de 5, divisor coherente).

**Alternativa con bordes explícitos** (si necesitas todas las celdas visibles
incluso en mobile):
```jsx
<div className="p-3 sm:p-4 text-center border-l first:border-l-0">
```
Útil cuando cada celda DEBE verse siempre, pero requiere controlar contraste en
los bordes verticales manualmente.

**Decisión recomendada:** elige el fix en función de si las celdas 'extras' son
accesorias (→ hide con `hidden sm:block`) o críticas (→ border explícito por
celda). Documenta la decisión con un comentario inline para que el próximo
mantenedor entienda el razonamiento.

### Orphaned git commits survive branch resets (2026-06-29)
Type: workflow

Cuando un commit "desaparece" de una rama (e.g., porque alguien hizo `git
reset` o recreó la rama desde otro punto), el commit **NO está perdido**
mientras no se haga `gc` (típicamente 30 días). Está en el object database
como "unreachable" pero accesible.

**Cómo encontrarlo**:
```bash
git log --all --oneline         # muestra commits en TODAS las refs (incl. orphan)
git reflog                      # historial de HEAD local — útil si lo commiteaste tú
git fsck --unreachable          # lista objects huérfanos (commits, trees, blobs)
```

**Cómo recuperarlo si aún no lo hizo gc**:
```bash
# Opción 1: cherry-pick del commit huérfano a tu rama actual
git cherry-pick <hash>

# Opción 2: reset duro de la rama al hash huérfano
git switch <branch>
git reset --hard <hash>
```

**Caso real** (2026-06-29 en EscapeMaster web/frontend): commiteé `759db78` en
`fix/profile-ui-polish-A`. Después alguien (otro producer?) reseteó la rama
a `main`. El verifier reportó "branches bit-identical" porque su `git diff
main..fix/profile-ui-polish-A` dio vacío — pero el commit seguía en
`git log --all`. Recupéré la rama con `git reset --hard 759db78` desde el
hash conocido y el worktree volvió al estado correcto sin re-editar nada.

**Cuándo NO aplica**: si ya pasó `gc` (default ~30 días para unreachable
objects), el commit se pierde de verdad. Configurar `gc.reflogExpireUnreachable`
si necesitas retención más larga para forensic/debugging.

**Pre-flight cuando un verifier reporta "tu commit no está"**:
1. `git log --all --oneline -20` — ¿está el hash?
2. Si sí → reset/cherry-pick en lugar de re-editar (preserva traceability).
3. Si no → sí re-edita, pero documenta el motivo en el deliverable.
