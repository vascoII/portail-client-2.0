# Guide de Setup du Frontend - Renommage et Configuration

## 📋 Vue d'ensemble

Ce guide explique comment renommer le dossier `portail-front-template` en `frontend` et le configurer pour l'utiliser comme base du nouveau frontend.

---

## ✅ Réponse rapide

**Oui, vous pouvez renommer `portail-front-template` en `frontend` et l'utiliser directement.**

C'est même recommandé pour avoir une structure claire :

```
customerportal/
├── src/              # Backend Symfony
├── templates/        # Templates Twig (ancien frontend)
├── frontend/         # Nouveau frontend Next.js (renommé)
└── ...
```

---

## 🔄 Étapes de renommage

### 1. Renommer le dossier

```bash
cd /customerportal
mv portail-front-template frontend
```

### 2. Mettre à jour le package.json

Le nom actuel est `"nextjs-admin"`. Il faut le changer :

```json
{
  "name": "techem-customer-portal-frontend",
  "version": "1.0.0",
  "private": true
  // ... reste identique
}
```

### 3. Vérifier les configurations

Les configurations suivantes utilisent des chemins relatifs, donc elles fonctionneront après le renommage :

- ✅ `tsconfig.json` : `"@/*": ["./src/*"]` (relatif)
- ✅ `next.config.ts` : Pas de chemins absolus
- ✅ `.gitignore` : Standard, pas de chemins spécifiques

### 4. Mettre à jour le workspace (optionnel)

Si vous utilisez le fichier `portail-front.code-workspace`, le renommer aussi :

```bash
cd frontend
mv portail-front.code-workspace frontend.code-workspace
```

---

## 📁 Structure recommandée

### Option A : Monorepo (Recommandé)

Garder le frontend dans le même dépôt que le backend :

```
customerportal/
├── src/                    # Backend Symfony
│   ├── Controller/
│   │   └── Api/           # API REST
│   └── ...
├── templates/              # Ancien frontend Twig (à garder temporairement)
├── frontend/               # Nouveau frontend Next.js
│   ├── src/
│   ├── package.json
│   └── ...
├── public/                 # Assets Symfony
├── composer.json           # Backend
└── README.md
```

**Avantages** :

- ✅ Un seul dépôt Git
- ✅ Partage de code/types possible
- ✅ Déploiement coordonné
- ✅ Historique unifié

**Inconvénients** :

- ⚠️ Taille du dépôt plus importante
- ⚠️ CI/CD plus complexe

### Option B : Dépôts séparés

Séparer le frontend dans un dépôt dédié :

```
customerportal/            # Backend
└── ...

customerportal-frontend/   # Frontend (nouveau dépôt)
└── ...
```

**Avantages** :

- ✅ Séparation claire
- ✅ CI/CD indépendants
- ✅ Déploiements indépendants

**Inconvénients** :

- ⚠️ Deux dépôts à gérer
- ⚠️ Partage de code plus complexe

**Recommandation** : **Option A (Monorepo)** pour commencer, plus simple à gérer.

---

## ⚙️ Configurations à adapter

### 1. Variables d'environnement

Créer `frontend/.env.local` :

```env
# URL de l'API Symfony
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# URL de l'application frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environnement
NODE_ENV=development
```

### 2. Next.js Configuration

Adapter `frontend/next.config.ts` si nécessaire :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Si l'API est sur un autre domaine en production
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
        }/:path*`,
      },
    ];
  },

  // Configuration existante
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
```

### 3. Gitignore

Vérifier que `frontend/.gitignore` est correct (déjà bon dans le template).

Ajouter dans le `.gitignore` racine si nécessaire :

```
# Frontend Next.js
/frontend/.next/
/frontend/out/
/frontend/node_modules/
/frontend/.env*.local
```

---

## 🚀 Commandes de démarrage

### Installation

```bash
cd frontend
npm install
```

### Développement

```bash
cd frontend
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
cd frontend
npm run build
npm start
```

---

## 🔗 Intégration avec le backend Symfony

### Configuration CORS (si nécessaire)

Si le frontend est sur un port différent (3000) et le backend sur un autre (8000), configurer CORS dans Symfony :

```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
  defaults:
    allow_credentials: true
    allow_origin: ["http://localhost:3000"]
    allow_headers: ["Content-Type", "Authorization"]
    allow_methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    max_age: 3600
```

### Proxy de développement (Alternative)

Au lieu de CORS, utiliser un proxy dans `next.config.ts` :

```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};
```

Ainsi, le frontend peut appeler `/api/...` et Next.js proxy vers Symfony.

---

## 📝 Checklist de setup

### Après le renommage

- [ ] Renommer le dossier `portail-front-template` → `frontend`
- [ ] Mettre à jour `package.json` (nom du projet)
- [ ] Créer `.env.local` avec les variables d'environnement
- [ ] Installer les dépendances : `npm install`
- [ ] Tester le démarrage : `npm run dev`
- [ ] Vérifier que l'application démarre sur `http://localhost:3000`

### Configuration initiale

- [ ] Installer les dépendances manquantes (React Query, etc.)
- [ ] Configurer React Query
- [ ] Créer le client API
- [ ] Configurer next-intl
- [ ] Adapter l'authentification
- [ ] Créer le middleware

### Git

- [ ] Vérifier que `.gitignore` ignore les bons fichiers
- [ ] Commiter les changements
- [ ] (Optionnel) Créer une branche `feature/frontend-migration`

---

## 🎯 Structure finale recommandée

```
customerportal/
├── .git/
├── .gitignore
├── README.md
│
├── src/                          # Backend Symfony
│   ├── Controller/
│   │   ├── Api/                 # API REST
│   │   └── ...                  # Controllers web (anciens)
│   ├── Service/
│   └── ...
│
├── templates/                    # Ancien frontend Twig
│   ├── Immeuble/
│   ├── Logement/
│   └── ...
│
├── frontend/                     # Nouveau frontend Next.js
│   ├── .env.local
│   ├── .gitignore
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   ├── public/
│   └── node_modules/
│
├── public/                       # Assets Symfony
├── config/                       # Configuration Symfony
├── composer.json
├── composer.lock
└── ...
```

---

## ⚠️ Points d'attention

### 1. Conflits de ports

- **Backend Symfony** : Généralement sur le port 8000
- **Frontend Next.js** : Par défaut sur le port 3000

Pas de conflit, mais vérifier que les deux ports sont libres.

### 2. Variables d'environnement

Le frontend utilise `NEXT_PUBLIC_*` pour les variables accessibles côté client.

Ne jamais mettre de secrets dans `NEXT_PUBLIC_*` (ils sont exposés au client).

### 3. Build et déploiement

Le frontend Next.js génère un build dans `frontend/.next/`.

Pour la production :

- Option A : Build statique (SSG)
- Option B : Serveur Node.js (SSR)
- Option C : Déploiement sur Vercel/Netlify

### 4. Assets statiques

Les assets du frontend vont dans `frontend/public/`.

Les assets Symfony restent dans `public/`.

---

## 🔄 Workflow de développement

### Développement local

1. **Terminal 1** : Backend Symfony

   ```bash
   cd /path/to/customerportal
   php -S localhost:8000 -t public
   # ou
   symfony server:start
   ```

2. **Terminal 2** : Frontend Next.js

   ```bash
   cd frontend
   npm run dev
   ```

3. Accéder à :
   - Frontend : `http://localhost:3000`
   - Backend API : `http://localhost:8000/api`
   - Backend Web (ancien) : `http://localhost:8000`

### Hot Reload

- ✅ Next.js : Hot reload automatique (modifications détectées)
- ✅ Symfony : Nécessite un refresh manuel (ou utiliser Symfony UX)

---

## 📦 Gestion des dépendances

### Frontend

```bash
cd frontend
npm install <package>
```

### Backend

```bash
# À la racine du projet
composer require <package>
```

Les deux sont indépendants.

---

## 🎨 Personnalisation du nom

### Changer le nom dans package.json

```json
{
  "name": "techem-customer-portal-frontend",
  "version": "1.0.0",
  "description": "Frontend Next.js pour le portail client Techem",
  "private": true
}
```

### Mettre à jour le README

Créer `frontend/README.md` :

```markdown
# Techem Portail Client - Frontend

Frontend Next.js pour le portail client Techem.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4

## Développement

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm start
\`\`\`
```

---

## ✅ Validation du setup

### Test 1 : Vérifier que Next.js démarre

```bash
cd frontend
npm run dev
```

✅ L'application doit démarrer sur `http://localhost:3000`

### Test 2 : Vérifier les imports

Créer un fichier de test `frontend/src/test.ts` :

```typescript
import Button from "@/components/ui/button/Button";

// Si pas d'erreur TypeScript, les alias fonctionnent
```

### Test 3 : Vérifier l'API

Créer une page de test `frontend/src/app/test-api/page.tsx` :

```typescript
"use client";

import { useEffect } from "react";

export default function TestApi() {
  useEffect(() => {
    fetch("/api/security/check", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => console.log("API Response:", data));
  }, []);

  return <div>Vérifier la console pour la réponse API</div>;
}
```

---

## 🚨 Résolution de problèmes

### Problème : Port déjà utilisé

```bash
# Changer le port Next.js
cd frontend
npm run dev -- -p 3001
```

Ou modifier `package.json` :

```json
{
  "scripts": {
    "dev": "next dev -p 3001"
  }
}
```

### Problème : Erreurs TypeScript

```bash
cd frontend
npm install --save-dev @types/node @types/react @types/react-dom
```

### Problème : Erreurs d'import

Vérifier `tsconfig.json` :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Problème : CORS

Configurer CORS dans Symfony (voir section "Intégration avec le backend").

---

## 📚 Prochaines étapes

Une fois le renommage effectué :

1. ✅ Suivre la **Phase 0** du document `FRONTEND_MIGRATION_STRATEGY_TAILADMIN.md`
2. ✅ Installer les dépendances manquantes
3. ✅ Configurer React Query
4. ✅ Créer le client API
5. ✅ Adapter l'authentification

---

## 🎯 Résumé

**Oui, vous pouvez renommer `portail-front-template` en `frontend`.**

**Actions à faire** :

1. `mv portail-front-template frontend`
2. Mettre à jour `package.json` (nom du projet)
3. Créer `.env.local`
4. `npm install`
5. `npm run dev`

**Structure recommandée** : Monorepo (frontend dans le même dépôt que le backend).

---

**Document créé le** : 2025-01-XX  
**Version** : 1.0
