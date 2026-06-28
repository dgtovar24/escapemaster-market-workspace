#!/bin/bash
# Arranca ambas apps simulando entorno de producción
echo "🔴 Iniciando EscapeMaster en modo PRODUCTION (local)..."
(cd web && npm run dev:prod) &
(cd master && npm run dev:prod) &
wait
