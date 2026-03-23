# 🧪 Guide de Test - Frontend Techem Portail Client

## 📋 Prérequis

Avant de commencer les tests, assurez-vous que :

1. ✅ **Backend Symfony** est démarré et accessible sur `http://localhost:8000`
2. ✅ **Variables d'environnement** sont configurées dans `.env.local`
3. ✅ **Dépendances** sont installées (`npm install`)
4. ✅ **CORS** est configuré sur le backend pour accepter les requêtes depuis `http://localhost:3000`

---

## 🚀 Démarrage

### 1. Démarrer le serveur de développement

```bash
cd frontend
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

### 2. Vérifier les variables d'environnement

Assurez-vous que `.env.local` contient :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Checklist de Tests

### Phase 1 : Tests de Base

#### 1.1 Application démarre sans erreur

- [ ] Le serveur Next.js démarre sans erreur
- [ ] Aucune erreur dans la console du terminal
- [ ] Aucune erreur dans la console du navigateur (F12)
- [ ] La page d'accueil se charge correctement

**Commandes de vérification** :
```bash
# Vérifier les erreurs TypeScript
cd frontend
npm run build 2>&1 | grep -i error || echo "No TypeScript errors"

# Vérifier les erreurs ESLint
npm run lint 2>&1 | grep -i error || echo "No linting errors"
```

#### 1.2 Structure des fichiers

- [ ] Tous les fichiers nécessaires existent :
  - [ ] `src/lib/api/client.ts`
  - [ ] `src/lib/types/api.ts`
  - [ ] `src/lib/hooks/useAuth.ts`
  - [ ] `src/lib/store/authStore.ts`
  - [ ] `src/middleware.ts`
  - [ ] `src/app/providers.tsx`
  - [ ] `src/components/auth/SignInForm.tsx`

---

### Phase 2 : Tests d'Authentification

#### 2.1 Page de connexion

**URL** : `http://localhost:3000/signin`

- [ ] La page de connexion s'affiche correctement
- [ ] Le formulaire contient les champs :
  - [ ] Email/Username
  - [ ] Password
  - [ ] Checkbox "Keep me logged in"
  - [ ] Bouton "Sign in"
- [ ] Le bouton "Forgot password?" est présent
- [ ] Le lien "Sign Up" est présent

#### 2.2 Validation du formulaire

- [ ] **Test email invalide** :
  - Saisir un email invalide (ex: "test")
  - Soumettre le formulaire
  - Vérifier qu'un message d'erreur s'affiche : "Please enter a valid email address"

- [ ] **Test champ vide** :
  - Laisser les champs vides
  - Soumettre le formulaire
  - Vérifier que les messages d'erreur s'affichent

- [ ] **Test mot de passe trop court** :
  - Saisir un mot de passe de moins de 6 caractères
  - Vérifier qu'un message d'erreur s'affiche

#### 2.3 Connexion réussie

**Prérequis** : Avoir des identifiants valides pour le backend

- [ ] Saisir des identifiants valides
- [ ] Cliquer sur "Sign in"
- [ ] Vérifier que le bouton affiche "Signing in..." pendant le chargement
- [ ] Vérifier que la connexion réussit
- [ ] Vérifier la redirection :
  - [ ] Utilisateur avec `ROLE_OCCUPANT` → redirigé vers `/occupant`
  - [ ] Utilisateur avec `ROLE_GESTIONNAIRE` → redirigé vers `/dashboard`
  - [ ] Autres rôles → redirigé vers `/dashboard`

#### 2.4 Connexion échouée

- [ ] Saisir des identifiants invalides
- [ ] Soumettre le formulaire
- [ ] Vérifier qu'un message d'erreur s'affiche (Alert rouge)
- [ ] Vérifier que le message d'erreur est clair et compréhensible
- [ ] Vérifier que l'utilisateur reste sur la page de connexion

#### 2.5 Gestion de la session

- [ ] Après connexion réussie :
  - [ ] Vérifier que le cookie `PHPSESSID` est présent dans les cookies du navigateur
  - [ ] Vérifier que les données utilisateur sont stockées dans `localStorage` (clé `auth-storage`)
  - [ ] Rafraîchir la page
  - [ ] Vérifier que l'utilisateur reste connecté

#### 2.6 Middleware d'authentification

- [ ] **Test route protégée sans authentification** :
  - Se déconnecter (ou ouvrir une fenêtre privée)
  - Accéder à `http://localhost:3000/dashboard`
  - Vérifier la redirection vers `/signin?redirect=/dashboard`

- [ ] **Test route publique** :
  - Accéder à `http://localhost:3000/signin` sans être connecté
  - Vérifier que la page s'affiche normalement

- [ ] **Test redirection après connexion** :
  - Accéder à `http://localhost:3000/dashboard` (sans être connecté)
  - Se connecter
  - Vérifier la redirection vers `/dashboard` (et non `/signin`)

---

### Phase 3 : Tests API

#### 3.1 Test de l'endpoint de connexion

**Commande curl** :
```bash
curl -X POST http://localhost:8000/api/security/login \
  -H "Content-Type: application/json" \
  -d '{"username":"VOTRE_EMAIL","password":"VOTRE_MOT_DE_PASSE"}' \
  -c cookies.txt \
  -v
```

**Vérifications** :
- [ ] La requête retourne un statut `200` ou `401`
- [ ] Si succès, la réponse contient :
  ```json
  {
    "success": true,
    "data": {
      "user": {...},
      "roles": [...],
      "session_id": "..."
    }
  }
  ```
- [ ] Le cookie `PHPSESSID` est présent dans la réponse

#### 3.2 Test de l'endpoint de vérification

**Commande curl** (après connexion) :
```bash
curl -X GET http://localhost:8000/api/security/check \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Vérifications** :
- [ ] La requête retourne un statut `200`
- [ ] La réponse contient :
  ```json
  {
    "success": true,
    "data": {
      "authenticated": true,
      "user": {...},
      "roles": [...]
    }
  }
  ```

#### 3.3 Test de l'endpoint /api/me

**Commande curl** (après connexion) :
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

**Vérifications** :
- [ ] La requête retourne un statut `200`
- [ ] La réponse contient les informations utilisateur et l'URL du dashboard

#### 3.4 Test des intercepteurs Axios

- [ ] **Test erreur 401** :
  - Faire une requête API sans être authentifié
  - Vérifier que la redirection vers `/signin` se fait automatiquement

- [ ] **Test erreur 403** :
  - Faire une requête API avec un utilisateur sans les permissions
  - Vérifier qu'un message d'erreur approprié s'affiche

- [ ] **Test erreur réseau** :
  - Arrêter le serveur backend
  - Faire une requête API
  - Vérifier qu'un message d'erreur réseau s'affiche

---

### Phase 4 : Tests React Query

#### 4.1 DevTools React Query

- [ ] Ouvrir l'application dans le navigateur
- [ ] Vérifier que les React Query DevTools s'affichent (en bas à gauche)
- [ ] Vérifier que les queries sont visibles dans les DevTools

#### 4.2 Cache et refetch

- [ ] Faire une requête API
- [ ] Vérifier dans les DevTools que la query est mise en cache
- [ ] Rafraîchir la page
- [ ] Vérifier que les données sont récupérées depuis le cache (pas de nouvelle requête)

---

### Phase 5 : Tests Zustand Store

#### 5.1 Persistance dans localStorage

- [ ] Se connecter
- [ ] Ouvrir les DevTools du navigateur (F12)
- [ ] Aller dans l'onglet "Application" > "Local Storage"
- [ ] Vérifier que la clé `auth-storage` contient :
  ```json
  {
    "state": {
      "user": {...},
      "roles": [...],
      "sessionId": "...",
      "isAuthenticated": true
    }
  }
  ```

#### 5.2 Hydratation au chargement

- [ ] Se connecter
- [ ] Fermer complètement le navigateur
- [ ] Rouvrir le navigateur et accéder à l'application
- [ ] Vérifier que l'utilisateur est toujours connecté (pas de redirection vers `/signin`)

---

### Phase 6 : Tests de Navigation

#### 6.1 Redirections selon les rôles

- [ ] **Test ROLE_OCCUPANT** :
  - Se connecter avec un compte occupant
  - Vérifier la redirection vers `/occupant`

- [ ] **Test ROLE_GESTIONNAIRE** :
  - Se connecter avec un compte gestionnaire
  - Vérifier la redirection vers `/dashboard`

#### 6.2 Protection des routes

- [ ] **Test route protégée** :
  - Se déconnecter
  - Essayer d'accéder à `/dashboard`
  - Vérifier la redirection vers `/signin`

- [ ] **Test route publique** :
  - Se déconnecter
  - Accéder à `/signin`
  - Vérifier que la page s'affiche

---

## 🐛 Tests de Dépannage

### Problèmes courants et solutions

#### 1. Erreur CORS

**Symptôme** : Erreur dans la console : `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution** : Vérifier la configuration CORS dans Symfony (`config/packages/nelmio_cors.yaml`)

#### 2. Cookie PHPSESSID non envoyé

**Symptôme** : La session n'est pas persistée entre les requêtes

**Solution** : Vérifier que `withCredentials: true` est configuré dans `src/lib/api/client.ts`

#### 3. Erreur de build TypeScript

**Symptôme** : Erreurs TypeScript lors du build

**Solution** :
```bash
cd frontend
npm run build
# Corriger les erreurs affichées
```

#### 4. Erreur de hydration Next.js

**Symptôme** : Erreur "Hydration failed" dans la console

**Solution** : Vérifier que `skipHydration: false` est configuré dans `authStore.ts`

---

## 📊 Rapport de Test

### Template de rapport

```markdown
## Rapport de Test - [Date]

### Environnement
- Backend : http://localhost:8000
- Frontend : http://localhost:3000
- Navigateur : [Chrome/Firefox/Safari]
- Version : [Version]

### Résultats

#### Phase 1 : Tests de Base
- [ ] Application démarre : ✅ / ❌
- [ ] Structure des fichiers : ✅ / ❌

#### Phase 2 : Tests d'Authentification
- [ ] Page de connexion : ✅ / ❌
- [ ] Validation du formulaire : ✅ / ❌
- [ ] Connexion réussie : ✅ / ❌
- [ ] Connexion échouée : ✅ / ❌
- [ ] Gestion de la session : ✅ / ❌
- [ ] Middleware : ✅ / ❌

#### Phase 3 : Tests API
- [ ] Endpoint login : ✅ / ❌
- [ ] Endpoint check : ✅ / ❌
- [ ] Intercepteurs : ✅ / ❌

#### Phase 4 : Tests React Query
- [ ] DevTools : ✅ / ❌
- [ ] Cache : ✅ / ❌

#### Phase 5 : Tests Zustand
- [ ] Persistance : ✅ / ❌
- [ ] Hydratation : ✅ / ❌

#### Phase 6 : Tests Navigation
- [ ] Redirections : ✅ / ❌
- [ ] Protection routes : ✅ / ❌

### Problèmes rencontrés

1. [Description du problème]
   - Solution : [Solution appliquée]

### Conclusion

[✅ Setup fonctionnel] / [❌ Problèmes à corriger]
```

---

## 🎯 Tests Automatisés (Optionnel)

### Script de test rapide

Créer un fichier `test-setup.sh` :

```bash
#!/bin/bash

echo "🧪 Tests du setup Frontend Techem"

# Test 1: Vérifier que le serveur démarre
echo "1. Test démarrage serveur..."
cd frontend
npm run dev &
SERVER_PID=$!
sleep 5

# Test 2: Vérifier que le serveur répond
echo "2. Test réponse serveur..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Serveur répond"
else
  echo "❌ Serveur ne répond pas"
fi

# Test 3: Vérifier les fichiers essentiels
echo "3. Test fichiers essentiels..."
FILES=(
  "src/lib/api/client.ts"
  "src/lib/hooks/useAuth.ts"
  "src/lib/store/authStore.ts"
  "src/middleware.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file manquant"
  fi
done

# Nettoyage
kill $SERVER_PID 2>/dev/null

echo "✅ Tests terminés"
```

---

## 📝 Notes

- Les tests doivent être effectués dans un environnement de développement
- Utiliser des identifiants de test (pas de production)
- Vérifier les logs du backend Symfony pour les erreurs serveur
- Vérifier la console du navigateur (F12) pour les erreurs frontend

---

**Dernière mise à jour** : 2025-01-XX

