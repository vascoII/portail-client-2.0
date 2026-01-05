# 🔧 Correction CORS - Problème de Redirection HTTPS (307)

## 📋 Problème

L'erreur CORS persiste avec un code d'état **307 (Temporary Redirect)** vers HTTPS :

```
Blocage d'une requête multiorigines (Cross-Origin Request) : 
la politique « Same Origin » ne permet pas de consulter la ressource distante 
située sur http://localhost:8000/api/security/check. 
Raison : l'en-tête CORS « Access-Control-Allow-Origin » est manquant. 
Code d'état : 307.
```

### Cause

La requête HTTP est redirigée vers HTTPS **AVANT** que le listener CORS ne puisse ajouter les headers. La redirection 307 se produit au niveau du serveur web (Apache/Nginx) ou d'un listener Symfony qui s'exécute avant le listener CORS.

## ✅ Solution

### 1. Vérifier le Serveur Symfony

Le serveur Symfony doit écouter sur **HTTP** (pas HTTPS) en développement :

```bash
# Vérifier comment le serveur est démarré
# Si vous utilisez symfony server:
symfony server:start -d

# Ou si vous utilisez php -S:
php -S localhost:8000 -t public
```

### 2. Vérifier la Configuration du Frontend

Le frontend doit utiliser **HTTP** (pas HTTPS) :

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Listener CORS Amélioré

Le listener CORS a été amélioré pour :
- ✅ Ajouter les headers CORS même sur les redirections
- ✅ Gérer les requêtes OPTIONS (preflight)
- ✅ Vérifier `isMainRequest()` pour éviter les sous-requêtes

### 4. Si la Redirection Persiste

Si la redirection HTTPS persiste, elle peut venir de :

1. **Configuration Apache/Nginx** qui force HTTPS
2. **Header `Strict-Transport-Security`** dans `web.config` (IIS)
3. **Proxy inverse** qui redirige HTTP vers HTTPS

**Solution temporaire** : Modifier le listener pour forcer HTTP sur les routes API :

```php
// Dans onKernelRequest()
if (!$request->isSecure() && $request->getScheme() === 'http') {
    // Force the request to be treated as HTTP (not HTTPS)
    $request->server->set('HTTPS', 'off');
    $request->server->set('SERVER_PORT', '8000');
}
```

## 🔍 Diagnostic

### Test 1 : Vérifier la Redirection

```bash
curl -X GET http://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -v 2>&1 | grep -i "location\|307\|https"
```

Si vous voyez `Location: https://localhost:8000/...`, la redirection HTTPS est active.

### Test 2 : Vérifier le Serveur

```bash
# Vérifier sur quel port le serveur écoute
netstat -an | grep 8000
# ou
lsof -i :8000
```

### Test 3 : Tester avec HTTPS Désactivé

```bash
# Tester directement avec curl en ignorant SSL
curl -k -X GET https://localhost:8000/api/security/check \
  -H "Origin: http://localhost:3000" \
  -v
```

## 🛠️ Solutions Alternatives

### Solution A : Désactiver HTTPS en Développement

Si vous utilisez **symfony server**, vérifier la configuration :

```bash
# Vérifier la configuration
symfony server:status

# Redémarrer sans HTTPS
symfony server:stop
symfony server:start -d --no-tls
```

### Solution B : Modifier la Configuration Apache/Nginx

Si vous utilisez Apache, vérifier `.htaccess` :

```apache
# Désactiver la redirection HTTPS pour localhost en développement
RewriteCond %{HTTP_HOST} ^localhost [NC]
RewriteCond %{HTTPS} off
RewriteRule ^api/ - [L]  # Ne pas rediriger les routes API
```

### Solution C : Utiliser un Proxy Inverse

Si vous utilisez un proxy inverse (Nginx, Traefik, etc.), vérifier la configuration pour désactiver la redirection HTTPS en développement.

## 📝 Checklist

- [ ] Le serveur Symfony écoute sur HTTP (port 8000)
- [ ] Le frontend utilise `http://localhost:8000/api` (pas https)
- [ ] Le listener CORS est enregistré avec priorité 10000
- [ ] Les headers CORS sont ajoutés même sur les redirections
- [ ] Le cache Symfony est vidé : `php bin/console cache:clear`
- [ ] Le serveur Symfony est redémarré

## ⚠️ Important

**En production**, vous devrez :
1. Utiliser HTTPS pour toutes les requêtes
2. Configurer les origines autorisées dans `CorsListener::$allowedOrigins`
3. Vérifier que les headers CORS sont correctement configurés

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 🔧 **Correction appliquée - À tester**

