# Project Setup Guide - TECHEM Portail Client

Ce guide explique comment lancer le projet en local, soit en mode classique, soit via la production Docker.

---

## 1. Cloner le dépôt

```bash
git clone https://gitlab-prod.eu.techem.corp/france/portal/portail-client-2.0.git
cd portail-client-2.0
dos2unix docker-production-starter.sh (si besoin au premier lanch si error, sudo apt install dos2unix)
dos2unix dockerless-production-starter.sh (si besoin au premier lanch si error, sudo apt install dos2unix)
```

---

## 2. Lancer la production Docker (recommandé pour la branche `production`)

Lancer le projet avec Docker, voici les grandes étapes.

### 2.1. Lancer la production Docker

Depuis la racine du projet :

```bash
git checkout production
./docker-production-starter.sh
```

Le script va :

- Copier `env.production.example` vers `.env` si `.env` n’existe pas encore
- Construire les conteneurs **sans cache** :
  ```bash
  docker compose build --no-cache
  ```
- Démarrer les conteneurs en arrière-plan :
  ```bash
  docker compose up -d
  ```

Par défaut, les services seront disponibles sur :

- Nginx frontal: http://base_url:80
- Frontend SSR: http://base_url (via Nginx)
- Backend API: http://base_url/api

Ajuster les ports via les variables `NEXT_PUBLIC_API_BASE_URL` et `NEXT_PUBLIC_APP_URL` dans les fichiers `.env` et `docker-compose.production.yml`.

### 2.2. Stopper la production Docker

```bash
./docker-production-stop.sh
```
---