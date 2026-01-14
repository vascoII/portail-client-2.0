
#!/usr/bin/env bash
set -euo pipefail

echo "=== TECHEM Portail Client - Preview bootstrap ==="
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Backend env
ENV_BACKEND="./backend/.env"
ENV_BACKEND_EXAMPLE="./backend/.env.preview.example"
if [ ! -f "$ENV_BACKEND_EXAMPLE" ]; then
  echo "Erreur: fichier $ENV_BACKEND_EXAMPLE introuvable."
  exit 1
fi
if [ ! -f "$ENV_BACKEND" ]; then
  echo "Backend: copie .env.preview.example -> .env"
  cp "$ENV_BACKEND_EXAMPLE" "$ENV_BACKEND"
else
  echo "Backend: .env déjà présent (ok)."
fi

# Frontend env
ENV_FRONTEND="./frontend/.env.local"
ENV_FRONTEND_EXAMPLE="./frontend/.env.local.preview.example"
if [ -f "$ENV_FRONTEND" ]; then
  echo "Frontend: .env.local déjà présent (ok)."
else
  if [ -f "$ENV_FRONTEND_EXAMPLE" ]; then
    echo "Frontend: copie .env.local.preview.example -> .env.local"
    cp "$ENV_FRONTEND_EXAMPLE" "$ENV_FRONTEND"
  else
    echo "Frontend: fichier $ENV_FRONTEND_EXAMPLE introuvable (on continue)."
  fi
fi

echo "Construction des images preview (multi-stage, sans cache)..."
docker compose -f docker-compose.preview.yml build --no-cache

echo "Démarrage des services preview..."
docker compose -f docker-compose.preview.yml up -d

echo "Preview démarrée."
echo "- Nginx frontal: http://localhost:80"
echo "- Frontend SSR: http://localhost (via Nginx)"
echo "- Backend API: http://localhost/api"
``
