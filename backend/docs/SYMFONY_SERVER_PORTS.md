# 🔌 Ports du Serveur Symfony Local - Guide Complet

## 📋 Vue d'ensemble

Le serveur Symfony local (`symfony server`) peut utiliser différents ports selon la disponibilité et la configuration. Voici comment cela fonctionne.

---

## 🎯 Ports par Défaut

### Port 8000 (Par défaut)
- **Port standard** : Le serveur Symfony essaie d'utiliser le port **8000** par défaut
- **Usage** : Port le plus couramment utilisé pour le développement local
- **Avantage** : Port standard, facile à retenir

### Port 8001 (Port alternatif)
- **Port de secours** : Si le port 8000 est déjà occupé, le serveur utilise automatiquement **8001**
- **Usage** : Port alternatif quand 8000 n'est pas disponible
- **Avantage** : Permet d'avoir plusieurs serveurs Symfony en même temps

---

## 🔍 Pourquoi le Port Change ?

### 1. Port Déjà Occupé

Si le port 8000 est déjà utilisé par :
- Un autre serveur Symfony
- Un autre processus (Apache, Nginx, autre application)
- Un autre projet Symfony

Le serveur Symfony **cherche automatiquement le prochain port disponible** (8001, 8002, etc.)

### 2. Configuration Explicite

Vous pouvez forcer un port spécifique :

```bash
# Utiliser le port 8000 explicitement
symfony server:start -d --port=8000

# Utiliser le port 8001 explicitement
symfony server:start -d --port=8001

# Utiliser un autre port (ex: 8080)
symfony server:start -d --port=8080
```

### 3. Plusieurs Projets Symfony

Si vous avez plusieurs projets Symfony en cours d'exécution :
- **Projet 1** : Port 8000
- **Projet 2** : Port 8001
- **Projet 3** : Port 8002
- etc.

---

## 🛠️ Comment Vérifier le Port Utilisé

### 1. Vérifier le Statut du Serveur

```bash
symfony server:status
```

**Sortie** :
```
Local Web Server
    Listening on http://127.0.0.1:8001
    ...
```

### 2. Vérifier les Ports Occupés

```bash
# Vérifier le port 8000
lsof -i :8000

# Vérifier le port 8001
lsof -i :8001

# Voir tous les ports utilisés par Symfony
lsof -i | grep symfony
```

### 3. Vérifier dans les Logs

```bash
symfony server:log
```

---

## 📝 Quand Utiliser Quel Port ?

### ✅ Utiliser le Port 8000 (Recommandé)

**Quand** :
- ✅ C'est votre seul projet Symfony en cours
- ✅ Le port 8000 est libre
- ✅ Vous voulez utiliser le port standard
- ✅ C'est plus simple pour la configuration

**Avantages** :
- Port standard, facile à retenir
- Configuration frontend plus simple
- Moins de confusion

**Commande** :
```bash
symfony server:stop
symfony server:start -d --no-tls --port=8000
```

### ✅ Utiliser le Port 8001 (ou autre)

**Quand** :
- ✅ Le port 8000 est déjà occupé
- ✅ Vous avez plusieurs projets Symfony en cours
- ✅ Vous voulez isoler différents environnements
- ✅ Le serveur a automatiquement choisi ce port

**Avantages** :
- Permet d'avoir plusieurs serveurs en même temps
- Isolation des projets
- Pas besoin de libérer le port 8000

**Commande** :
```bash
symfony server:stop
symfony server:start -d --no-tls --port=8001
```

---

## 🔧 Configuration Frontend

### Port 8000

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# ou
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### Port 8001

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8001/api
# ou
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api
```

---

## 🎯 Bonnes Pratiques

### 1. Utiliser un Port Fixe en Développement

Pour éviter les changements de port, spécifiez toujours le port :

```bash
# Dans votre script de démarrage ou README
symfony server:start -d --no-tls --port=8000
```

### 2. Documenter le Port Utilisé

Dans votre `README.md` ou documentation :

```markdown
## Démarrage du Serveur

```bash
symfony server:start -d --no-tls --port=8000
```

L'API sera disponible sur : `http://localhost:8000/api`
```

### 3. Vérifier le Port Avant de Démarrer

```bash
# Vérifier si le port est libre
lsof -i :8000

# Si occupé, libérer le port ou utiliser un autre
```

### 4. Utiliser des Variables d'Environnement

Dans votre frontend, utilisez une variable d'environnement :

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:${SYMFONY_PORT:-8000}/api
```

---

## 🔄 Changer de Port

### Passer de 8001 à 8000

```bash
# 1. Arrêter le serveur actuel
symfony server:stop

# 2. Vérifier que le port 8000 est libre
lsof -i :8000

# 3. Si occupé, libérer le port (tuer le processus)
kill -9 $(lsof -t -i:8000)

# 4. Démarrer sur le port 8000
symfony server:start -d --no-tls --port=8000
```

### Passer de 8000 à 8001

```bash
# 1. Arrêter le serveur actuel
symfony server:stop

# 2. Démarrer sur le port 8001
symfony server:start -d --no-tls --port=8001

# 3. Mettre à jour la configuration frontend
# NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

---

## 🐛 Dépannage

### Problème : Le port change à chaque démarrage

**Solution** : Spécifiez toujours le port explicitement :

```bash
symfony server:start -d --no-tls --port=8000
```

### Problème : "Port already in use"

**Solution 1** : Libérer le port
```bash
# Trouver le processus
lsof -i :8000

# Tuer le processus (remplacer PID par le numéro du processus)
kill -9 PID
```

**Solution 2** : Utiliser un autre port
```bash
symfony server:start -d --no-tls --port=8001
```

### Problème : Le frontend ne se connecte pas

**Vérifications** :
1. Vérifier le port utilisé : `symfony server:status`
2. Vérifier l'URL dans `.env.local` du frontend
3. Vérifier que le serveur est bien démarré
4. Vérifier les logs : `symfony server:log`

---

## 📚 Résumé

| Port | Usage | Quand l'utiliser |
|------|-------|------------------|
| **8000** | Port standard | Projet unique, port libre, développement standard |
| **8001** | Port alternatif | Port 8000 occupé, plusieurs projets, port automatique |
| **Autre** | Port personnalisé | Configuration spécifique, isolation, préférence |

---

## ✅ Recommandation pour Votre Projet

Pour votre projet, je recommande d'**utiliser le port 8000** :

1. **C'est le port standard** et le plus simple
2. **Configuration frontend plus claire**
3. **Moins de confusion** pour l'équipe

**Commande** :
```bash
symfony server:stop
symfony server:start -d --no-tls --port=8000
```

**Configuration frontend** :
```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ **Guide complet des ports Symfony**

