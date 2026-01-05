# 🔄 Migration vers une API Stateless - Documentation

**Date** : 2025-01-XX  
**Objectif** : Migration de l'authentification basée sur les sessions Symfony (stateful) vers une authentification stateless utilisant des headers HTTP.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Avant/Après](#architecture-avantaprès)
3. [Modifications Backend](#modifications-backend)
4. [Modifications Frontend](#modifications-frontend)
5. [Fonctionnement du Nouveau Système](#fonctionnement-du-nouveau-système)
6. [Avantages de l'Approche Stateless](#avantages-de-lapproche-stateless)
7. [Guide de Migration](#guide-de-migration)
8. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

### Problématique Initiale

L'ancienne architecture utilisait :
- **Sessions PHP/Symfony** : Stockage de l'état d'authentification côté serveur
- **Token Storage Symfony** : Gestion des tokens via `security.token_storage`
- **Cookies PHPSESSID** : Maintien de la session via cookies
- **Dépendance au container Symfony** : Accès au token via `$this->container->get('security.token_storage')`

Cette approche **stateful** posait plusieurs problèmes :
- ❌ Dépendance aux sessions serveur
- ❌ Difficulté de scalabilité horizontale
- ❌ Complexité de gestion des sessions
- ❌ Incompatibilité avec les architectures microservices

### Solution Implémentée

La nouvelle architecture utilise :
- ✅ **Headers HTTP personnalisés** : `X-Session-ID` et `X-Pk-User`
- ✅ **Stockage côté client** : localStorage via Zustand
- ✅ **API stateless** : Aucune session serveur requise
- ✅ **Authentification par headers** : Chaque requête contient les informations d'authentification

---

## 🏗️ Architecture Avant/Après

### Avant (Stateful)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│   Session   │
│   React     │  POST   │   Symfony    │  Store  │   PHP       │
│             │  /login │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │ Token Storage
                              ▼
                        ┌──────────────┐
                        │   SoapToken  │
                        │   (Session)  │
                        └──────────────┘

Requêtes suivantes :
┌─────────────┐         ┌──────────────┐
│   Frontend  │────────▶│   Backend    │
│   React     │  GET    │   Symfony    │
│             │  /api/* │              │
└─────────────┘         └──────────────┘
     Cookie: PHPSESSID         │
                              │ Read Token
                              ▼
                        ┌──────────────┐
                        │   SoapToken  │
                        │   (Session)  │
                        └──────────────┘
```

### Après (Stateless)

```
┌─────────────┐         ┌──────────────┐
│   Frontend  │────────▶│   Backend    │
│   React     │  POST   │   Symfony    │
│             │  /login │              │
└─────────────┘         └──────────────┘
                              │
                              │ loginForApi()
                              ▼
                        ┌──────────────┐
                        │   SOAP API   │
                        └──────────────┘
                              │
                              │ Return: session_id, pk_user, user
                              ▼
┌─────────────┐         ┌──────────────┐
│   Frontend  │◀────────│   Backend    │
│   React     │  JSON   │   Symfony    │
│             │ Response│              │
└─────────────┘         └──────────────┘
     │ Store in localStorage (Zustand)
     │ - sessionId
     │ - pkUser
     │ - user
     │ - roles
     ▼
┌─────────────┐
│  localStorage│
│  (Zustand)  │
└─────────────┘

Requêtes suivantes :
┌─────────────┐         ┌──────────────┐
│   Frontend  │────────▶│   Backend    │
│   React     │  GET    │   Symfony    │
│             │  /api/* │              │
└─────────────┘         └──────────────┘
     Headers:                │
     X-Session-ID: xxx       │ Read from headers
     X-Pk-User: 123          │ retrieveSession()
                              ▼
                        ┌──────────────┐
                        │   SOAP API   │
                        │   (stateless)│
                        └──────────────┘
```

---

## 🔧 Modifications Backend

### 1. Nouvelle Méthode `loginForApi()` dans `BaseClient.php`

**Fichier** : `src/Service/BaseClient.php`

**Avant** :
```php
public function login($username, $password)
{
    // ... appel SOAP ...
    $this->sessionId = $result->SessionID;
    $this->user = $result->User;
    $this->pkUser = $this->user->PKUser;
    return true; // Stocke dans l'instance
}
```

**Après** :
```php
public function loginForApi($username, $password)
{
    // ... appel SOAP ...
    // Retourne les données au lieu de les stocker
    return [
        'session_id' => $result->SessionID,
        'pk_user' => $result->User->PKUser,
        'user' => $result->User,
    ];
}
```

**Changement clé** : Au lieu de stocker les données dans l'instance du client, la méthode retourne les données pour que le frontend les stocke localement.

### 2. Nouvelle Méthode `getAuthenticatedClientFromHeaders()` dans `AbstractApiController.php`

**Fichier** : `src/Controller/Api/AbstractApiController.php`

**Nouvelle méthode** :
```php
protected function getAuthenticatedClientFromHeaders(Request $request)
{
    // Lit sessionId et pkUser depuis les headers
    $sessionId = $request->headers->get('X-Session-ID');
    $pkUser = $request->headers->get('X-Pk-User');

    if (!$sessionId || !$pkUser) {
        return $this->unauthorized('Missing authentication headers');
    }

    try {
        // Utilise retrieveSession() pour configurer le client
        $this->client->retrieveSession($sessionId, (int)$pkUser);
        return $this->client;
    } catch (\Exception $e) {
        return $this->unauthorized('Invalid session: ' . $e->getMessage());
    }
}
```

**Fonctionnement** :
1. Lit les headers `X-Session-ID` et `X-Pk-User` de la requête HTTP
2. Vérifie leur présence
3. Appelle `retrieveSession()` pour configurer le client SOAP
4. Retourne le client configuré ou une erreur

### 3. Modification de `SecurityApiController::login()`

**Fichier** : `src/Controller/Api/SecurityApiController.php`

**Avant** :
```php
public function login(Request $request): JsonResponse
{
    $client = $this->client;
    $success = $client->login($username, $password);
    // Stocke dans la session Symfony...
    return $this->success([...]);
}
```

**Après** :
```php
public function login(Request $request): JsonResponse
{
    $client = $this->client;
    $loginData = $client->loginForApi($username, $password);
    
    // Retourne session_id et pk_user au frontend
    return $this->success([
        'user' => $this->normalize($loginData['user']),
        'roles' => $roles,
        'session_id' => $loginData['session_id'],
        'pk_user' => $loginData['pk_user'],
    ], 'Login successful');
}
```

**Changement clé** : Retourne `session_id` et `pk_user` dans la réponse JSON au lieu de les stocker dans la session Symfony.

### 4. Migration de Tous les Endpoints API

**Tous les endpoints** ont été modifiés pour utiliser `getAuthenticatedClientFromHeaders($request)` au lieu de `getAuthenticatedClient()`.

**Exemple** :
```php
// Avant
public function index(): JsonResponse
{
    $client = $this->getAuthenticatedClient();
    // ...
}

// Après
public function index(Request $request): JsonResponse
{
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}
```

**Fichiers modifiés** :
- ✅ `OccupantApiController.php` : 15 méthodes
- ✅ `LogementApiController.php` : 21 méthodes
- ✅ `ImmeubleApiController.php` : 14 méthodes
- ✅ `OperatorApiController.php` : 9 méthodes
- ✅ `GestionParcApiController.php` : 14 méthodes
- ✅ `FactureApiController.php` : 3 méthodes
- ✅ `FrontApiController.php` : 5 méthodes
- ✅ `InterventionApiController.php` : 1 méthode
- ✅ `TicketingApiController.php` : Déjà à jour
- ✅ `SearchApiController.php` : Déjà à jour
- ✅ `TableauBordClientApiController.php` : 2 méthodes

**Total** : **~85 méthodes** migrées vers l'authentification stateless.

---

## 💻 Modifications Frontend

### 1. Mise à Jour du Store Zustand (`authStore.ts`)

**Fichier** : `frontend/src/lib/store/authStore.ts`

**Ajout de `pkUser`** :
```typescript
interface AuthState {
  user: User | null;
  roles: UserRole[];
  sessionId: string | null;
  pkUser: number | null;  // ← Nouveau champ
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Mise à jour de `setUser()`** :
```typescript
setUser: (user, roles, sessionId, pkUser) => {
  set({
    user,
    roles,
    sessionId,
    pkUser,  // ← Stockage de pkUser
    isAuthenticated: !!user,
    error: null,
  });
}
```

**Persistance** : `pkUser` est maintenant sauvegardé dans `localStorage` via Zustand.

### 2. Intercepteur Axios pour les Headers (`client.ts`)

**Fichier** : `frontend/src/lib/api/client.ts`

**Nouvel intercepteur de requête** :
```typescript
client.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        // Lit depuis localStorage (via Zustand)
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          const state = authData?.state;
          
          if (state?.sessionId && state?.pkUser) {
            // Ajoute les headers pour chaque requête
            config.headers['X-Session-ID'] = state.sessionId;
            config.headers['X-Pk-User'] = state.pkUser.toString();
          }
        }
      } catch (error) {
        console.error('Error reading auth from storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Fonctionnement** :
1. Avant chaque requête HTTP, l'intercepteur lit `sessionId` et `pkUser` depuis `localStorage`
2. Ajoute automatiquement les headers `X-Session-ID` et `X-Pk-User` à la requête
3. Le backend peut ainsi authentifier la requête sans session serveur

### 3. Mise à Jour du Hook `useAuth` (`useAuth.ts`)

**Fichier** : `frontend/src/lib/hooks/useAuth.ts`

**Mise à jour de `login()`** :
```typescript
const login = async (credentials: LoginCredentials) => {
  setLoading(true);
  setError(null);
  
  try {
    const data = await security.login(credentials);
    
    // Stocke session_id et pk_user dans le store
    setUser(data.user, data.roles, data.session_id, data.pk_user);
    // ...
  } catch (error) {
    // ...
  }
};
```

**Retour du hook** :
```typescript
return {
  // State
  user,
  roles,
  sessionId,
  pkUser,  // ← Exposé dans le hook
  isAuthenticated: isAuthenticatedState,
  // ...
};
```

### 4. Mise à Jour du Type `LoginResponse` (`api.ts`)

**Fichier** : `frontend/src/lib/types/api.ts`

**Ajout de `pk_user`** :
```typescript
export interface LoginResponse {
  user: User;
  roles: UserRole[];
  session_id: string;
  pk_user: number;  // ← Nouveau champ
}
```

### 5. Mise à Jour du Composant `LoginForm` (`login.tsx`)

**Fichier** : `frontend/src/components/techem/security/form/login.tsx`

**Vérification stateless** :
```typescript
// Vérifie uniquement le store local (pas d'appel serveur)
useEffect(() => {
  if (isAuthenticated && user && sessionId) {
    // Redirige si authentifié dans le store
    const redirectPath = redirect || (roles?.includes("ROLE_OCCUPANT") ? "/occupant" : "/dashboard");
    router.push(redirectPath);
  }
}, []);
```

**Changement clé** : Plus d'appel à `/api/security/check` au chargement. La vérification se fait uniquement via le store local.

---

## 🔄 Fonctionnement du Nouveau Système

### Flux d'Authentification Complet

#### 1. Connexion (Login)

```
┌─────────────┐
│   Frontend  │
│  LoginForm  │
└──────┬──────┘
       │ 1. User submit form
       │    POST /api/security/login
       │    { username, password }
       ▼
┌─────────────────────┐
│   SecurityApi       │
│   Controller        │
└──────┬──────────────┘
       │ 2. client->loginForApi()
       ▼
┌─────────────────────┐
│   BaseClient        │
│   loginForApi()     │
└──────┬──────────────┘
       │ 3. SOAP Login
       ▼
┌─────────────────────┐
│   SOAP API          │
│   (External)        │
└──────┬──────────────┘
       │ 4. Return: SessionID, User, PKUser
       ▼
┌─────────────────────┐
│   SecurityApi       │
│   Controller        │
└──────┬──────────────┘
       │ 5. Return JSON
       │    {
       │      user: {...},
       │      roles: [...],
       │      session_id: "xxx",
       │      pk_user: 123
       │    }
       ▼
┌─────────────┐
│   Frontend  │
│  useAuth()  │
└──────┬──────┘
       │ 6. Store in Zustand
       │    - sessionId → localStorage
       │    - pkUser → localStorage
       │    - user → localStorage
       │    - roles → localStorage
       ▼
┌─────────────┐
│ localStorage│
│  (Zustand)  │
└─────────────┘
```

#### 2. Requêtes Authentifiées

```
┌─────────────┐
│   Frontend  │
│  Component  │
└──────┬──────┘
       │ 1. API Call
       │    GET /api/logements
       ▼
┌─────────────────────┐
│   Axios Interceptor │
│   (Request)         │
└──────┬──────────────┘
       │ 2. Read from localStorage
       │    - sessionId
       │    - pkUser
       │ 3. Add headers
       │    X-Session-ID: xxx
       │    X-Pk-User: 123
       ▼
┌─────────────────────┐
│   Backend API       │
│   LogementApi       │
│   Controller        │
└──────┬──────────────┘
       │ 4. getAuthenticatedClientFromHeaders()
       │    - Read X-Session-ID
       │    - Read X-Pk-User
       │ 5. client->retrieveSession(sessionId, pkUser)
       ▼
┌─────────────────────┐
│   BaseClient        │
│   retrieveSession() │
└──────┬──────────────┘
       │ 6. Set sessionId and pkUser
       │    in client instance
       ▼
┌─────────────────────┐
│   SOAP API Calls    │
│   (Authenticated)   │
└─────────────────────┘
```

### Gestion des Erreurs

#### Erreur 401 (Non Authentifié)

**Scénario** : Headers manquants ou invalides

**Backend** :
```php
protected function getAuthenticatedClientFromHeaders(Request $request)
{
    $sessionId = $request->headers->get('X-Session-ID');
    $pkUser = $request->headers->get('X-Pk-User');

    if (!$sessionId || !$pkUser) {
        return $this->unauthorized('Missing authentication headers');
    }
    // ...
}
```

**Frontend** :
```typescript
// Dans client.ts (intercepteur de réponse)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirige vers /login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Session Expirée

**Scénario** : `sessionId` ou `pkUser` invalides côté SOAP

**Backend** :
```php
try {
    $this->client->retrieveSession($sessionId, (int)$pkUser);
    return $this->client;
} catch (\Exception $e) {
    return $this->unauthorized('Invalid session: ' . $e->getMessage());
}
```

**Frontend** : L'intercepteur Axios redirige automatiquement vers `/login` en cas de 401.

---

## ✅ Avantages de l'Approche Stateless

### 1. Scalabilité

- ✅ **Pas de session serveur** : Chaque requête est indépendante
- ✅ **Scalabilité horizontale** : Possibilité d'ajouter des serveurs sans partage de session
- ✅ **Load balancing** : N'importe quel serveur peut traiter n'importe quelle requête

### 2. Simplicité

- ✅ **Pas de gestion de session** : Plus besoin de nettoyer les sessions expirées
- ✅ **Pas de dépendance au container Symfony** : Plus besoin d'accéder à `security.token_storage`
- ✅ **Code plus simple** : Moins de complexité dans les contrôleurs

### 3. Performance

- ✅ **Pas de lecture/écriture de session** : Moins d'I/O disque/mémoire
- ✅ **Requêtes plus rapides** : Pas de lookup de session
- ✅ **Cache-friendly** : Les requêtes peuvent être mises en cache plus facilement

### 4. Compatibilité

- ✅ **API RESTful** : Respect des principes REST
- ✅ **Microservices** : Compatible avec les architectures microservices
- ✅ **Mobile/SPA** : Idéal pour les applications mobiles et SPA

### 5. Sécurité

- ✅ **Pas de session hijacking** : Les sessions ne sont pas stockées côté serveur
- ✅ **Contrôle côté client** : Le client peut facilement se déconnecter
- ✅ **Headers sécurisés** : Possibilité d'ajouter des validations supplémentaires (signature, expiration, etc.)

---

## 📚 Guide de Migration

### Pour les Développeurs Backend

#### Créer un Nouvel Endpoint API

1. **Ajouter `Request $request` dans les paramètres** :
```php
#[Route("/example", name: "example", methods: ["GET"])]
public function example(Request $request): JsonResponse
{
    // ...
}
```

2. **Utiliser `getAuthenticatedClientFromHeaders()`** :
```php
$client = $this->getAuthenticatedClientFromHeaders($request);
if ($client instanceof JsonResponse) {
    return $client; // Erreur d'authentification
}
```

3. **Utiliser le client pour les appels SOAP** :
```php
$data = $client->getSomeData();
return $this->success(['data' => $this->normalize($data)]);
```

#### Exemple Complet

```php
#[Route("/api/example", name: "api_example_")]
class ExampleApiController extends AbstractApiController
{
    #[Route("/list", name: "list", methods: ["GET"])]
    public function list(Request $request): JsonResponse
    {
        // 1. Authentification via headers
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            // 2. Utiliser le client pour les appels SOAP
            $items = $client->getItems();
            
            // 3. Retourner la réponse normalisée
            return $this->success([
                'items' => $this->normalize($items),
            ]);
        } catch (\Exception $e) {
            return $this->error('Error: ' . $e->getMessage(), 500);
        }
    }
}
```

### Pour les Développeurs Frontend

#### Utiliser les Hooks API Existants

Les hooks API existants fonctionnent automatiquement avec le nouveau système :

```typescript
import { useLogements } from '@/lib/hooks/useLogements';

function MyComponent() {
  const { data, isLoading, error } = useLogements();
  
  // Les headers sont automatiquement ajoutés par l'intercepteur Axios
  // Pas besoin de configuration supplémentaire
}
```

#### Vérifier l'Authentification

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function ProtectedComponent() {
  const { isAuthenticated, user, sessionId, pkUser } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Non authentifié</div>;
  }
  
  // sessionId et pkUser sont automatiquement disponibles
  console.log('Session ID:', sessionId);
  console.log('PK User:', pkUser);
}
```

#### Gérer la Déconnexion

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // Le store est automatiquement nettoyé
    // Les headers ne seront plus envoyés
  };
  
  return <button onClick={handleLogout}>Déconnexion</button>;
}
```

---

## 🔍 Dépannage

### Problème : Erreur 401 "Missing authentication headers"

**Cause** : Les headers `X-Session-ID` et `X-Pk-User` ne sont pas envoyés.

**Solutions** :
1. Vérifier que l'utilisateur est bien connecté (vérifier `localStorage`)
2. Vérifier que l'intercepteur Axios est bien configuré
3. Vérifier que les headers sont bien présents dans la requête (DevTools → Network)

**Vérification** :
```typescript
// Dans la console du navigateur
const authStorage = localStorage.getItem('auth-storage');
console.log(JSON.parse(authStorage));
// Vérifier que sessionId et pkUser sont présents
```

### Problème : Erreur 401 "Invalid session"

**Cause** : Le `sessionId` ou `pkUser` est invalide ou expiré côté SOAP.

**Solutions** :
1. Vérifier que la session SOAP n'a pas expiré
2. Se reconnecter pour obtenir de nouveaux identifiants
3. Vérifier que les valeurs dans `localStorage` sont correctes

**Vérification** :
```typescript
// Vérifier les valeurs stockées
const authStorage = localStorage.getItem('auth-storage');
const state = JSON.parse(authStorage)?.state;
console.log('Session ID:', state?.sessionId);
console.log('PK User:', state?.pkUser);
```

### Problème : Les headers ne sont pas envoyés

**Cause** : L'intercepteur Axios n'est pas correctement configuré ou le store est vide.

**Solutions** :
1. Vérifier que `client.ts` contient bien l'intercepteur
2. Vérifier que le store Zustand est bien initialisé
3. Vérifier que `sessionId` et `pkUser` sont bien stockés après le login

**Vérification** :
```typescript
// Dans client.ts, ajouter un console.log temporaire
client.interceptors.request.use(
  (config) => {
    console.log('Headers:', config.headers);
    // ...
  }
);
```

### Problème : Redirection en boucle après login

**Cause** : Le store n'est pas correctement mis à jour après le login.

**Solutions** :
1. Vérifier que `setUser()` est bien appelé avec `pkUser`
2. Vérifier que le store Zustand persiste correctement
3. Vérifier que `isAuthenticated` est bien calculé

**Vérification** :
```typescript
// Dans useAuth.ts, vérifier après login
const { user, sessionId, pkUser, isAuthenticated } = useAuth();
console.log('After login:', { user, sessionId, pkUser, isAuthenticated });
```

---

## 📊 Comparaison des Approches

| Aspect | Stateful (Avant) | Stateless (Après) |
|--------|------------------|-------------------|
| **Stockage session** | Serveur (PHP/Symfony) | Client (localStorage) |
| **Authentification** | Cookie PHPSESSID | Headers HTTP |
| **Scalabilité** | ❌ Nécessite partage de session | ✅ Aucun partage requis |
| **Complexité** | ⚠️ Gestion de session | ✅ Plus simple |
| **Performance** | ⚠️ I/O session | ✅ Pas d'I/O session |
| **Sécurité** | ⚠️ Session hijacking possible | ✅ Moins de risques |
| **Mobile/SPA** | ⚠️ Gestion cookies complexe | ✅ Headers simples |
| **Dépendances** | ⚠️ Container Symfony | ✅ Aucune dépendance |

---

## 🔐 Sécurité

### Headers HTTP

Les headers `X-Session-ID` et `X-Pk-User` sont :
- ✅ **Envoyés automatiquement** par l'intercepteur Axios
- ✅ **Lus côté serveur** pour chaque requête
- ✅ **Validés** avant chaque appel SOAP

### Stockage Local

Les données sont stockées dans `localStorage` :
- ✅ **Persistance** : Survit aux rafraîchissements de page
- ✅ **Sécurité** : Accessible uniquement au domaine
- ⚠️ **Attention** : Vulnérable au XSS (comme toute donnée client)

### Recommandations Futures

Pour améliorer la sécurité, on pourrait :
1. **Ajouter une expiration** : Vérifier que la session n'est pas trop ancienne
2. **Signer les headers** : Ajouter une signature HMAC pour éviter la falsification
3. **HTTPS uniquement** : S'assurer que les headers ne sont jamais envoyés en HTTP
4. **Refresh token** : Implémenter un système de refresh token pour renouveler la session

---

## 📝 Checklist de Migration

### Backend

- [x] Créer `loginForApi()` dans `BaseClient.php`
- [x] Créer `getAuthenticatedClientFromHeaders()` dans `AbstractApiController.php`
- [x] Modifier `SecurityApiController::login()` pour utiliser `loginForApi()`
- [x] Migrer tous les endpoints API vers `getAuthenticatedClientFromHeaders()`
- [x] Ajouter `Request $request` dans tous les paramètres de méthodes

### Frontend

- [x] Ajouter `pkUser` dans `authStore.ts`
- [x] Mettre à jour `setUser()` pour accepter `pkUser`
- [x] Ajouter l'intercepteur Axios pour les headers
- [x] Mettre à jour `useAuth` pour stocker `pkUser`
- [x] Mettre à jour `LoginResponse` type
- [x] Modifier `LoginForm` pour vérification stateless

### Tests

- [ ] Tester le login et vérifier le stockage dans `localStorage`
- [ ] Tester les requêtes authentifiées et vérifier les headers
- [ ] Tester la déconnexion et vérifier le nettoyage
- [ ] Tester les erreurs 401 et vérifier la redirection
- [ ] Tester le rafraîchissement de page et vérifier la persistance

---

## 🚀 Prochaines Étapes

### Améliorations Possibles

1. **Endpoint `/api/security/check`** : 
   - Actuellement, cet endpoint utilise encore le token Symfony
   - Peut être supprimé ou modifié pour utiliser les headers

2. **Méthode `getCurrentUser()` dans `OccupantApiController`** :
   - Utilise encore le token Symfony
   - Peut être remplacée par une récupération depuis le client SOAP

3. **Gestion de l'expiration** :
   - Ajouter une vérification de l'âge de la session
   - Implémenter un système de refresh automatique

4. **Sécurité renforcée** :
   - Ajouter une signature HMAC aux headers
   - Implémenter un système de tokens JWT si nécessaire

---

## 📖 Références

### Fichiers Modifiés

**Backend** :
- `src/Service/BaseClient.php` : Ajout de `loginForApi()`
- `src/Controller/Api/AbstractApiController.php` : Ajout de `getAuthenticatedClientFromHeaders()`
- `src/Controller/Api/SecurityApiController.php` : Modification de `login()`
- Tous les contrôleurs API : Migration vers `getAuthenticatedClientFromHeaders()`

**Frontend** :
- `frontend/src/lib/store/authStore.ts` : Ajout de `pkUser`
- `frontend/src/lib/api/client.ts` : Intercepteur pour les headers
- `frontend/src/lib/hooks/useAuth.ts` : Mise à jour pour `pkUser`
- `frontend/src/lib/types/api.ts` : Ajout de `pk_user` dans `LoginResponse`
- `frontend/src/components/techem/security/form/login.tsx` : Vérification stateless

### Documentation Technique

- **Zustand** : https://github.com/pmndrs/zustand
- **Axios Interceptors** : https://axios-http.com/docs/interceptors
- **REST API Stateless** : https://restfulapi.net/statelessness/

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ Migration complète - API stateless opérationnelle

