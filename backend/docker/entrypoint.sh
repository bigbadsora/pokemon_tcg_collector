#!/usr/bin/env sh
set -e

mkdir -p /app/data

# Seed only if DB not present in the volume
if [ ! -f /app/data/app.db ]; then
  cp /app/seed/pokemon.db /app/data/app.db
  echo "[seed] Copied seed DB to /app/data/app.db"
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000
