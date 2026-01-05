# Guide d'Authentification API - Techem Portail Client

## Vue d'ensemble

L'API utilise **l'authentification par session Symfony**. Contrairement à une API REST stateless avec JWT, cette API est **stateful** et utilise des cookies de session pour maintenir l'authentification.

---

## 🔐 Système d'authentification actuel

### Architecture

- **Type** : Authentification par session (stateful)
- **Mécanisme** : Cookies de session Symfony
- **Authenticator** : `AppCustomAuthenticator` (authentification SOAP)
- **Token** : `SoapSessionToken` avec attributs SOAP

### Flux d'authentification

```
1. Client → POST /login (credentials)
2. Symfony → Authenticate via SOAP
3. Symfony → Crée une session PHP
4. Symfony → Retourne un cookie de session (PHPSESSID)
5. Client → Utilise le cookie pour les requêtes suivantes
```

---

## 📋 Méthodes d'authentification

### 1. Connexion via API (Recommandé pour les applications API)

**Endpoint** : `POST /api/security/login`

**Format** : `application/json` ou `application/x-www-form-urlencoded`

**Paramètres** :
- `username` ou `_username` : Email ou identifiant
- `password` ou `_password` : Mot de passe

**Exemple avec JSON** :
```bash
curl -X POST https://votre-domaine.com/api/security/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}' \
  -c cookies.txt
```

**Exemple avec JavaScript** :
```javascript
const response = await fetch('https://votre-domaine.com/api/security/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Important : inclut les cookies
});

const data = await response.json();
console.log(data);
// {
//   "success": true,
//   "status": 200,
//   "message": "Login successful",
//   "data": {
//     "user": {...},
//     "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"],
//     "session_id": "..."
//   }
// }
```

**Réponse JSON** :
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "PKUser": "123",
      "UserName": "Dupont",
      "EMail": "user@example.com",
      ...
    },
    "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"],
    "session_id": "..."
  }
}
```

**Avantages** :
- ✅ Retourne JSON (pas de redirection)
- ✅ Plus adapté pour les applications API
- ✅ Retourne directement les informations de l'utilisateur
- ✅ Gestion d'erreur standardisée

---

### 2. Connexion standard (Web traditionnel)

**Endpoint** : `POST /login`

**Format** : `application/x-www-form-urlencoded` ou `multipart/form-data`

**Paramètres** :
- `_username` : Email ou identifiant
- `_password` : Mot de passe

**Exemple avec cURL** :
```bash
curl -X POST https://votre-domaine.com/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "_username=user@example.com&_password=password123" \
  -c cookies.txt \
  -v
```

**Exemple avec JavaScript (fetch)** :
```javascript
const formData = new FormData();
formData.append('_username', 'user@example.com');
formData.append('_password', 'password123');

fetch('https://votre-domaine.com/login', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Important : inclut les cookies
})
.then(response => {
  if (response.ok) {
    // La session est maintenant active
    // Les cookies sont automatiquement gérés par le navigateur
    return response.json();
  }
  throw new Error('Login failed');
});
```

**Exemple avec Axios** :
```javascript
import axios from 'axios';

// Configurer axios pour inclure les cookies
axios.defaults.withCredentials = true;

const response = await axios.post('https://votre-domaine.com/login', {
  _username: 'user@example.com',
  _password: 'password123'
}, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// La session est maintenant active
```

**Réponse** :
- **Succès** : Redirection HTTP (302) vers la page d'accueil
- **Échec** : Redirection vers `/login` avec erreur

**Important** : Après la connexion, le cookie `PHPSESSID` est automatiquement envoyé avec chaque requête suivante.

**Note** : Cette méthode est principalement pour les formulaires web. Pour les applications API, utilisez `/api/security/login`.

---

### 3. Connexion via paramètre (Liens spéciaux)

**Endpoint** : `GET /api/security/login/{param}`

Utilisé pour les liens de connexion spéciaux (ex: liens dans les emails).

**Exemple** :
```bash
curl -X GET "https://votre-domaine.com/api/security/login/abc123xyz" \
  -c cookies.txt
```

**Réponse JSON** :
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {...},
    "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"],
    "session_id": "..."
  }
}
```

---

## 🔑 Utilisation des endpoints API après authentification

### Avec cURL

```bash
# 1. Se connecter et sauvegarder les cookies
curl -X POST https://votre-domaine.com/login \
  -d "_username=user@example.com&_password=password123" \
  -c cookies.txt

# 2. Utiliser les cookies pour les requêtes API
curl -X GET "https://votre-domaine.com/api/dashboard" \
  -b cookies.txt \
  -H "Accept: application/json"
```

### Avec JavaScript (navigateur)

```javascript
// 1. Se connecter
const loginResponse = await fetch('https://votre-domaine.com/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    _username: 'user@example.com',
    _password: 'password123'
  }),
  credentials: 'include' // CRUCIAL : inclut les cookies
});

// 2. Utiliser l'API (les cookies sont automatiquement envoyés)
const dashboardResponse = await fetch('https://votre-domaine.com/api/dashboard', {
  credentials: 'include' // CRUCIAL : inclut les cookies
});

const data = await dashboardResponse.json();
console.log(data);
```

### Avec Axios

```javascript
import axios from 'axios';

// Configurer axios globalement
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://votre-domaine.com';

// 1. Se connecter
await axios.post('/login', {
  _username: 'user@example.com',
  _password: 'password123'
}, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});

// 2. Utiliser l'API (les cookies sont automatiquement envoyés)
const response = await axios.get('/api/dashboard');
console.log(response.data);
```

### Avec React

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// Configurer axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://votre-domaine.com';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState(null);

  const login = async (username, password) => {
    try {
      await axios.post('/login', {
        _username: username,
        _password: password
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  useEffect(() => {
    if (authenticated) {
      // Les cookies sont automatiquement envoyés
      axios.get('/api/dashboard')
        .then(response => setData(response.data))
        .catch(error => {
          if (error.response?.status === 401) {
            setAuthenticated(false);
          }
        });
    }
  }, [authenticated]);

  return (
    // Votre composant
  );
}
```

---

## ✅ Vérification de l'authentification

### Vérifier le statut d'authentification

**Endpoint** : `GET /api/security/check`

```bash
curl -X GET "https://votre-domaine.com/api/security/check" \
  -b cookies.txt \
  -H "Accept: application/json"
```

**Réponse si authentifié** :
```json
{
  "success": true,
  "status": 200,
  "data": {
    "authenticated": true,
    "user": {...},
    "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"]
  }
}
```

**Réponse si non authentifié** :
```json
{
  "success": true,
  "status": 200,
  "data": {
    "authenticated": false
  }
}
```

### Obtenir les informations de l'utilisateur

**Endpoint** : `GET /api/security/me`

```bash
curl -X GET "https://votre-domaine.com/api/security/me" \
  -b cookies.txt
```

---

## 🚪 Déconnexion

**Endpoint** : `POST /api/security/logout`

```bash
curl -X POST "https://votre-domaine.com/api/security/logout" \
  -b cookies.txt
```

**Réponse** :
```json
{
  "success": true,
  "status": 200,
  "message": "Logout successful"
}
```

**Important** : Après la déconnexion, supprimez le fichier de cookies côté client.

---

## ⚠️ Gestion des erreurs d'authentification

### Erreur 401 Unauthorized

Si vous recevez une erreur 401, cela signifie que :
- La session a expiré
- Les cookies ne sont pas envoyés
- L'utilisateur n'est pas authentifié

**Exemple de réponse** :
```json
{
  "success": false,
  "status": 401,
  "message": "Session expired or invalid"
}
```

**Solution** : Reconnectez l'utilisateur.

### Exemple de gestion d'erreur

```javascript
async function apiCall(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include'
  });

  if (response.status === 401) {
    // Session expirée, rediriger vers la page de connexion
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

---

## 🔒 Sécurité et bonnes pratiques

### 1. Cookies sécurisés

Assurez-vous que votre application Symfony est configurée pour utiliser des cookies sécurisés en production :

```yaml
# config/packages/framework.yaml
framework:
    session:
        cookie_secure: true  # HTTPS uniquement
        cookie_httponly: true  # Protection XSS
        cookie_samesite: 'lax'  # Protection CSRF
```

### 2. CORS (Cross-Origin Resource Sharing)

Si votre frontend est sur un domaine différent, configurez CORS :

```yaml
# config/packages/nelmio_cors.yaml
nelmio_cors:
    defaults:
        allow_credentials: true
        allow_origin: ['https://votre-frontend.com']
        allow_headers: ['Content-Type', 'Authorization']
        allow_methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
```

### 3. Timeout de session

La session expire après un certain temps d'inactivité. Vérifiez régulièrement l'authentification :

```javascript
// Vérifier l'authentification toutes les 5 minutes
setInterval(async () => {
  const response = await fetch('/api/security/check', {
    credentials: 'include'
  });
  const data = await response.json();
  if (!data.data.authenticated) {
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  }
}, 5 * 60 * 1000);
```

---

## 📱 Exemple complet : Application React

```jsx
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://votre-domaine.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: (username, password) => {
    // Utiliser l'endpoint API qui retourne JSON
    return api.post('/api/security/login', {
      username: username,
      password: password
    });
  },
  
  logout: () => {
    return api.post('/api/security/logout');
  },
  
  check: () => {
    return api.get('/api/security/check');
  },
  
  me: () => {
    return api.get('/api/security/me');
  }
};

export const dashboard = {
  get: () => {
    return api.get('/api/dashboard');
  }
};

export default api;
```

```jsx
// Login.jsx
import { useState } from 'react';
import { auth } from './api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.login(username, password);
      // Rediriger vers la page d'accueil
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Email ou identifiant"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <button type="submit">Se connecter</button>
    </form>
  );
}
```

---

## 🔄 Alternative : API Stateless avec JWT (Futur)

Si vous souhaitez une API vraiment stateless (sans sessions), vous devrez implémenter JWT. Voici un exemple de ce que cela pourrait ressembler :

### Endpoint de login JWT (à implémenter)

```php
// POST /api/auth/login
{
  "username": "user@example.com",
  "password": "password123"
}

// Réponse
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### Utilisation du token

```javascript
// Stocker le token
localStorage.setItem('token', response.data.token);

// Utiliser le token dans les requêtes
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

**Note** : Cette fonctionnalité n'est pas encore implémentée. L'API actuelle utilise uniquement les sessions.

---

## 📝 Résumé

### Méthode recommandée pour les applications API

1. **Connexion** : `POST /api/security/login` avec `username` et `password` (JSON)
2. **Cookies** : Le cookie `PHPSESSID` est automatiquement géré
3. **Requêtes API** : Inclure `credentials: 'include'` (JavaScript) ou `-b cookies.txt` (cURL)
4. **Vérification** : `GET /api/security/check` pour vérifier l'authentification
5. **Déconnexion** : `POST /api/security/logout`

### Méthode alternative (Web traditionnel)

1. **Connexion** : `POST /login` avec `_username` et `_password` (form-data)
2. **Cookies** : Le cookie `PHPSESSID` est automatiquement géré
3. **Requêtes API** : Inclure `credentials: 'include'` (JavaScript) ou `-b cookies.txt` (cURL)

---

## ❓ Questions fréquentes

### Q: Pourquoi utiliser des sessions au lieu de JWT ?

**R:** L'application existante utilise déjà Symfony Security avec des sessions. Pour une migration vers JWT, il faudrait :
- Installer `lexik/jwt-authentication-bundle`
- Créer un nouvel authenticator JWT
- Modifier tous les contrôleurs API
- Gérer le refresh des tokens

### Q: Comment gérer l'authentification dans une application mobile ?

**R:** Les applications mobiles peuvent utiliser les cookies de session, mais c'est moins pratique. Pour une meilleure expérience mobile, envisagez d'implémenter JWT.

### Q: Les sessions fonctionnent-elles avec CORS ?

**R:** Oui, à condition de configurer CORS correctement avec `allow_credentials: true` et de définir les origines autorisées.

### Q: Comment tester l'API avec Postman ?

**R:** 
1. Faites une requête POST vers `/login` avec les credentials
2. Postman sauvegarde automatiquement les cookies
3. Utilisez ces cookies pour les requêtes suivantes

---

## 🔗 Ressources

- [Documentation Symfony Security](https://symfony.com/doc/current/security.html)
- [Documentation API complète](./API_DOCUMENTATION.md)
- [Guide de migration API](./API_MIGRATION_STRATEGY.md)

