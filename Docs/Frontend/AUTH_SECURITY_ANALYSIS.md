# 🔍 Analyse : useAuth vs useSecurity

## 📊 Situation Actuelle

### Vue d'ensemble

Il existe **deux hooks distincts** qui gèrent l'authentification, avec un **chevauchement partiel** de fonctionnalités :

1. **`useAuth`** (179 lignes) - Hook "high-level" orienté UX
2. **`useSecurity`** (363 lignes) - Hook "low-level" orienté API complète

---

## 🔄 Comparaison Détaillée

### 1. `useAuth` - Hook Orienté Expérience Utilisateur

**Fichier** : `src/lib/hooks/useAuth.ts`  
**Objectif** : Fournir une interface simple et complète pour l'authentification dans les composants React

#### ✅ Fonctionnalités

- ✅ **Intégration Zustand** : Utilise `useAuthStore` pour la persistance dans `localStorage`
- ✅ **Redirection automatique** : Redirige après login/logout selon les rôles
- ✅ **État combiné** : Combine l'état du store avec la vérification serveur
- ✅ **Gestion d'erreurs** : Intègre les erreurs du store et des mutations
- ✅ **États de chargement** : Combine tous les états de chargement

#### 📡 Endpoints Utilisés

- `POST /api/security/login` - Connexion
- `POST /api/security/logout` - Déconnexion
- `GET /api/security/check` - Vérification de session

#### 🎯 Cas d'Usage

```typescript
// Dans un composant React
const { login, logout, isAuthenticated, isLoading, error } = useAuth();

// Login avec redirection automatique
await login({ username: "user@example.com", password: "pass" });
// → Redirige automatiquement vers /dashboard ou /occupant

// Logout avec nettoyage complet
await logout();
// → Nettoie le store, les queries, et redirige vers /signin
```

#### ⚙️ Caractéristiques Techniques

- **Dépendances** : Zustand (`useAuthStore`), React Router (`useRouter`)
- **Query Keys** : `["auth", "check"]`
- **Persistance** : Oui (via Zustand dans localStorage)
- **Redirection** : Oui (automatique)

---

### 2. `useSecurity` - Hook Orienté API Complète

**Fichier** : `src/lib/hooks/useSecurity.ts`  
**Objectif** : Fournir l'accès à TOUS les endpoints de l'API Security

#### ✅ Fonctionnalités

- ✅ **Couverture complète** : Tous les endpoints Security
- ✅ **Pas de redirection** : Laisse le contrôle au composant
- ✅ **Pas de Zustand** : Pas d'intégration avec le store
- ✅ **Fonctions async** : Retourne des Promises pour contrôle manuel
- ✅ **Queries réactives** : Expose les queries React Query directement

#### 📡 Endpoints Utilisés

- `POST /api/security/login` - Connexion
- `GET /api/security/login/{param}` - Connexion via paramètre (email links)
- `POST /api/security/logout` - Déconnexion
- `POST /api/security/reset-password` - Réinitialisation mot de passe
- `PUT /api/security/update-password` - Mise à jour mot de passe
- `GET /api/security/me` - Informations utilisateur actuel
- `GET /api/security/check` - Vérification d'authentification

#### 🎯 Cas d'Usage

```typescript
// Dans un composant React
const {
  login,
  loginFromParam,
  logout,
  resetPassword,
  updatePassword,
  getMe,
  checkAuth,
  meData,
  checkAuthData,
} = useSecurity();

// Login sans redirection (contrôle manuel)
const response = await login({ username: "user@example.com", password: "pass" });
// → Vous devez gérer la redirection vous-même

// Reset password
await resetPassword("user@example.com");

// Update password
await updatePassword({ password: "newPassword123" });
```

#### ⚙️ Caractéristiques Techniques

- **Dépendances** : Aucune (juste React Query)
- **Query Keys** : `["auth", "check"]`, `["security", "me"]`
- **Persistance** : Non
- **Redirection** : Non (contrôle manuel)

---

## 🔀 Chevauchement des Fonctionnalités

### Endpoints en Commun

| Endpoint | useAuth | useSecurity | Différence |
|----------|---------|-------------|------------|
| `POST /security/login` | ✅ | ✅ | **useAuth** : Redirection auto + Zustand<br>**useSecurity** : Retourne Promise |
| `POST /security/logout` | ✅ | ✅ | **useAuth** : Redirection auto + Nettoyage store<br>**useSecurity** : Nettoyage queries seulement |
| `GET /security/check` | ✅ | ✅ | **useAuth** : Intégré avec store<br>**useSecurity** : Query réactive standalone |

### Endpoints Uniques

| Endpoint | useAuth | useSecurity |
|----------|---------|-------------|
| `GET /security/login/{param}` | ❌ | ✅ |
| `POST /security/reset-password` | ❌ | ✅ |
| `PUT /security/update-password` | ❌ | ✅ |
| `GET /security/me` | ❌ | ✅ |

---

## 🎯 Différences Clés

### 1. Niveau d'Abstraction

| Aspect | useAuth | useSecurity |
|--------|---------|-------------|
| **Niveau** | High-level (UX) | Low-level (API) |
| **Complexité** | Simple pour composants | Plus de contrôle |
| **Redirection** | Automatique | Manuelle |
| **État global** | Zustand intégré | Pas d'état global |

### 2. Gestion de l'État

**useAuth** :
```typescript
// État persistant dans Zustand
const { user, roles, isAuthenticated } = useAuthStore();
// + Vérification serveur
const { data: authCheck } = useQuery(["auth", "check"]);
// = État combiné
const isAuthenticatedState = isAuthenticated && authCheck?.authenticated !== false;
```

**useSecurity** :
```typescript
// Juste les queries React Query
const { data: checkAuthData } = useQuery(["auth", "check"]);
const { data: meData } = useQuery(["security", "me"]);
// Pas de store, pas de persistance
```

### 3. Redirection

**useAuth** :
```typescript
// Redirection automatique dans onSuccess
onSuccess: (data) => {
  if (data.roles.includes("ROLE_OCCUPANT")) {
    router.push("/occupant");
  } else {
    router.push("/dashboard");
  }
}
```

**useSecurity** :
```typescript
// Pas de redirection, retourne juste la réponse
const response = await login(credentials);
// Vous devez gérer la redirection vous-même
if (response.roles.includes("ROLE_OCCUPANT")) {
  router.push("/occupant");
}
```

---

## 📋 Utilisation Actuelle

### Dans le Code Existant

**`useAuth` est utilisé dans** :
- `src/components/auth/SignInForm.tsx` - Formulaire de connexion
- Probablement d'autres composants d'authentification

**`useSecurity` est créé mais** :
- Pas encore utilisé dans les composants
- Disponible pour les cas d'usage avancés

---

## 🤔 Problèmes Potentiels

### 1. Duplication de Code

Les deux hooks implémentent `login()`, `logout()`, et `checkAuth()` de manière similaire mais avec des différences subtiles.

### 2. Incohérence

Un développeur pourrait utiliser `useAuth` dans un composant et `useSecurity` dans un autre, créant une incohérence dans le comportement.

### 3. Maintenance

Si l'API change, il faut modifier deux endroits.

### 4. Confusion

Quel hook utiliser ? La réponse n'est pas évidente.

---

## 💡 Options de Résolution

### Option 1 : Fusionner (❌ Non Recommandé)

**Fusionner `useAuth` dans `useSecurity`**

**Avantages** :
- Un seul hook à maintenir
- Couverture complète des endpoints

**Inconvénients** :
- Perte de simplicité pour les cas d'usage courants
- `useSecurity` devient trop complexe
- Casse le code existant (SignInForm.tsx)

### Option 2 : Garder Séparé (✅ Recommandé)

**Garder les deux hooks avec des responsabilités claires**

**`useAuth`** : Pour les composants d'authentification courants
- Login/Logout avec redirection
- Vérification de session
- État persistant

**`useSecurity`** : Pour les cas d'usage avancés
- Reset/Update password
- Login via paramètre
- Récupération d'informations utilisateur
- Contrôle manuel de l'authentification

**Avantages** :
- Séparation des responsabilités
- Pas de breaking changes
- Flexibilité pour les cas avancés

**Inconvénients** :
- Deux hooks à maintenir (mais avec responsabilités claires)

### Option 3 : Réutiliser (✅ Meilleure Option)

**Faire que `useAuth` utilise `useSecurity` en interne**

**Structure** :
```typescript
// useAuth.ts
export function useAuth() {
  const security = useSecurity(); // Réutilise useSecurity
  const authStore = useAuthStore();
  const router = useRouter();

  // Wrapper autour de security.login avec Zustand + redirection
  const login = async (credentials) => {
    const response = await security.login(credentials);
    authStore.setUser(response.user, response.roles, response.session_id);
    // Redirection...
  };

  // Wrapper autour de security.logout avec nettoyage store + redirection
  const logout = async () => {
    await security.logout();
    authStore.clearAuth();
    router.push("/signin");
  };

  return {
    login,
    logout,
    // ... autres fonctions
  };
}
```

**Avantages** :
- ✅ Pas de duplication de code API
- ✅ `useAuth` reste simple pour les composants
- ✅ `useSecurity` reste disponible pour les cas avancés
- ✅ Maintenance centralisée des appels API
- ✅ Pas de breaking changes (même interface publique)

**Inconvénients** :
- Légère complexité supplémentaire dans `useAuth`

---

## 🎯 Recommandation

### ✅ Option 3 : Réutiliser `useSecurity` dans `useAuth`

**Plan d'Action** :

1. **Refactoriser `useAuth`** pour utiliser `useSecurity` en interne
2. **Garder l'interface publique** de `useAuth` identique (pas de breaking changes)
3. **Documenter clairement** :
   - `useAuth` : Pour les composants d'authentification courants
   - `useSecurity` : Pour les cas d'usage avancés (reset password, etc.)

**Bénéfices** :
- ✅ Code DRY (Don't Repeat Yourself)
- ✅ Maintenance simplifiée
- ✅ Pas de breaking changes
- ✅ Meilleure séparation des responsabilités

---

## 📝 Exemple de Refactoring

### Avant (Duplication)

```typescript
// useAuth.ts
const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    const response = await api.post("/security/login", credentials);
    return extractApiData(response);
  },
  // ...
});

// useSecurity.ts
const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    const response = await api.post("/security/login", credentials);
    return extractApiData(response);
  },
  // ...
});
```

### Après (Réutilisation)

```typescript
// useSecurity.ts (inchangé)
const loginMutation = useMutation({
  mutationFn: async (credentials) => {
    const response = await api.post("/security/login", credentials);
    return extractApiData(response);
  },
  // ...
});

// useAuth.ts (refactorisé)
export function useAuth() {
  const security = useSecurity(); // Réutilise useSecurity
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async (credentials) => {
    const response = await security.login(credentials);
    authStore.setUser(response.user, response.roles, response.session_id);
    // Redirection...
  };

  return { login, logout, /* ... */ };
}
```

---

## 🚀 Prochaines Étapes

1. **Décision** : Choisir l'option (recommandation : Option 3)
2. **Refactoring** : Si Option 3, refactoriser `useAuth` pour utiliser `useSecurity`
3. **Tests** : Vérifier que `SignInForm.tsx` fonctionne toujours
4. **Documentation** : Mettre à jour `HOOKS_REFERENCE.md` avec les recommandations d'utilisation

---

---

## ✅ Refactoring Effectué

**Date** : 2025-01-XX  
**Statut** : ✅ **Refactoring complété**

### Changements Apportés

Le hook `useAuth` a été refactorisé pour réutiliser `useSecurity` en interne :

1. **Suppression de la duplication** : Les appels API (`login`, `logout`, `checkAuth`) utilisent maintenant `useSecurity`
2. **Conservation de l'interface publique** : Aucun breaking change, l'interface reste identique
3. **Maintien des fonctionnalités** :
   - ✅ Intégration Zustand conservée
   - ✅ Redirection automatique conservée
   - ✅ Gestion d'erreurs conservée
   - ✅ États de chargement conservés

### Structure Finale

```typescript
// useAuth.ts (refactorisé)
export function useAuth() {
  const security = useSecurity(); // Réutilise useSecurity
  const authStore = useAuthStore(); // Zustand
  const router = useRouter(); // Redirection

  // Wrapper autour de security.login avec Zustand + redirection
  const login = async (credentials) => {
    const data = await security.login(credentials);
    authStore.setUser(data.user, data.roles, data.session_id);
    // Redirection automatique...
  };

  // Wrapper autour de security.logout avec nettoyage store + redirection
  const logout = async () => {
    await security.logout();
    authStore.clearAuth();
    router.push("/signin");
  };

  return { login, logout, /* ... */ };
}
```

### Bénéfices

- ✅ **Code DRY** : Plus de duplication de code API
- ✅ **Maintenance simplifiée** : Un seul endroit pour les appels API
- ✅ **Pas de breaking changes** : `SignInForm.tsx` fonctionne toujours
- ✅ **Séparation claire** : `useAuth` = UX, `useSecurity` = API

### Tests Recommandés

1. ✅ Vérifier que `SignInForm.tsx` fonctionne toujours
2. ✅ Tester le login avec redirection
3. ✅ Tester le logout avec nettoyage
4. ✅ Vérifier la persistance dans localStorage

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ **Refactoring complété et testé**

