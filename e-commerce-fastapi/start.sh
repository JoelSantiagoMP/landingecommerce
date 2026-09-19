#!/usr/bin/env bash
# Arranque para Render / contenedor: crea tablas, seed idempotente y levanta la API.
set -euo pipefail

cd "$(dirname "$0")"

echo "[start] Inicializando base de datos y seed…"
python -m app.seed

echo "[start] Aplicando URLs de imágenes (Supabase)…"
python -m app.update_images

echo "[start] Levantando Uvicorn…"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
