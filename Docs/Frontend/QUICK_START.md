# 🚀 Guide de Démarrage Rapide

## Prérequis

1. ✅ Backend Symfony démarré sur `http://localhost:8000`
2. ✅ Node.js 18+ installé
3. ✅ npm ou yarn installé

---

## Installation

```bash
# 1. Aller dans le dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Créer le fichier .env.local (si pas déjà fait)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

---

## Démarrage

```bash
# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

---

## Test Rapide

### 1. Vérifier que tout fonctionne

```bash
# Exécuter le script de test
./test-setup.sh
```

### 2. Tester la connexion

1. Ouvrir `http://localhost:3000/signin` dans votre navigateur
2. Saisir vos identifiants
3. Cliquer sur "Sign in"
4. Vérifier la redirection vers le dashboard

---

## Structure du Projet

```
frontend/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (admin)/           # Routes admin
│   │   ├── (full-width-pages)/ # Routes full-width (auth, errors)
│   │   ├── layout.tsx         # Layout racine
│   │   └── providers.tsx      # Providers (React Query)
│   ├── components/            # Composants React
│   │   ├── auth/             # Composants d'authentification
│   │   ├── form/             # Composants de formulaire
│   │   └── ui/               # Composants UI de base
│   ├── lib/
│   │   ├── api/              # Client API (Axios)
│   │   ├── hooks/            # Custom hooks (useAuth)
│   │   ├── store/            # Stores Zustand (authStore)
│   │   ├── types/            # Types TypeScript
│   │   └── utils/            # Utilitaires
│   ├── middleware.ts         # Middleware Next.js (auth)
│   └── context/              # Contextes React
├── public/                   # Fichiers statiques
├── .env.local               # Variables d'environnement
├── package.json             # Dépendances
└── next.config.ts           # Configuration Next.js
```

---

## Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur de développement

# Build
npm run build            # Construire pour la production
npm run start            # Démarrer le serveur de production

# Qualité
npm run lint             # Vérifier le code avec ESLint

# Tests
./test-setup.sh          # Script de test rapide
```

---

## Configuration

### Variables d'environnement (.env.local)

```env
# URL de l'API Symfony
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# URL de l'application frontend
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Configuration CORS (Backend)

Assurez-vous que le backend Symfony accepte les requêtes depuis `http://localhost:3000`.

---

## Problèmes Courants

### 1. Erreur CORS

**Solution** : Vérifier la configuration CORS dans Symfony

### 2. Cookie PHPSESSID non envoyé

**Solution** : Vérifier que `withCredentials: true` est configuré dans `src/lib/api/client.ts`

### 3. Erreur de build

**Solution** :
```bash
npm run build
# Corriger les erreurs affichées
```

---

## Documentation

- 📖 [Guide de Test Complet](./TESTING_GUIDE.md)
- 📖 [Documentation API](../API_DOCUMENTATION.md)
- 📖 [Stratégie de Migration](../FRONTEND_MIGRATION_STRATEGY.md)

---

**Bon développement ! 🎉**

