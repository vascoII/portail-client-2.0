
#!/usr/bin/env bash

set -euo pipefail

echo "=== TECHEM Portail Client - Sandbox bootstrap ==="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# --- Backend env ---
ENV_BACKEND="./backend/.env"
ENV_BACKEND_EXAMPLE="./backend/.env.sandbox.example"

if [ ! -f "$ENV_BACKEND_EXAMPLE" ]; then
  echo "Erreur: fichier $ENV_BACKEND_EXAMPLE introuvable."
  echo "Veuillez créer un fichier backend/.env.sandbox.example."
  exit 1
fi

if [ -f "$ENV_BACKEND" ]; then
  echo "Backend: fichier .env déjà présent, aucune copie depuis .env.sandbox.example."
else
  echo "Backend: copie de $ENV_BACKEND_EXAMPLE vers $ENV_BACKEND..."
  cp "$ENV_BACKEND_EXAMPLE" "$ENV_BACKEND"
fi

# --- Frontend env ---
ENV_FRONTEND="./frontend/.env.local"
ENV_FRONTEND_EXAMPLE="./frontend/.env.local.sandbox.example"

if [ -f "$ENV_FRONTEND" ]; then
  echo "Frontend: fichier .env.local déjà présent, aucune copie depuis .env.local.sandbox.example."
else
  if [ -f "$ENV_FRONTEND_EXAMPLE" ]; then
    echo "Frontend: copie de $ENV_FRONTEND_EXAMPLE vers $ENV_FRONTEND..."
    cp "$ENV_FRONTEND_EXAMPLE" "$ENV_FRONTEND"
  else
    echo "Frontend: fichier $ENV_FRONTEND_EXAMPLE introuvable, copie ignorée."
  fi
fi

# --- Build & Up ---
echo "Construction des conteneurs Docker (sans cache)..."
docker compose build --no-cache

echo "Démarrage des conteneurs en arrière-plan..."
docker compose up -d

# --- Backend: composer install DANS le conteneur ---
echo "Installation conditionnelle des dépendances PHP (composer install dans le conteneur)..."

# On teste dans le conteneur (pas sur le host)
if ! docker compose exec -T backend sh -lc '[ -f /var/www/backend/vendor/autoload.php ]'; then
  echo "Vendor absent ou incomplet dans le conteneur: exécution de composer install..."

  docker compose run --rm backend sh -lc 'composer install --no-interaction --prefer-dist'

  docker compose exec -T backend sh -lc '
    if id www-data >/dev/null 2>&1; then
      chown -R www-data:www-data /var/www/backend/vendor || true
    else
      chown -R 1000:1000 /var/www/backend/vendor || true
    fi
  '

  # Re-test
  if docker compose exec -T backend sh -lc '[ -f /var/www/backend/vendor/autoload.php ]'; then
    echo "Composer install réussi: vendor présent."
  else
    echo "Erreur: vendor toujours absent après composer install." >&2
    exit 1
  fi
else
  echo "Vendor déjà présent dans le conteneur (autoload.php OK)."
fi

echo "Sandbox démarrée."
echo "- Backend:   http://localhost:${BACKEND_PORT:-8000}"
echo "- Frontend:  http://localhost:${FRONTEND_PORT:-3000}"


