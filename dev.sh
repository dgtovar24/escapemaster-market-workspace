#!/bin/bash
# Arranca todos los servicios en paralelo en modo desarrollo
echo "🚀 Iniciando EscapeMaster en modo DEVELOPMENT..."
echo "   API     → http://localhost:8000/v1"
echo "   Frontend → http://localhost:4321"
echo "   Master   → http://localhost:4322"
echo ""

(cd web/api && npm run dev) &
(cd web/frontend && npm run dev) &
(cd master && npm run dev) &
wait
