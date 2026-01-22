# Roadmap d'Implémentation : Endpoint `/api/health/database`

## 📋 Vue d'ensemble

Cette roadmap décrit les étapes nécessaires pour implémenter un endpoint de santé (`health check`) qui valide la connexion à une base de données Oracle et l'utilisation de Doctrine ORM.

**Endpoint cible :** `GET /api/health/database`

**Objectif :** Créer un endpoint simple qui effectue un "ping" de la base de données Oracle pour valider :
- La connexion à la base de données Oracle
- La configuration Doctrine
- L'extension PHP OCI8

---

## 🎯 Étapes d'Implémentation

### Étape 1 : Installation d'Oracle Instant Client dans Docker

#### 1.1. Modifier le Dockerfile principal (`Dockerfile`)

**Fichier :** `/backend/Dockerfile`

**Actions :**
- Ajouter l'installation d'Oracle Instant Client (version 21 ou 23)
- Installer les dépendances système nécessaires (`libaio1`, `unzip`)
- Configurer les variables d'environnement Oracle
- Installer l'extension PHP OCI8

**Modifications à apporter :**

```dockerfile
# Après la ligne 3 (FROM php:8.3-cli)
# Ajouter l'installation d'Oracle Instant Client

# Install Oracle Instant Client dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libaio1 \
    wget \
    unzip && \
    rm -rf /var/lib/apt/lists/*

# Install Oracle Instant Client 21
RUN mkdir -p /opt/oracle && \
    cd /opt/oracle && \
    wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    unzip instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    rm -rf instantclient-basic-linux.x64-21.1.0.0.0.zip && \
    cd instantclient_21_1 && \
    rm -f *jdbc* *occi* *mysql* *README* *jar uidrvci genezi adrci && \
    echo /opt/oracle/instantclient_21_1 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

# Set Oracle environment variables
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$LD_LIBRARY_PATH
ENV ORACLE_HOME=/opt/oracle/instantclient_21_1

# Install PHP OCI8 extension
RUN docker-php-ext-configure oci8 --with-oci8=instantclient,/opt/oracle/instantclient_21_1 && \
    docker-php-ext-install oci8
```

**Note :** Pour PHP 8.3, il faudra peut-être utiliser PECL pour installer OCI8 si `docker-php-ext-install` ne le supporte pas directement :

```dockerfile
# Alternative avec PECL
RUN pecl install oci8 && \
    docker-php-ext-enable oci8
```

#### 1.2. Modifier le Dockerfile.preview

**Fichier :** `/backend/Dockerfile.preview`

**Actions :**
- Appliquer les mêmes modifications dans le stage `builder` (ligne 2-17)
- Appliquer les mêmes modifications dans le stage final (ligne 36-47)

**Points d'attention :**
- Les dépendances Oracle doivent être installées dans les deux stages
- L'extension OCI8 doit être disponible dans le stage final

---

### Étape 2 : Configuration de Doctrine pour Oracle

#### 2.1. Vérifier/Modifier la configuration Doctrine

**Fichier :** `/backend/config/packages/doctrine.yaml`

**Actions :**
- Vérifier que la configuration supporte Oracle
- Ajouter la configuration spécifique Oracle si nécessaire
- Configurer le driver Oracle

**Configuration à ajouter/modifier :**

```yaml
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
        driver: 'oci8'  # Driver Oracle (recommandé pour performance)
        server_version: '21'  # Version Oracle (à adapter selon votre version)
        charset: 'AL32UTF8'  # Encodage Oracle recommandé
        
        # Options spécifiques Oracle
        options:
            1002: 'SET NAMES UTF8'  # Pour la compatibilité
        
        # Performance : désactiver le profiling en production
        profiling_collect_backtrace: '%kernel.debug%'
        
        # Note: DBAL est utilisé (pas ORM) pour maximiser les performances
        # Voir section "Recommandations de Performance" pour plus de détails
    orm:
        # ... (configuration existante)
        # Note: ORM n'est pas recommandé pour les requêtes lourdes Oracle
        # Utiliser DBAL directement pour de meilleures performances
```

#### 2.2. Vérifier le format de DATABASE_URL

**Fichier :** `.env` ou `.env.local`

**Format attendu pour Oracle :**

```env
# Format Oracle avec OCI8
DATABASE_URL="oci8://username:password@hostname:1521/service_name"

# Ou avec SID
DATABASE_URL="oci8://username:password@hostname:1521/sid"
```

**Exemple :**
```env
DATABASE_URL="oci8://myuser:mypassword@oracle-server.example.com:1521/XE"
```

---

### Étape 3 : Création du Contrôleur Health

#### 3.1. Créer le contrôleur HealthApiController

**Fichier :** `/backend/src/Controller/Api/HealthApiController.php`

**Note :** Comme d'autres endpoints existent déjà sans authentification (ex: `/login`), nous pouvons utiliser `AbstractController` directement sans problème.

**Structure :**

```php
<?php

namespace App\Controller\Api;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * API Controller for Health Checks
 * 
 * Note: Cet endpoint n'utilise pas d'authentification, comme d'autres endpoints
 * existants (ex: /login). C'est une pratique courante pour les health checks.
 */
#[Route("/api/health", name: "api_health_")]
class HealthApiController extends AbstractController
{
    public function __construct(
        private Connection $connection,
        private ?LoggerInterface $logger = null
    ) {
    }

    /**
     * Health check endpoint for database connection
     * 
     * Effectue un "ping" de la base de données Oracle pour valider :
     * - La connexion à Oracle
     * - La configuration Doctrine DBAL
     * - L'extension PHP OCI8
     * 
     * @param Request $request
     * @return JsonResponse
     */
    #[Route("/database", name: "database", methods: ["GET"])]
    public function databaseHealth(Request $request): JsonResponse
    {
        try {
            // Test de connexion avec SELECT 1 FROM DUAL (requête Oracle standard pour ping)
            $result = $this->connection->executeQuery('SELECT 1 FROM DUAL')->fetchOne();
            
            if ($result != 1) {
                throw new \RuntimeException('Unexpected query result');
            }
            
            // Récupérer des informations sur la connexion
            $serverVersion = $this->connection->getServerVersion();
            $databaseName = $this->connection->getDatabase();
            $driverName = $this->connection->getDriver()->getName();
            
            return new JsonResponse([
                'success' => true,
                'status' => 'healthy',
                'data' => [
                    'database' => [
                        'connected' => true,
                        'server_version' => $serverVersion,
                        'database_name' => $databaseName,
                        'driver' => $driverName,
                    ],
                    'timestamp' => (new \DateTime())->format('c'),
                ],
            ], 200);
            
        } catch (Exception $e) {
            if ($this->logger) {
                $this->logger->error('Database health check failed', [
                    'exception' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
            
            return new JsonResponse([
                'success' => false,
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'timestamp' => (new \DateTime())->format('c'),
            ], 503);
        }
    }
}
```

---

## ⚡ Recommandations de Performance : PDO vs DBAL vs ORM

### Contexte et Problématique

**Situation :** La base de données Oracle source n'est pas optimisée pour l'application et les requêtes seront probablement lourdes. **La performance est la priorité absolue.**

### Comparaison des Approches

#### 1. **PDO Direct** (Performance maximale, mais moins de fonctionnalités)

**Avantages :**
- ✅ Performance maximale (couche minimale)
- ✅ Contrôle total sur les requêtes
- ✅ Pas d'overhead d'abstraction

**Inconvénients :**
- ❌ Pas de portabilité entre bases de données
- ❌ Gestion manuelle des erreurs
- ❌ Pas d'helpers Doctrine (query builder, etc.)
- ❌ Pas d'intégration Symfony native

**Quand l'utiliser :**
- Requêtes très spécifiques Oracle avec hints
- Requêtes critiques où chaque milliseconde compte
- Requêtes qui nécessitent des fonctionnalités Oracle natives non supportées par DBAL

**Exemple :**
```php
$pdo = new \PDO(
    "oci:dbname=//host:1521/service",
    $username,
    $password
);
$stmt = $pdo->prepare("SELECT /*+ FIRST_ROWS(100) */ * FROM table WHERE id = :id");
$stmt->execute(['id' => $id]);
$result = $stmt->fetchAll(\PDO::FETCH_ASSOC);
```

#### 2. **Doctrine DBAL** (Recommandé pour ce projet) ⭐

**Avantages :**
- ✅ Performance excellente (très proche de PDO)
- ✅ Abstraction utile sans overhead significatif
- ✅ Intégration Symfony native
- ✅ Helpers utiles (query builder, types, etc.)
- ✅ Gestion des transactions simplifiée
- ✅ Support des requêtes natives Oracle
- ✅ Portabilité partielle (si besoin de changer de BDD plus tard)

**Inconvénients :**
- ⚠️ Légèrement plus lent que PDO direct (overhead minimal)
- ⚠️ Quelques limitations sur les fonctionnalités Oracle très avancées

**Quand l'utiliser :**
- **Recommandé pour la majorité des cas** dans ce projet
- Requêtes complexes avec besoin d'abstraction
- Besoin d'utiliser le query builder pour requêtes dynamiques
- Intégration avec l'écosystème Symfony/Doctrine

**Exemple :**
```php
use Doctrine\DBAL\Connection;

// Injection via constructeur
public function __construct(private Connection $connection) {}

// Requête simple optimisée
$result = $this->connection->executeQuery(
    'SELECT * FROM table WHERE id = ?',
    [$id],
    [\Doctrine\DBAL\ParameterType::INTEGER]
)->fetchAssociative();

// Requête avec hints Oracle pour performance
$sql = "SELECT /*+ FIRST_ROWS(100) INDEX(table idx_id) */ 
        * FROM table WHERE id = :id";
$result = $this->connection->executeQuery($sql, ['id' => $id])->fetchAssociative();
```

#### 3. **Doctrine ORM** (Non recommandé pour ce projet)

**Avantages :**
- ✅ Mapping objet-relationnel automatique
- ✅ Gestion des entités et relations
- ✅ Cache de requêtes intégré

**Inconvénients :**
- ❌ **Overhead significatif** (trop lourd pour requêtes lourdes)
- ❌ Génération de requêtes SQL parfois non optimale
- ❌ Difficulté à utiliser des hints Oracle
- ❌ Cache et proxies ajoutent de la complexité
- ❌ Moins de contrôle sur les requêtes SQL générées

**Quand l'utiliser :**
- Applications avec modèle de données complexe
- Besoin de relations automatiques
- Quand la performance n'est pas critique

**Conclusion :** **Non recommandé** pour ce projet car la performance est prioritaire.

---

### 🎯 Recommandation Finale : Doctrine DBAL

**Pourquoi DBAL est le meilleur choix :**

1. **Performance excellente** : Overhead minimal (~2-5% vs PDO), négligeable pour la plupart des cas
2. **Flexibilité** : Support des requêtes SQL natives Oracle avec hints
3. **Intégration** : Déjà utilisé dans le projet (voir `MIGRATION_SOAP_TO_ORACLE.md`)
4. **Maintenabilité** : Code plus propre et maintenable
5. **Fonctionnalités utiles** : Query builder pour requêtes dynamiques, gestion des types, etc.

### 📋 Bonnes Pratiques pour Optimiser les Performances avec DBAL

#### 1. Utiliser des Requêtes Natives avec Hints Oracle

```php
// Exemple avec hint Oracle pour forcer l'utilisation d'un index
$sql = "SELECT /*+ INDEX(table_name index_name) */ 
        column1, column2 
        FROM table_name 
        WHERE condition = :param";

$result = $this->connection->executeQuery($sql, ['param' => $value])
    ->fetchAllAssociative();
```

#### 2. Préparer les Requêtes pour Réutilisation

```php
// Préparer une fois, exécuter plusieurs fois
$stmt = $this->connection->prepare('SELECT * FROM table WHERE id = :id');

// Exécuter avec différents paramètres
$result1 = $stmt->executeQuery(['id' => 1])->fetchAssociative();
$result2 = $stmt->executeQuery(['id' => 2])->fetchAssociative();
```

#### 3. Utiliser des Fetch Modes Optimisés

```php
// fetchAssociative() est plus rapide que fetchAll() pour une seule ligne
$row = $this->connection->executeQuery($sql)->fetchAssociative();

// fetchAllAssociative() pour plusieurs lignes (plus rapide que fetchAll())
$rows = $this->connection->executeQuery($sql)->fetchAllAssociative();

// fetchOne() pour une seule valeur
$count = $this->connection->executeQuery($sql)->fetchOne();
```

#### 4. Pagination Efficace avec ROWNUM (Oracle)

```php
// Pagination Oracle optimisée
$offset = ($page - 1) * $limit;
$sql = "SELECT * FROM (
    SELECT a.*, ROWNUM rnum FROM (
        SELECT * FROM table_name 
        WHERE condition = :param 
        ORDER BY id
    ) a WHERE ROWNUM <= :max_row
) WHERE rnum > :min_row";

$result = $this->connection->executeQuery($sql, [
    'param' => $value,
    'max_row' => $offset + $limit,
    'min_row' => $offset
])->fetchAllAssociative();
```

#### 5. Utiliser des Transactions pour Opérations Multiples

```php
$this->connection->beginTransaction();
try {
    $this->connection->executeStatement('INSERT INTO ...');
    $this->connection->executeStatement('UPDATE ...');
    $this->connection->commit();
} catch (\Exception $e) {
    $this->connection->rollBack();
    throw $e;
}
```

#### 6. Éviter le N+1 Problem

```php
// ❌ Mauvais : N+1 queries
foreach ($ids as $id) {
    $row = $this->connection->executeQuery(
        'SELECT * FROM table WHERE id = ?', 
        [$id]
    )->fetchAssociative();
}

// ✅ Bon : Une seule query
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$sql = "SELECT * FROM table WHERE id IN ($placeholders)";
$rows = $this->connection->executeQuery($sql, $ids)->fetchAllAssociative();
```

#### 7. Configuration DBAL pour Performance

**Fichier :** `config/packages/doctrine.yaml`

```yaml
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
        driver: 'oci8'
        server_version: '21'
        charset: 'AL32UTF8'
        
        # Options de performance
        options:
            # Timeout de connexion
            1002: 'SET NAMES UTF8'
        
        # Pool de connexions (si supporté)
        # Note: Vérifier la configuration selon votre version de Doctrine
        
        profiling_collect_backtrace: '%kernel.debug%'  # Désactiver en prod
```

#### 8. Cache de Requêtes (pour requêtes répétitives)

```php
use Symfony\Contracts\Cache\CacheInterface;

// Dans un service
public function __construct(
    private Connection $connection,
    private CacheInterface $cache
) {}

public function getCachedData(int $id): array
{
    return $this->cache->get("data_$id", function() use ($id) {
        return $this->connection->executeQuery(
            'SELECT * FROM table WHERE id = ?',
            [$id]
        )->fetchAssociative();
    });
}
```

### 🔍 Quand Utiliser PDO Direct au lieu de DBAL

Utilisez PDO direct uniquement si :
- Vous avez besoin de fonctionnalités Oracle très spécifiques non supportées par DBAL
- Vous avez mesuré que DBAL est un goulot d'étranglement (rare)
- Vous avez besoin d'utiliser des types Oracle natifs complexes

**Exemple de cas d'usage PDO :**
```php
// Utilisation de types Oracle spécifiques avec PDO
$pdo = new \PDO($dsn, $user, $pass);
$stmt = $pdo->prepare("
    BEGIN 
        :result := package.procedure(:param1, :param2);
    END;
");
$stmt->bindParam(':result', $result, \PDO::PARAM_STR, 4000);
$stmt->bindParam(':param1', $param1);
$stmt->bindParam(':param2', $param2);
$stmt->execute();
```

---

### Étape 4 : Configuration des Services Symfony

#### 4.1. Vérifier l'injection de dépendances

**Fichier :** `/backend/config/services.yaml`

**Actions :**
- Vérifier que `Doctrine\DBAL\Connection` est automatiquement injectable
- Si nécessaire, configurer explicitement le service

**Configuration (généralement automatique avec DoctrineBundle) :**

```yaml
services:
    # ... configuration existante
    
    # Doctrine Connection est automatiquement disponible
    # Pas besoin de configuration supplémentaire si DoctrineBundle est configuré
```

---

### Étape 5 : Tests et Validation

#### 5.1. Tests manuels

**Actions :**
1. Rebuild des images Docker avec les nouvelles dépendances Oracle
2. Vérifier que l'extension OCI8 est chargée : `php -m | grep oci8`
3. Tester la connexion Doctrine : `php bin/console doctrine:query:sql "SELECT 1 FROM DUAL"`
4. Tester l'endpoint : `curl http://localhost:8000/api/health/database`

#### 5.2. Tests automatisés (optionnel)

**Fichier :** `/backend/tests/Controller/Api/HealthApiControllerTest.php`

Créer des tests unitaires et fonctionnels pour valider :
- La réponse en cas de succès
- La réponse en cas d'échec de connexion
- Le format JSON de la réponse

---

## 📝 Checklist d'Implémentation

### Prérequis
- [ ] Oracle Instant Client téléchargé et accessible
- [ ] Accès à une base de données Oracle pour les tests
- [ ] Credentials Oracle configurés dans `.env`

### Docker
- [ ] Modifier `Dockerfile` avec Oracle Instant Client
- [ ] Modifier `Dockerfile.preview` avec Oracle Instant Client
- [ ] Rebuild des images Docker
- [ ] Vérifier que l'extension OCI8 est installée : `php -m | grep oci8`

### Configuration
- [ ] Configurer `doctrine.yaml` pour Oracle
- [ ] Configurer `DATABASE_URL` dans `.env`
- [ ] Tester la connexion Doctrine : `php bin/console doctrine:query:sql "SELECT 1 FROM DUAL"`

### Code
- [ ] Créer `HealthApiController.php`
- [ ] Implémenter la méthode `databaseHealth()`
- [ ] Tester l'endpoint manuellement

### Tests
- [ ] Test avec connexion valide
- [ ] Test avec connexion invalide
- [ ] Vérifier le format JSON de la réponse
- [ ] Vérifier les codes HTTP (200 pour succès, 503 pour échec)

---

## 🔍 Dépannage

### Problème : Extension OCI8 non trouvée

**Solution :**
```bash
# Vérifier dans le container
php -m | grep oci8

# Si absent, vérifier l'installation dans Dockerfile
# Utiliser PECL si docker-php-ext-install ne fonctionne pas
```

### Problème : Erreur de connexion Oracle

**Vérifications :**
1. `DATABASE_URL` correctement formaté
2. Oracle Instant Client correctement installé
3. Variables d'environnement `LD_LIBRARY_PATH` et `ORACLE_HOME` définies
4. Permissions réseau (firewall, etc.)

### Problème : Doctrine ne reconnaît pas le driver Oracle

**Solution :**
- Vérifier que `doctrine/dbal` supporte Oracle (version 3.x+)
- Vérifier la configuration dans `doctrine.yaml`
- Utiliser `driver: 'oci8'` ou `driver: 'pdo_oci'`

---

## 📚 Ressources

- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- [PHP OCI8 Documentation](https://www.php.net/manual/en/book.oci8.php)
- [Doctrine DBAL Oracle Driver](https://www.doctrine-project.org/projects/doctrine-dbal/en/latest/reference/platforms.html#oracle)
- [Symfony Doctrine Configuration](https://symfony.com/doc/current/doctrine.html)

---

## 🎯 Résultat Attendu

Une fois implémenté, l'endpoint `GET /api/health/database` devrait retourner :

**Succès (200) :**
```json
{
  "success": true,
  "status": "healthy",
  "data": {
    "database": {
      "connected": true,
      "server_version": "21.0.0.0.0",
      "database_name": "XE",
      "driver": "oci8"
    },
    "timestamp": "2025-01-XX..."
  }
}
```

**Échec (503) :**
```json
{
  "success": false,
  "status": "unhealthy",
  "message": "Database connection failed: ...",
  "error": "...",
  "timestamp": "2025-01-XX..."
}
```

---

**Date de création :** 2025-01-XX  
**Branche :** `oracle`  
**Auteur :** Roadmap d'implémentation
