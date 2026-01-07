#!/bin/bash

# Arrêter le script si une commande échoue
set -e

echo "📦 Installation des dépendances Symfony..."
cd backend
composer install


echo "📂 Copie du dossier techemcore vers /public/bundles..."
mkdir -p public/bundles
cp -r public/techemcore public/bundles/

echo "🚀 Démarrage du serveur backend sur le port 8000 en mode développement..."
php -S 127.0.0.1:8000 -t public &

echo "📦 Installation des dépendances frontend..."
cd ../frontend
npm install

echo "🧹 Suppression du cache Next.js (.next)..."
rm -rf .next

echo "🌐 Démarrage du serveur frontend sur le port 3000 en mode développement..."

npm run dev