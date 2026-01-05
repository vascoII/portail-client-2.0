# 🤔 Réflexion : Suppression de l'Appel à `/api/security/check`

**Date** : 2025-01-XX  
**Contexte** : Migration vers une API stateless  
**Problème** : L'appel à `/api/security/check` est encore effectué alors qu'il n'est plus nécessaire

---

## 📋 Analyse du Problème

### Situation Actuelle

Lors de l'accès à la page `/login`, un appel à `/api/security/check` est effectué, ce qui génère une erreur car :
1. Les services SOAP ne sont pas disponibles (environnement de développement)
2. L'endpoint `/api/security/check` utilise encore le système stateful (token Symfony)
3. **Avec l'approche stateless, cet appel n'est plus nécessaire**

### Pourquoi l'Appel est Encore Effectué

#### 1. **`useSecurity.ts` - `checkAuthQuery` (Lignes 201-214)**

```typescript
const checkAuthQuery = useQuery({
  queryKey: ["auth", "check"],
  queryFn: async (): Promise<AuthCheckResponse> => {
    try {
      const response = await api.get<AuthCheckResponse>("/security/check");
      return extractApiData<AuthCheckResponse>(response);
    } catch (error) {
      return { authenticated: false };
    }
  },
  retry: false,
  staleTime: 5 * 60 * 1000,
  // ❌ PROBLÈME : Pas de `enabled: false` → s'exécute automatiquement
});
```

**Problème** : Cette query React Query s'exécute automatiquement au montage du hook, même si on n'en a pas besoin.

**Solution** : Ajouter `enabled: false` pour désactiver l'exécution automatique, ou supprimer complètement cette query.

#### 2. **`useAuth.ts` - Query Conditionnelle (Lignes 59-68)**

```typescript
const { data: authCheck, isLoading: isCheckingAuth } = useQuery<AuthCheckResponse>({
  queryKey: ["auth", "check"],
  queryFn: async () => {
    return security.checkAuth(); // ← Appelle /api/security/check
  },
  enabled: isAuthenticated, // ⚠️ S'exécute si isAuthenticated est vrai
  retry: false,
  staleTime: 5 * 60 * 1000,
});
```

**Problème** : Cette query s'exécute si `isAuthenticated` est vrai. Or, `isAuthenticated` peut être vrai si le store local contient des données, ce qui déclenche l'appel serveur.

**Solution** : Supprimer cette query car elle n'est plus nécessaire avec l'approche stateless.

#### 3. **`useAuth.ts` - `checkAndSyncSession()` (Lignes 130-150)**

```typescript
const checkAndSyncSession = async (): Promise<boolean> => {
  try {
    const authCheck = await security.checkAuth(); // ← Appelle /api/security/check
    // ...
  } catch (error) {
    // ...
  }
};
```

**Problème** : Cette fonction est conçue pour synchroniser le store avec le serveur, ce qui n'est plus nécessaire avec l'approche stateless.

**Solution** : Supprimer cette fonction ou la remplacer par une vérification locale uniquement.

#### 4. **`login.tsx` - Vérification au Chargement**

```typescript
useEffect(() => {
  setIsCheckingSession(true);
  
  // ✅ BON : Vérifie uniquement le store local
  if (isAuthenticated && user && sessionId) {
    router.push(redirectPath);
  } else {
    setIsCheckingSession(false);
  }
}, []);
```

**Statut** : ✅ **Correct** - Le composant `login.tsx` vérifie uniquement le store local, pas de problème ici.

**Mais** : Le hook `useAuth()` utilisé dans ce composant peut déclencher l'appel à `/api/security/check` via la query conditionnelle.

---

## 🎯 Pourquoi On Peut Se Passer de `/api/security/check`

### Avec l'Approche Stateless

1. **Authentification basée sur les headers** :
   - Chaque requête API inclut `X-Session-ID` et `X-Pk-User`
   - Le backend valide ces headers pour chaque requête
   - Pas besoin de vérifier l'état d'authentification séparément

2. **Stockage côté client** :
   - `sessionId` et `pkUser` sont stockés dans `localStorage` (via Zustand)
   - La présence de ces valeurs dans le store = utilisateur authentifié
   - Pas besoin de vérifier côté serveur

3. **Validation lors des requêtes** :
   - Si `sessionId` ou `pkUser` sont invalides, les requêtes API retourneront 401
   - L'intercepteur Axios redirigera automatiquement vers `/login`
   - Pas besoin d'un endpoint dédié pour vérifier l'authentification

### Avantages de la Suppression

✅ **Moins de requêtes HTTP** : Pas d'appel inutile au chargement de la page  
✅ **Meilleure performance** : Vérification instantanée côté client  
✅ **Fonctionne hors ligne** : Vérification possible même si le serveur est indisponible  
✅ **Cohérence** : Aligné avec l'approche stateless  
✅ **Simplicité** : Moins de code à maintenir

---

## 🔍 Analyse des Cas d'Usage

### Cas 1 : Page de Login (`/login`)

**Objectif** : Vérifier si l'utilisateur est déjà authentifié pour rediriger.

**Approche Actuelle** :
```typescript
// ❌ Appel serveur inutile
const authCheck = await security.checkAuth();
if (authCheck.authenticated) {
  router.push("/dashboard");
}
```

**Approche Stateless** :
```typescript
// ✅ Vérification locale uniquement
const { isAuthenticated, user, sessionId, pkUser } = useAuth();
if (isAuthenticated && user && sessionId && pkUser) {
  router.push("/dashboard");
}
```

**Résultat** : ✅ Pas besoin de `/api/security/check`

### Cas 2 : Protection de Route (Middleware)

**Objectif** : Vérifier si l'utilisateur est authentifié avant d'accéder à une route protégée.

**Approche Actuelle** :
```typescript
// ❌ Appel serveur à chaque navigation
const authCheck = await security.checkAuth();
if (!authCheck.authenticated) {
  router.push("/login");
}
```

**Approche Stateless** :
```typescript
// ✅ Vérification locale
const { isAuthenticated, sessionId, pkUser } = useAuth();
if (!isAuthenticated || !sessionId || !pkUser) {
  router.push("/login");
}
```

**Résultat** : ✅ Pas besoin de `/api/security/check`

### Cas 3 : Vérification de Session Expirée

**Objectif** : Détecter si la session SOAP a expiré.

**Approche Actuelle** :
```typescript
// ❌ Appel serveur pour vérifier
const authCheck = await security.checkAuth();
if (!authCheck.authenticated) {
  // Session expirée
}
```

**Approche Stateless** :
```typescript
// ✅ La validation se fait lors des requêtes API
// Si sessionId/pkUser sont invalides, les requêtes retourneront 401
// L'intercepteur Axios redirigera automatiquement
```

**Résultat** : ✅ Pas besoin de `/api/security/check` - La validation se fait naturellement lors des requêtes

---

## 📊 Comparaison des Approches

| Aspect | Avec `/api/security/check` | Sans `/api/security/check` (Stateless) |
|--------|---------------------------|----------------------------------------|
| **Requêtes HTTP** | 1 requête au chargement | 0 requête (vérification locale) |
| **Performance** | ⚠️ Latence réseau | ✅ Instantané |
| **Fonctionne hors ligne** | ❌ Non | ✅ Oui (vérification locale) |
| **Validation session** | ⚠️ Endpoint dédié | ✅ Validation lors des requêtes |
| **Complexité** | ⚠️ Plus complexe | ✅ Plus simple |
| **Cohérence** | ⚠️ Mélange stateful/stateless | ✅ 100% stateless |

---

## 🎯 Recommandations

### 1. Supprimer `checkAuthQuery` dans `useSecurity.ts`

**Raison** : Cette query s'exécute automatiquement et n'est plus nécessaire.

**Action** :
- Supprimer la query `checkAuthQuery` (lignes 201-214)
- Supprimer la fonction `checkAuth()` (lignes 287-302) ou la marquer comme deprecated
- Supprimer les exports liés (`checkAuthData`, `checkAuthIsLoading`, `checkAuthError`)

### 2. Supprimer la Query dans `useAuth.ts`

**Raison** : Cette query conditionnelle déclenche l'appel à `/api/security/check` même si on vérifie déjà le store local.

**Action** :
- Supprimer la query `useQuery` (lignes 59-68)
- Supprimer la référence à `authCheck` dans `isAuthenticatedState` (ligne 156)
- Utiliser uniquement `isAuthenticated` du store

### 3. Supprimer ou Simplifier `checkAndSyncSession()`

**Raison** : Cette fonction est conçue pour synchroniser avec le serveur, ce qui n'est plus nécessaire.

**Action** :
- **Option A** : Supprimer complètement la fonction
- **Option B** : La remplacer par une vérification locale uniquement :
  ```typescript
  const checkAndSyncSession = (): boolean => {
    // Vérification locale uniquement
    return isAuthenticated && !!sessionId && !!pkUser;
  };
  ```

### 4. Mettre à Jour `isAuthenticatedState` dans `useAuth.ts`

**Avant** :
```typescript
const isAuthenticatedState = isAuthenticated && authCheck?.authenticated !== false;
```

**Après** :
```typescript
// Vérification locale uniquement
const isAuthenticatedState = isAuthenticated && !!sessionId && !!pkUser;
```

### 5. Supprimer l'Endpoint `/api/security/check` (Backend)

**Raison** : Plus utilisé, peut être supprimé pour simplifier le code.

**Action** :
- Supprimer la méthode `check()` dans `SecurityApiController.php`
- Supprimer la route associée

---

## 🔄 Flux Proposé (Sans `/api/security/check`)

### Page de Login

```
┌─────────────┐
│   /login    │
└──────┬──────┘
       │ 1. Composant monte
       ▼
┌─────────────────────┐
│   useAuth() Hook    │
└──────┬──────────────┘
       │ 2. Lit le store Zustand
       │    - sessionId ?
       │    - pkUser ?
       │    - user ?
       ▼
┌─────────────────────┐
│   Store Local       │
│   (localStorage)    │
└──────┬──────────────┘
       │ 3. Vérification locale
       │    if (sessionId && pkUser && user) {
       │      → Authentifié
       │      → Rediriger vers /dashboard
       │    } else {
       │      → Non authentifié
       │      → Afficher formulaire
       │    }
       ▼
┌─────────────┐
│   Résultat  │
└─────────────┘
```

**Aucun appel serveur nécessaire** ✅

### Requête API Authentifiée

```
┌─────────────┐
│   Component │
│   GET /api/ │
│   logements │
└──────┬──────┘
       │ 1. Requête HTTP
       ▼
┌─────────────────────┐
│   Axios Interceptor │
└──────┬──────────────┘
       │ 2. Lit sessionId et pkUser
       │    depuis localStorage
       │ 3. Ajoute headers
       │    X-Session-ID: xxx
       │    X-Pk-User: 123
       ▼
┌─────────────────────┐
│   Backend API       │
└──────┬──────────────┘
       │ 4. Valide headers
       │    - Si valides → 200 OK
       │    - Si invalides → 401 Unauthorized
       ▼
┌─────────────────────┐
│   Axios Interceptor │
│   (Response)        │
└──────┬──────────────┘
       │ 5. Si 401 → Rediriger vers /login
       │    Si 200 → Retourner les données
       ▼
┌─────────────┐
│   Component │
└─────────────┘
```

**Validation automatique lors des requêtes** ✅

---

## ⚠️ Points d'Attention

### 1. Session Expirée Côté SOAP

**Problème** : Si la session SOAP expire, `sessionId` et `pkUser` seront toujours présents dans le store local, mais invalides côté serveur.

**Solution** :
- ✅ Les requêtes API retourneront 401 si la session est expirée
- ✅ L'intercepteur Axios redirigera automatiquement vers `/login`
- ✅ Le store sera nettoyé lors de la redirection

**Pas besoin de vérification proactive** : La validation se fait naturellement lors des requêtes.

### 2. Données Corrompues dans localStorage

**Problème** : Si `sessionId` ou `pkUser` sont corrompus dans `localStorage`, la vérification locale peut indiquer que l'utilisateur est authentifié alors qu'il ne l'est pas.

**Solution** :
- ✅ Les requêtes API retourneront 401 si les headers sont invalides
- ✅ L'intercepteur Axios redirigera automatiquement vers `/login`
- ✅ Le store sera nettoyé lors de la redirection

**Pas besoin de vérification proactive** : La validation se fait naturellement lors des requêtes.

### 3. Synchronisation Multi-Onglets

**Problème** : Si l'utilisateur se déconnecte dans un onglet, les autres onglets ne le savent pas immédiatement.

**Solution** :
- ✅ Utiliser `storage` event de `localStorage` pour synchroniser entre onglets
- ✅ Ou accepter que la synchronisation se fasse lors de la prochaine requête API

**Pas besoin de `/api/security/check`** : La synchronisation peut se faire via `localStorage` events.

---

## 📝 Checklist de Suppression

### Frontend

- [ ] Supprimer `checkAuthQuery` dans `useSecurity.ts`
- [ ] Supprimer la fonction `checkAuth()` dans `useSecurity.ts` (ou la marquer comme deprecated)
- [ ] Supprimer les exports liés (`checkAuthData`, `checkAuthIsLoading`, `checkAuthError`)
- [ ] Supprimer la query conditionnelle dans `useAuth.ts` (lignes 59-68)
- [ ] Mettre à jour `isAuthenticatedState` pour utiliser uniquement le store local
- [ ] Supprimer ou simplifier `checkAndSyncSession()` dans `useAuth.ts`
- [ ] Vérifier que `login.tsx` utilise uniquement le store local (déjà fait ✅)
- [ ] Vérifier que le middleware utilise uniquement le store local

### Backend

- [ ] Supprimer la méthode `check()` dans `SecurityApiController.php`
- [ ] Supprimer la route `/api/security/check`
- [ ] Mettre à jour la documentation API

### Tests

- [ ] Tester la page `/login` sans appel à `/api/security/check`
- [ ] Tester la redirection si authentifié (store local)
- [ ] Tester la redirection si non authentifié (store vide)
- [ ] Tester la gestion des erreurs 401 lors des requêtes API
- [ ] Tester la synchronisation multi-onglets (si implémentée)

---

## 🎯 Conclusion

### Pourquoi Supprimer `/api/security/check` ?

1. **Plus nécessaire** : Avec l'approche stateless, la vérification se fait naturellement lors des requêtes API
2. **Meilleure performance** : Pas de requête HTTP supplémentaire
3. **Plus simple** : Moins de code à maintenir
4. **Cohérence** : Aligné avec l'approche stateless à 100%

### Comment Vérifier l'Authentification ?

**Réponse** : Vérifier uniquement le store local (`sessionId`, `pkUser`, `user`). Si ces valeurs sont présentes, l'utilisateur est considéré comme authentifié. Si elles sont invalides, les requêtes API retourneront 401 et l'intercepteur Axios redirigera automatiquement vers `/login`.

**Pas besoin d'appel serveur** ✅

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Réflexion complète - Prêt pour implémentation

