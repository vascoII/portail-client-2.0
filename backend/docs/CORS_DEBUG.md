# 🔍 Debug CORS - Analyse et Corrections

## 📋 Problème Identifié

L'erreur CORS persiste malgré l'implémentation du listener. Analyse approfondie :

### Symptômes

1. **Redirection 307 vers HTTPS** : Les requêtes HTTP sont redirigées vers HTTPS
2. **Code d'état null** : La requête échoue avant d'atteindre le serveur
3. **Headers CORS absents** : Les headers ne sont pas présents dans la réponse

### Causes Probables

1. **Requêtes OPTIONS bloquées** : Les requêtes preflight (OPTIONS) sont bloquées par la sécurité Symfony
2. **Redirection HTTPS** : Le serveur force HTTPS avant que le listener ne s'exécute
3. **Priorité du listener** : Le listener ne s'exécute pas assez tôt dans le cycle de requête
4. **Firewall Symfony** : Les routes API ne sont pas correctement configurées dans le firewall

## ✅ Corrections Appliquées

### 1. Gestion des Requêtes OPTIONS dans le Listener

**Fichier** : `src/Listener/CorsListener.php`

**Changements** :
- ✅ Ajout de `onKernelRequest()` avec priorité **10000** (la plus haute)
- ✅ Gestion des requêtes OPTIONS **AVANT** la vérification de sécurité
- ✅ Utilisation de `strpos()` au lieu de `str_starts_with()` pour compatibilité PHP
- ✅ Vérification `isMainRequest()` pour éviter les sous-requêtes
- ✅ `stopPropagation()` pour empêcher le traitement ultérieur

### 2. Configuration du Firewall API

**Fichier** : `config/packages/security.yaml`

**Changements** :
- ✅ Ajout d'un firewall dédié pour `/api`
- ✅ Configuration `stateless: false` pour permettre les sessions
- ✅ Authenticateur personnalisé pour les routes API

### 3. Authenticator - Support OPTIONS

**Fichier** : `src/Security/AppCustomAuthenticator.php`

**Changements** :
- ✅ `supports()` retourne `false` pour les requêtes OPTIONS
- ✅ Empêche l'authentification sur les requêtes preflight

### 4. Access Control - OPTIONS Publiques

**Fichier** : `config/packages/security.yaml`

**Changements** :
- ✅ Règle `PUBLIC_ACCESS` pour les requêtes OPTIONS sur `/api`
- ✅ Placée en première position dans `access_control`

## 🔧 Tests de Vérification

### Test 1 : Requête OPTIONS (Preflight)

```bash
curl -X OPTIONS http://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i
```

**Résultat attendu** :
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Access-Control-Max-Age: 3600
```

### Test 2 : Requête GET Normale

```bash
curl -X GET http://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -H "Cookie: PHPSESSID=..." \
  -i
```

**Résultat attendu** :
```
HTTP/1.1 200 OK (ou 401 si non authentifié)
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
...
```

## 🐛 Dépannage Avancé

### Problème : Redirection 307 vers HTTPS

**Cause** : Le serveur web (Apache/Nginx) ou Symfony force HTTPS.

**Solutions** :

1. **Désactiver la redirection HTTPS en développement** :
   - Vérifier `.htaccess` ou configuration Nginx
   - Vérifier `config/packages/framework.yaml` pour `require_https`

2. **Utiliser HTTP en développement** :
   - S'assurer que le serveur Symfony écoute sur HTTP (pas HTTPS)
   - Vérifier que `NEXT_PUBLIC_API_URL=http://localhost:8000/api` (pas https)

### Problème : Le listener ne s'exécute pas

**Vérifications** :

1. **Vérifier que le service est enregistré** :
   ```bash
   php bin/console debug:event-dispatcher kernel.request | grep Cors
   ```

2. **Vérifier le cache** :
   ```bash
   php bin/console cache:clear
   rm -rf var/cache/*
   ```

3. **Vérifier les logs** :
   ```bash
   tail -f var/log/dev.log
   ```

### Problème : Headers CORS absents

**Vérifications** :

1. **Vérifier que la route commence par `/api`** :
   - Le listener ne s'exécute que pour les routes `/api/*`

2. **Vérifier l'origine** :
   - L'origine doit être dans `$allowedOrigins`
   - Vérifier dans la console du navigateur l'onglet Network → Headers → Request Headers → Origin

3. **Vérifier les sous-requêtes** :
   - Le listener vérifie `isMainRequest()` pour éviter les sous-requêtes

## 📝 Configuration Recommandée

### Pour le Développement

```php
// src/Listener/CorsListener.php
private array $allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];
```

### Pour la Production

```php
// src/Listener/CorsListener.php
private array $allowedOrigins = [
    'https://votre-domaine-frontend.com',
    'https://www.votre-domaine-frontend.com',
];
```

## 🔍 Commandes de Debug

### Vérifier les Event Listeners

```bash
php bin/console debug:event-dispatcher kernel.request
php bin/console debug:event-dispatcher kernel.response
```

### Vérifier les Routes API

```bash
php bin/console debug:router | grep api
```

### Tester CORS avec curl

```bash
# Test preflight
curl -X OPTIONS http://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test requête normale
curl -X GET http://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -v
```

### Vérifier les Headers dans le Navigateur

1. Ouvrir la console du navigateur (F12)
2. Onglet **Network**
3. Faire une requête vers `/api/security/check`
4. Cliquer sur la requête
5. Vérifier l'onglet **Headers** → **Response Headers**

## ⚠️ Points d'Attention

1. **Ne jamais utiliser `'*'` avec `Access-Control-Allow-Credentials: true`**
   - Cela cause une erreur CORS
   - Toujours spécifier l'origine explicitement

2. **Les requêtes OPTIONS doivent être gérées AVANT la sécurité**
   - Priorité du listener : 10000 (la plus haute)
   - Utiliser `stopPropagation()` pour empêcher le traitement ultérieur

3. **Vérifier que le serveur n'utilise pas HTTPS en développement**
   - La redirection HTTPS peut bloquer les requêtes CORS
   - Utiliser HTTP pour le développement local

4. **Vider le cache après chaque modification**
   ```bash
   php bin/console cache:clear
   ```

## 📚 Ressources

- [MDN - CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Symfony - Event Listeners](https://symfony.com/doc/current/event_dispatcher.html)
- [Symfony - Security Firewalls](https://symfony.com/doc/current/security.html#firewalls)

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 🔧 **Corrections appliquées - À tester**

