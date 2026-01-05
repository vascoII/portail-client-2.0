#!/bin/bash

# Arrêter le script si une commande échoue
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Backend env
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

echo "📦 Installation des dépendances Symfony..."
cd backend
composer install

echo "📂 Copie du dossier techemcore vers /public/bundles..."
mkdir -p public/bundles
cp -r public/techemcore public/bundles/

echo "🚀 Démarrage du serveur backend sur le port 8000 en mode développement..."
php -S 127.0.0.1:8000 -t public &

cd ../

# Frontend env
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

echo "📦 Installation des dépendances frontend..."
cd frontend
npm install

echo "🧹 Suppression du cache Next.js (.next)..."
rm -rf .next

echo "🌐 Démarrage du serveur frontend sur le port 3000 en mode développement..."

npm run dev