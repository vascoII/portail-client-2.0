# Project Setup Guide - TECHEM Portail Client

Ce guide explique comment lancer le projet en local, soit en mode classique, soit via la preview Docker.

---

## 1. Cloner le dépôt

```bash
git clone https://gitlab-prod.eu.techem.corp/france/portal/portail-client-2.0.git
cd portail-client-2.0
dos2unix docker-preview-starter.sh (si besoin au premier lanch si error, sudo apt install dos2unix)
dos2unix dockerless-preview-starter.sh (si besoin au premier lanch si error, sudo apt install dos2unix)
```

---

## 2. Lancer la preview Docker (recommandé pour la branche `preview`)

Lancer le projet avec Docker, voici les grandes étapes.

### 2.1. Lancer la preview Docker

Depuis la racine du projet :

```bash
git checkout preview
./docker-preview-starter.sh
```

Le script va :

- Copier `env.preview.example` vers `.env` si `.env` n’existe pas encore
- Construire les conteneurs **sans cache** :
  ```bash
  docker compose build --no-cache
  ```
- Démarrer les conteneurs en arrière-plan :
  ```bash
  docker compose up -d
  ```

Par défaut, les services seront disponibles sur :

- Backend : `http://localhost:${BACKEND_PORT:-8000}`
- Frontend : `http://localhost:${FRONTEND_PORT:-3000}`

Ajuster les ports via les variables `BACKEND_PORT` et `FRONTEND_PORT` dans le fichier `.env`.

### 2.2. Stopper la preview Docker

```bash
./docker-preview-stop.sh
```
---

## 3. Installation manuelle (sans Docker) – optionnel

Lancer le projet sans Docker, voici les grandes étapes.

### 3.1. Configuration d’environnement

Copier le fichier d’exemple et ajuster les valeurs :

```bash
cp .env.preview.example .env
```

### 3.2. Lancer la preview DockerLess

```bash
./dockerless-preview-starter.sh
```

L’application backend sera disponible par défaut sur `https://localhost:3000`.

### 3.3. Stopper la preview DockerLess

```bash
./dockerless-preview-stop.sh
```

Les ports 8000 et 3000 seront libérés
