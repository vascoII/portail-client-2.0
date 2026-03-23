# 🔧 Correction de l'Erreur CORS

## 📋 Problème

Erreur CORS lors des requêtes depuis le frontend Next.js (`http://localhost:3000`) vers l'API Symfony (`http://localhost:8000/api`).

```
Blocage d'une requête multiorigine (Cross-Origin Request) : 
la politique « Same Origin » ne permet pas de consulter la ressource distante 
située sur http://localhost:8000/api/security/check. 
Raison : échec de la requête CORS. Code d'état : (null).
```

## ✅ Solution Implémentée

### 1. Création d'un EventListener CORS

Un `CorsListener` a été créé pour gérer automatiquement les headers CORS pour toutes les routes API.

**Fichier** : `src/Listener/CorsListener.php`

**Fonctionnalités** :
- ✅ Ajoute les headers CORS nécessaires à toutes les réponses API
- ✅ Gère les requêtes preflight (OPTIONS)
- ✅ Autorise les origines configurées (localhost:3000, localhost:3001)
- ✅ Supporte les credentials (cookies de session)

### 2. Configuration du Service

Le listener a été enregistré dans `config/services.yaml` :

```yaml
App\Listener\CorsListener:
  tags:
    - { name: kernel.event_subscriber }
```

### 3. Headers CORS Configurés

Les headers suivants sont automatiquement ajoutés aux réponses API :

- `Access-Control-Allow-Origin`: Origine autorisée (ex: `http://localhost:3000`)
- `Access-Control-Allow-Credentials`: `true` (pour les cookies de session)
- `Access-Control-Allow-Methods`: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, X-Requested-With, Accept, Origin`
- `Access-Control-Expose-Headers`: `Content-Length, Content-Type`
- `Access-Control-Max-Age`: `3600` (durée de cache pour preflight)

## 🔍 Vérification

### 1. Vider le cache Symfony

```bash
php bin/console cache:clear
```

### 2. Redémarrer le serveur Symfony

```bash
# Si vous utilisez symfony server
symfony server:stop
symfony server:start

# Ou si vous utilisez php -S
php -S localhost:8000 -t public
```

### 3. Tester la requête CORS

Ouvrez la console du navigateur (F12) et testez :

```javascript
fetch('http://localhost:8000/api/security/check', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### 4. Vérifier les Headers de Réponse

Dans l'onglet **Network** de la console du navigateur :
1. Faites une requête vers `/api/security/check`
2. Cliquez sur la requête
3. Vérifiez l'onglet **Headers** → **Response Headers**
4. Vous devriez voir :
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Credentials: true`
   - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`

## 🔧 Configuration Avancée

### Ajouter d'autres origines autorisées

Modifiez `src/Listener/CorsListener.php` :

```php
private array $allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://votre-domaine-production.com', // Production
];
```

### Autoriser toutes les origines (DÉVELOPPEMENT UNIQUEMENT)

⚠️ **ATTENTION** : Ne jamais utiliser en production !

```php
private array $allowedOrigins = ['*'];
```

### Ajouter d'autres headers autorisés

```php
private array $allowedHeaders = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Custom-Header', // Votre header personnalisé
];
```

## 🐛 Dépannage

### Problème : Les headers CORS ne sont pas présents

**Solution** :
1. Vérifiez que le cache Symfony est vidé : `php bin/console cache:clear`
2. Vérifiez que le service est bien enregistré dans `config/services.yaml`
3. Vérifiez que le fichier `src/Listener/CorsListener.php` existe
4. Redémarrez le serveur Symfony

### Problème : Erreur "Credentials flag is 'true', but the 'Access-Control-Allow-Origin' header is '*"

**Solution** :
- Ne pas utiliser `'*'` comme origine si `Access-Control-Allow-Credentials` est `true`
- Spécifier explicitement l'origine : `'http://localhost:3000'`

### Problème : La requête OPTIONS (preflight) échoue

**Solution** :
- Le listener gère automatiquement les requêtes OPTIONS
- Vérifiez que la méthode `OPTIONS` est dans `$allowedMethods`
- Vérifiez que le serveur Symfony accepte les requêtes OPTIONS

### Problème : Les cookies ne sont pas envoyés

**Solution** :
1. Vérifiez que `withCredentials: true` est configuré dans `frontend/src/lib/api/client.ts`
2. Vérifiez que `Access-Control-Allow-Credentials: true` est présent dans les headers
3. Vérifiez que l'origine n'est pas `'*'` (doit être explicite)

## 📚 Ressources

- [MDN - CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Symfony - Event Listeners](https://symfony.com/doc/current/event_dispatcher.html)
- [CORS Headers Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ **Correction CORS implémentée**

