
### Multi-repo workspace: ALWAYS verify workdir before git operations (2026-06-29)
Type: gotcha

**Lesson**: En workspaces multi-repo como `marketplace/`, el root es un meta-repo git (solo con commits de harness/setup) y cada sub-repo (`web/frontend`, `web/api`, `master`, etc.) tiene su PROPIO git repo con historial independiente. La misma branch name (e.g. `fix/profile-ui-polish-A`) puede existir en ambos repos pero solo tener commits en uno.

**Síntoma de fallo**: Si los comandos `git log <branch> --oneline` muestran pocos commits, las refs devuelven `unknown revision`, y `git diff <branchA>..<branchB>` da vacío, **STOP** — probablemente estás operando en el meta-repo equivocado.

**Preflight obligatorio** antes de cualquier `git log/diff/show/rev-parse`:
```bash
git rev-parse --show-toplevel      # confirma en qué repo estoy
git remote -v                       # confirma a qué repo apunta
git worktree list                   # si hay worktrees múltiples
ls -la .git                         # sub-repo: tiene su propio .git; root-repo workdir mono: también. PERO si ves archivos del proyecto como "untracked" en git status, MAL.
```

**Regla práctica para escape-master / marketplaces multi-repo**: cuando el task toca un archivo en `web/frontend/...`, `web/api/...` o `master/...`, **siempre usa `workdir` explícito apuntando al sub-repo, NUNCA al root**.

**Origen**: hoy di un FAIL incorrecto sobre `fix/profile-ui-polish-A` porque corrí git en `/Users/dgtovar/Work/marketplace` en vez de `/Users/dgtovar/Work/marketplace/web/frontend`. El orchestrator tuvo que reproducir y corregirme en main. FAIL hubiera bloqueado un merge legítimo.
