# 🤔 Réflexion : Système de Faker pour les Appels API

**Date** : 2025-01-XX  
**Contexte** : Développement frontend sans accès aux services SOAP  
**Objectif** : Permettre le développement frontend en utilisant des données mockées depuis des fichiers JSON

---

## 📋 Analyse du Problème

### Situation Actuelle

- **Services SOAP** : Non disponibles pendant le développement frontend
- **Contrôleurs API** : Appellent directement les méthodes SOAP via `$client->methodName()`
- **Développement frontend** : Bloqué car les endpoints API retournent des erreurs sans SOAP

### Besoin

Permettre de développer le frontend et tester les composants/pages **sans avoir accès aux services SOAP**, en utilisant des données mockées depuis des fichiers JSON.

---

## 🎯 Solution Proposée

### Principe

1. **Variable d'environnement** : `API_CALL_FAKER=true` dans le fichier `.env`
2. **Interception** : Détecter cette variable dans les contrôleurs API
3. **Redirection** : Au lieu d'appeler SOAP, lire les données depuis `public/data/api/{endpoint}.json`
4. **Format** : Les fichiers JSON doivent correspondre à la structure des réponses SOAP normalisées

---

## 🔍 Analyse de Faisabilité

### ✅ **FAISABLE** - Solution Techniquement Réalisable

La solution est **totalement faisable** pour les raisons suivantes :

1. **Architecture modulaire** : Tous les contrôleurs API héritent de `AbstractApiController`
2. **Point d'interception unique** : Les appels SOAP passent tous par `$this->client->methodName()`
3. **Normalisation existante** : Les données sont déjà normalisées avec `normalize()` avant retour
4. **Structure claire** : Chaque endpoint a une route et une méthode dédiée

---

## 🏗️ Architecture Proposée

### Stratégie 1 : Méthode dans AbstractApiController (Recommandée) ✅

**Principe** : Ajouter une méthode `sendFakeData()` dans `AbstractApiController` que chaque endpoint peut appeler individuellement au début de sa méthode.

**Avantages** :
- ✅ **Granulaire** : Chaque endpoint décide individuellement s'il veut utiliser le fake
- ✅ **Modulaire** : Seuls les contrôleurs API sont affectés, pas les contrôleurs non-API
- ✅ **Explicite** : Le code montre clairement quels endpoints utilisent le fake
- ✅ **Flexible** : Facile d'activer/désactiver le fake par endpoint
- ✅ **Maintenable** : Pas de modification du service Client nécessaire

**Inconvénients** :
- ⚠️ **Duplication** : Nécessite d'ajouter 2-3 lignes dans chaque endpoint
- ⚠️ **Oubli possible** : Si on oublie d'ajouter la vérification, l'endpoint utilisera SOAP

**Implémentation** :
```php
// src/Controller/Api/AbstractApiController.php
protected function sendFakeData(string $endpoint, array $params = [], ?string $message = null): ?JsonResponse
{
    if (!$this->isFakerMode()) {
        return null; // Continue with SOAP
    }
    
    try {
        $data = $this->fakeDataService->get($endpoint, $params);
        return $this->success($this->normalize($data), $message);
    } catch (\Exception $e) {
        return $this->error('Fake data not available: ' . $e->getMessage(), 500);
    }
}

// src/Controller/Api/FactureApiController.php
public function list(Request $request): JsonResponse
{
    // Check if faker mode is enabled
    $fakeResponse = $this->sendFakeData('factures-list');
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}
```

### Stratégie 2 : Interception au Niveau du Client (Non recommandée pour ce cas)

**Principe** : Créer un wrapper ou modifier le service `Client` pour intercepter les appels SOAP.

**Avantages** :
- ✅ **Centralisé** : Une seule modification dans le service `Client`
- ✅ **Transparent** : Aucune modification nécessaire dans les contrôleurs
- ✅ **Réutilisable** : Fonctionne pour tous les endpoints automatiquement

**Inconvénients** :
- ⚠️ **Complexité** : Nécessite de mapper chaque méthode SOAP à un fichier JSON
- ⚠️ **Maintenance** : Doit être maintenu en parallèle avec les vraies méthodes SOAP

**Implémentation** :
```php
// src/Service/Client.php ou src/Service/FakeClient.php
class Client extends BaseClient
{
    private bool $useFaker;
    
    public function __construct(...)
    {
        parent::__construct(...);
        $this->useFaker = $_ENV['API_CALL_FAKER'] === 'true';
    }
    
    public function getMyTableauBordClient()
    {
        if ($this->useFaker) {
            return $this->getFakeData('dashboard');
        }
        return parent::getMyTableauBordClient();
    }
    
    private function getFakeData(string $endpoint): object
    {
        $filePath = __DIR__ . '/../../public/data/api/' . $endpoint . '.json';
        if (!file_exists($filePath)) {
            throw new \Exception("Fake data file not found: {$filePath}");
        }
        $json = file_get_contents($filePath);
        return json_decode($json);
    }
}
```

### Stratégie 2 : Interception au Niveau des Contrôleurs

**Principe** : Ajouter une méthode dans `AbstractApiController` pour vérifier le mode faker et retourner les données mockées.

**Avantages** :
- ✅ **Contrôle fin** : Chaque endpoint peut avoir sa propre logique
- ✅ **Flexibilité** : Possibilité de mock partiel (certains endpoints seulement)

**Inconvénients** :
- ⚠️ **Duplication** : Nécessite d'ajouter du code dans chaque méthode de contrôleur
- ⚠️ **Maintenance** : Plus de code à maintenir

**Implémentation** :
```php
// src/Controller/Api/AbstractApiController.php
abstract class AbstractApiController extends AbstractTechemController
{
    protected function isFakerMode(): bool
    {
        return $_ENV['API_CALL_FAKER'] === 'true';
    }
    
    protected function getFakeData(string $endpoint, array $params = []): array
    {
        $filePath = $this->getParameter('kernel.project_dir') . '/public/data/api/' . $endpoint . '.json';
        if (!file_exists($filePath)) {
            throw new \Exception("Fake data file not found: {$filePath}");
        }
        $json = file_get_contents($filePath);
        $data = json_decode($json, true);
        
        // Possibilité de modifier les données selon les params
        return $data;
    }
}

// src/Controller/Api/TableauBordClientApiController.php
public function index(Request $request): JsonResponse
{
    if ($this->isFakerMode()) {
        $board = (object) $this->getFakeData('dashboard');
        // ... traitement normal ...
        return $this->success(['board' => $this->normalize($board)]);
    }
    
    // Code SOAP normal
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}
```

### Stratégie 3 : Service Dédié (Recommandée pour Complexité)

**Principe** : Créer un service `FakeDataService` qui gère toute la logique de faker.

**Avantages** :
- ✅ **Séparation des responsabilités** : Logique isolée dans un service
- ✅ **Testable** : Facile à tester unitairement
- ✅ **Extensible** : Peut gérer des cas complexes (paramètres dynamiques, etc.)

**Inconvénients** :
- ⚠️ **Complexité initiale** : Nécessite de créer un nouveau service
- ⚠️ **Injection** : Doit être injecté dans tous les contrôleurs

**Implémentation** :
```php
// src/Service/FakeDataService.php
class FakeDataService
{
    private string $dataDir;
    private bool $enabled;
    
    public function __construct(string $projectDir)
    {
        $this->dataDir = $projectDir . '/public/data/api/';
        $this->enabled = $_ENV['API_CALL_FAKER'] === 'true';
    }
    
    public function isEnabled(): bool
    {
        return $this->enabled;
    }
    
    public function getFakeData(string $endpoint, array $params = []): array
    {
        $filePath = $this->dataDir . $endpoint . '.json';
        // ... logique de chargement et transformation
    }
}
```

---

## 📁 Structure des Fichiers JSON

### Convention de Nommage

Les fichiers JSON doivent être nommés selon le pattern suivant :

```
public/data/api/
├── dashboard.json                    # GET /api/dashboard
├── immeubles-index.json              # GET /api/immeubles
├── immeubles-filtre.json             # GET /api/immeubles/filtre
├── immeubles-{pkImmeuble}.json       # GET /api/immeubles/{pkImmeuble}
├── immeubles-{pkImmeuble}-interventions.json
├── logements-immeuble-{pkImmeuble}.json
├── logements-{pkLogement}.json
├── occupant.json                     # GET /api/occupant
├── factures.json                     # GET /api/factures
└── ...
```

### Format des Fichiers JSON

Les fichiers JSON doivent correspondre à la structure **normalisée** retournée par les endpoints API (après `normalize()`).

**Exemple : `dashboard.json`**
```json
{
  "nbImmeubles": 26,
  "nbImmeublesTelereleve": 2,
  "nbImmeublesTransfertFichiers": 1,
  "nbCompteursARelever": 2571,
  "nbCompteursReleves": 2427,
  "nbLogements": 1505,
  "nbCompteurs": 2744,
  "nbCompteursEc": 1403,
  "nbCompteursEf": 1341,
  "nbFuites": 12,
  "nbAnomalies": 171,
  "pcImmeublesTelereleve": 94,
  "pcImmeublesTransfertFichiers": 4
}
```

**Exemple : `immeubles-index.json`**
```json
{
  "board": {
    "nbImmeubles": 26,
    "nbLogements": 1505,
    ...
  },
  "filters": {}
}
```

---

## 🎯 Mapping Endpoints → Fichiers JSON

### Tableau de Correspondance

| Endpoint API | Méthode SOAP | Fichier JSON | Notes |
|--------------|--------------|--------------|-------|
| `GET /api/dashboard` | `getMyTableauBordClient()` | `dashboard.json` | ✅ Exemple existant |
| `GET /api/immeubles` | `getMyTableauBordClient()` | `immeubles-index.json` | |
| `GET /api/immeubles/filtre` | `getMyImmeubles($params)` | `immeubles-filtre.json` | |
| `GET /api/immeubles/{pkImmeuble}` | `getTableauBordImmeuble($pk)` | `immeubles-{pkImmeuble}.json` | Paramètre dynamique |
| `GET /api/immeubles/{pkImmeuble}/interventions` | `getInterventionsImmeuble($pk)` | `immeubles-{pkImmeuble}-interventions.json` | |
| `GET /api/logements/immeuble/{pkImmeuble}` | `getTableauBordImmeuble($pk)` | `logements-immeuble-{pkImmeuble}.json` | |
| `GET /api/logements/{pkLogement}` | `getTableauBordLogement($pk)` | `logements-{pkLogement}.json` | |
| `GET /api/occupant` | `getTableauBordOccupant($pk)` | `occupant.json` | |
| `GET /api/factures` | `getFactures()` | `factures.json` | |
| `GET /api/factures/{pkFacture}` | `getFactures()` | `factures-{pkFacture}.json` | |

---

## ⚠️ Défis et Limitations

### 1. Paramètres Dynamiques

**Problème** : Certains endpoints utilisent des paramètres dynamiques (ex: `{pkImmeuble}`, `{pkLogement}`).

**Solutions possibles** :
- **Option A** : Un fichier JSON par valeur de paramètre
  - `immeubles-12345.json`, `immeubles-67890.json`
  - ⚠️ Peut créer beaucoup de fichiers
  
- **Option B** : Un fichier JSON générique avec mapping
  - `immeubles.json` avec structure `{ "12345": {...}, "67890": {...} }`
  - ✅ Plus maintenable
  
- **Option C** : Fichier JSON par type avec premier exemple
  - `immeubles-example.json` utilisé pour tous les IDs
  - ✅ Simple mais moins réaliste

**Recommandation** : **Option B** pour la flexibilité, **Option C** pour la simplicité en développement.

### 2. Paramètres de Filtrage

**Problème** : Les endpoints de filtrage acceptent des paramètres (ex: `?ref=...&nom=...`).

**Solutions possibles** :
- **Option A** : Ignorer les paramètres et retourner toujours le même fichier
  - ✅ Simple
  - ⚠️ Moins réaliste
  
- **Option B** : Fichiers JSON différents selon les paramètres
  - `immeubles-filtre-ref-123.json`, `immeubles-filtre-nom-test.json`
  - ⚠️ Explosion combinatoire de fichiers
  
- **Option C** : Fichier JSON avec logique de filtrage côté PHP
  - `immeubles-filtre.json` avec tous les immeubles, filtrage appliqué en PHP
  - ✅ Réaliste mais plus complexe

**Recommandation** : **Option A** pour le développement frontend (simplicité).

### 3. Authentification

**Problème** : Les endpoints nécessitent `X-Session-ID` et `X-Pk-User` en mode normal.

**Solution** :
- En mode faker, **ignorer l'authentification** ou utiliser des valeurs mockées
- Les headers peuvent être présents mais ne sont pas validés

### 4. Mutations (POST, PUT, DELETE)

**Problème** : Les mutations modifient des données (création ticket, mise à jour occupant, etc.).

**Solutions possibles** :
- **Option A** : Retourner un succès mocké sans réellement modifier
  - ✅ Simple pour tester le frontend
  - ⚠️ Ne teste pas les vrais cas d'erreur
  
- **Option B** : Simuler les erreurs selon les données envoyées
  - Validation côté faker pour tester les cas d'erreur
  - ✅ Plus réaliste

**Recommandation** : **Option A** pour le développement, **Option B** pour les tests.

### 5. Endpoints avec Fichiers Binaires (PDF, Excel)

**Problème** : Certains endpoints retournent des fichiers (reports, exports).

**Solutions possibles** :
- **Option A** : Retourner un fichier PDF/Excel mocké depuis `public/data/api/files/`
  - ✅ Permet de tester le téléchargement
  
- **Option B** : Retourner une erreur 404 en mode faker
  - ⚠️ Bloque le développement frontend

**Recommandation** : **Option A** avec fichiers mockés.

---

## 🔧 Implémentation Proposée (Stratégie 1 : Méthode dans AbstractApiController) ✅

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Contrôleur API (ex: TableauBordClientApiController)   │
│                                                          │
│  $client->getMyTableauBordClient()                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Service Client                                         │
│                                                          │
│  if (API_CALL_FAKER === 'true') {                       │
│    return FakeDataService->get('dashboard')             │
│  }                                                       │
│  return parent::getMyTableauBordClient()                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│  FakeDataService │   │  BaseClient      │
│                  │   │  (SOAP réel)     │
│  - get()         │   │                  │
│  - loadJSON()    │   │  - sendRequest() │
│  - transform()   │   │  - SOAP calls    │
└──────────────────┘   └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  public/data/api/                       │
│  ├── dashboard.json                     │
│  ├── immeubles-index.json               │
│  ├── immeubles-{id}.json                │
│  └── ...                                │
└─────────────────────────────────────────┘
```

### Code Proposé

#### 1. Service FakeDataService

```php
// src/Service/FakeDataService.php
namespace App\Service;

class FakeDataService
{
    private string $dataDir;
    private bool $enabled;
    
    public function __construct(string $projectDir)
    {
        $this->dataDir = $projectDir . '/public/data/api/';
        $this->enabled = ($_ENV['API_CALL_FAKER'] ?? 'false') === 'true';
    }
    
    public function isEnabled(): bool
    {
        return $this->enabled;
    }
    
    /**
     * Get fake data for an endpoint
     * 
     * @param string $endpoint Endpoint identifier (e.g., 'dashboard', 'immeubles-index')
     * @param array $params Parameters for dynamic endpoints (e.g., ['pkImmeuble' => 12345])
     * @return object|array Fake data as object/array
     * @throws \Exception If file not found
     */
    public function get(string $endpoint, array $params = [])
    {
        $filePath = $this->resolveFilePath($endpoint, $params);
        
        if (!file_exists($filePath)) {
            throw new \Exception("Fake data file not found: {$filePath}");
        }
        
        $json = file_get_contents($filePath);
        $data = json_decode($json, false); // Return as object to match SOAP response
        
        // Apply parameter-based transformations if needed
        return $this->transformData($data, $params);
    }
    
    /**
     * Resolve file path from endpoint and parameters
     */
    private function resolveFilePath(string $endpoint, array $params): string
    {
        // Replace dynamic parameters in endpoint name
        $fileName = $endpoint;
        foreach ($params as $key => $value) {
            $fileName = str_replace('{' . $key . '}', (string)$value, $fileName);
        }
        
        // Fallback: if file with params doesn't exist, try generic file
        $filePath = $this->dataDir . $fileName . '.json';
        if (!file_exists($filePath) && !empty($params)) {
            // Try generic file (e.g., immeubles-example.json)
            $genericPath = $this->dataDir . str_replace('{' . array_key_first($params) . '}', 'example', $fileName) . '.json';
            if (file_exists($genericPath)) {
                return $genericPath;
            }
        }
        
        return $filePath;
    }
    
    /**
     * Transform data based on parameters (optional)
     */
    private function transformData($data, array $params)
    {
        // Example: if data is an array with keys matching params, return specific item
        if (is_object($data) && !empty($params)) {
            $pkKey = 'pkImmeuble' ?? 'pkLogement' ?? array_key_first($params);
            if (isset($params[$pkKey]) && isset($data->{$params[$pkKey]})) {
                return $data->{$params[$pkKey]};
            }
        }
        
        return $data;
    }
}
```

#### 2. Méthodes dans AbstractApiController ✅

```php
// src/Controller/Api/AbstractApiController.php
abstract class AbstractApiController extends AbstractTechemController
{
    protected ?FakeDataService $fakeDataService;

    public function __construct(Client $client, SerializerInterface $serializer, ?FakeDataService $fakeDataService = null)
    {
        parent::__construct($client);
        $this->serializer = $serializer;
        $this->fakeDataService = $fakeDataService;
    }

    /**
     * Check if faker mode is enabled
     */
    protected function isFakerMode(): bool
    {
        return $this->fakeDataService !== null && $this->fakeDataService->isEnabled();
    }

    /**
     * Send fake data response for an endpoint
     * Returns JsonResponse if faker mode is enabled, null otherwise
     */
    protected function sendFakeData(string $endpoint, array $params = [], ?string $message = null): ?JsonResponse
    {
        if (!$this->isFakerMode()) {
            return null; // Continue with SOAP
        }

        try {
            $data = $this->fakeDataService->get($endpoint, $params);
            $normalizedData = $this->normalize($data);
            return $this->success($normalizedData, $message);
        } catch (\Exception $e) {
            return $this->error('Fake data not available: ' . $e->getMessage(), 500);
        }
    }
}
```

#### 3. Utilisation dans les Contrôleurs API ✅

```php
// src/Controller/Api/FactureApiController.php
public function list(Request $request): JsonResponse
{
    // Check if faker mode is enabled and return fake data
    $fakeResponse = $this->sendFakeData('factures-list');
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}

// src/Controller/Api/FactureApiController.php
public function show(int $pkFacture, Request $request): JsonResponse
{
    // Check if faker mode is enabled with parameters
    $fakeResponse = $this->sendFakeData('factures-{pkFacture}', ['pkFacture' => $pkFacture]);
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}
```

#### 4. Configuration Symfony ✅

```yaml
# config/services.yaml
services:
    App\Service\FakeDataService:
        arguments:
            $projectDir: '%kernel.project_dir%'
    
    # FakeDataService sera automatiquement injecté dans AbstractApiController
    # grâce à l'autowiring de Symfony
```

#### 5. Variable d'Environnement

```bash
# .env
API_CALL_FAKER=true
```

**Note** : Quand `API_CALL_FAKER=false` ou non définie, tous les endpoints utilisent les services SOAP normalement.

---

## 📊 Avantages et Inconvénients

### ✅ Avantages

1. **Développement Frontend Indépendant**
   - ✅ Permet de développer le frontend sans dépendre des services SOAP
   - ✅ Tests des composants et pages possibles
   - ✅ Développement parallèle frontend/backend

2. **Rapidité**
   - ✅ Pas d'appels réseau SOAP (plus rapide)
   - ✅ Données disponibles instantanément
   - ✅ Pas de latence réseau

3. **Contrôle**
   - ✅ Données prévisibles et contrôlées
   - ✅ Facile de tester différents scénarios (données vides, erreurs, etc.)
   - ✅ Pas de dépendance à l'état des services SOAP

4. **Maintenance**
   - ✅ Fichiers JSON faciles à modifier
   - ✅ Versioning possible (Git)
   - ✅ Partage facile entre développeurs

### ⚠️ Inconvénients

1. **Synchronisation**
   - ⚠️ Les fichiers JSON doivent être maintenus en parallèle avec les vraies réponses SOAP
   - ⚠️ Risque de désynchronisation si la structure SOAP change

2. **Couverture**
   - ⚠️ Nécessite de créer un fichier JSON pour chaque endpoint
   - ⚠️ Temps initial pour créer tous les fichiers mockés

3. **Réalisme**
   - ⚠️ Les données mockées peuvent ne pas refléter la réalité
   - ⚠️ Cas limites difficiles à simuler

4. **Complexité**
   - ⚠️ Paramètres dynamiques nécessitent une logique supplémentaire
   - ⚠️ Filtres et recherches difficiles à mock réalistement

---

## 🎯 Recommandation

### Approche Recommandée : **Stratégie 1 (Interception Client) + Service Dédié**

**Pourquoi** :
1. ✅ **Granulaire** : Chaque endpoint décide individuellement s'il veut utiliser le fake
2. ✅ **Modulaire** : Seuls les contrôleurs API sont affectés, pas les contrôleurs non-API
3. ✅ **Explicite** : Le code montre clairement quels endpoints utilisent le fake
4. ✅ **Flexible** : Facile d'activer/désactiver le fake par endpoint
5. ✅ **Maintenable** : Service dédié facile à tester et maintenir
6. ✅ **Pas de modification du Client** : Le service Client reste intact

### Implémentation Progressive

**Phase 1 : Endpoints Simples** (Priorité Haute)
- ✅ `GET /api/dashboard` → `dashboard.json` (exemple existant)
- ✅ `GET /api/immeubles` → `immeubles-index.json`
- ✅ `GET /api/factures` → `factures.json`
- ✅ `GET /api/occupant` → `occupant.json`

**Phase 2 : Endpoints avec Paramètres** (Priorité Moyenne)
- ✅ `GET /api/immeubles/{pkImmeuble}` → `immeubles-{pkImmeuble}.json` ou `immeubles-example.json`
- ✅ `GET /api/logements/{pkLogement}` → `logements-{pkLogement}.json` ou `logements-example.json`

**Phase 3 : Endpoints Complexes** (Priorité Basse)
- ⏳ Endpoints avec filtres
- ⏳ Endpoints avec fichiers binaires
- ⏳ Mutations (POST, PUT, DELETE)

---

## 📝 Structure des Fichiers JSON Nécessaires

### Liste Complète des Fichiers à Créer

#### Endpoints Simples (sans paramètres)

```
public/data/api/
├── dashboard.json                    ✅ Existe déjà
├── immeubles-index.json              ❌ À créer
├── immeubles-filtre.json             ❌ À créer
├── factures.json                     ❌ À créer
├── factures-list.json                ❌ À créer
├── occupant.json                     ❌ À créer
├── occupant-simulateur.json          ❌ À créer
├── occupant-alertes.json             ❌ À créer
├── gestion-parc-index.json           ❌ À créer
├── gestion-parc-filtre.json          ❌ À créer
└── search.json                       ❌ À créer
```

#### Endpoints avec Paramètres Dynamiques

```
public/data/api/
├── immeubles-example.json            ❌ À créer (utilisé pour tous les IDs)
├── immeubles-example-interventions.json
├── immeubles-example-fuites.json
├── immeubles-example-anomalies.json
├── immeubles-example-dysfonctionnements.json
├── logements-immeuble-example.json
├── logements-example.json
├── logements-example-interventions.json
├── logements-example-fuites.json
├── logements-example-anomalies.json
├── logements-example-dysfonctionnements.json
├── factures-example.json
└── ...
```

**Note** : Utiliser `-example` pour les paramètres dynamiques permet de réutiliser le même fichier pour tous les IDs.

---

## 🔄 Workflow de Développement

### Avec le Système de Faker

1. **Développeur Frontend** :
   - Active `API_CALL_FAKER=true` dans `.env`
   - Développe les composants/pages
   - Teste avec les données mockées
   - Les appels API retournent les données JSON

2. **Développeur Backend** :
   - Désactive `API_CALL_FAKER=false` ou ne le définit pas
   - Développe les endpoints API
   - Teste avec les vrais services SOAP

3. **Intégration** :
   - Désactive le mode faker
   - Teste l'intégration complète
   - Vérifie que les données réelles correspondent aux mockées

---

## ⚙️ Gestion des Cas Particuliers

### 1. Authentification en Mode Faker

**Solution** : Ignorer la validation des headers en mode faker

```php
// src/Controller/Api/AbstractApiController.php
protected function getAuthenticatedClientFromHeaders(Request $request)
{
    // En mode faker, retourner un client mocké
    if ($this->isFakerMode()) {
        $this->client->retrieveSession('fake-session-id', 1);
        return $this->client;
    }
    
    // Code normal...
}
```

### 2. Mutations (POST, PUT, DELETE)

**Solution** : Retourner un succès mocké

```php
// Exemple pour création de ticket
public function createTicket(int $pkLogement, Request $request): JsonResponse
{
    if ($this->isFakerMode()) {
        return $this->success([
            'nbTickets' => 1,
            'pkLogement' => $pkLogement,
        ], 'Demande d\'intervention envoyée (FAKE)');
    }
    
    // Code SOAP normal...
}
```

### 3. Endpoints avec Fichiers Binaires

**Solution** : Retourner un fichier mocké

```php
// Exemple pour export Excel
public function exportAnomalies(int $pkImmeuble): Response
{
    if ($this->isFakerMode()) {
        $filePath = $this->getParameter('kernel.project_dir') . '/public/data/api/files/export-anomalies-example.xlsx';
        return new BinaryFileResponse($filePath);
    }
    
    // Code SOAP normal...
}
```

---

## 🎨 Exemple Complet : Endpoint Dashboard

### Fichier JSON

```json
// public/data/api/dashboard.json
{
  "nbImmeubles": 26,
  "nbImmeublesTelereleve": 2,
  "nbImmeublesTransfertFichiers": 1,
  "nbCompteursARelever": 2571,
  "nbCompteursReleves": 2427,
  "nbLogements": 1505,
  "nbCompteurs": 2744,
  "nbCompteursEc": 1403,
  "nbCompteursEf": 1341,
  "nbCompteursRepart": 0,
  "nbCompteursCet": 0,
  "nbCompteursCapteur": 0,
  "nbCompteursElect": -1,
  "nbCompteursGaz": -1,
  "nbFuites": 12,
  "degresFuites": -1,
  "nbDepannages": 0,
  "degresDepannages": -1,
  "nbDysfonctionnements": 0,
  "degresDysfonctionnements": -1,
  "nbAnomalies": 171,
  "degresAnomalies": -1,
  "nbChantiers": 0,
  "nbCompteursPoses": 0,
  "nbCompteursCommandes": 0,
  "PcImmeublesTelereleve": "94",
  "PcImmeublesTransfertFichiers": "4"
}
```

### Code Contrôleur (Avec Vérification Faker)

```php
// src/Controller/Api/TableauBordClientApiController.php
public function index(Request $request): JsonResponse
{
    // Check if faker mode is enabled and return fake data
    $fakeResponse = $this->sendFakeData('dashboard');
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
    $client = $this->getAuthenticatedClientFromHeaders($request);
    $board = $client->getMyTableauBordClient();
    // ... reste du code identique ...
}
```

---

## 📋 Checklist d'Implémentation

### Phase 1 : Infrastructure ✅

- [x] ✅ Créer le service `FakeDataService`
- [x] ✅ Ajouter les méthodes `isFakerMode()` et `sendFakeData()` dans `AbstractApiController`
- [x] ✅ Configurer l'injection de dépendances dans `services.yaml`
- [ ] ⏳ Ajouter la variable `API_CALL_FAKER=true` dans `.env` (à faire par le développeur)

### Phase 2 : Endpoints Simples

- [x] ✅ Exemple d'utilisation dans `TableauBordClientApiController::index()` (dashboard)
- [x] ✅ Exemple d'utilisation dans `FactureApiController::list()` (factures-list)
- [x] ✅ Exemple d'utilisation dans `FactureApiController::show()` (factures-{pkFacture})
- [ ] ⏳ Créer `dashboard.json` (existe déjà dans `public/data/api/`)
- [ ] ⏳ Créer `factures-list.json`
- [ ] ⏳ Créer `factures-{pkFacture}.json` ou `factures-example.json`
- [ ] ⏳ Créer `immeubles-index.json`
- [ ] ⏳ Créer `occupant.json`
- [ ] ⏳ Ajouter `sendFakeData()` dans les autres endpoints API
- [ ] ⏳ Tester chaque endpoint en mode faker

### Phase 3 : Endpoints avec Paramètres

- [ ] Créer `immeubles-example.json`
- [ ] Créer `logements-example.json`
- [ ] Implémenter la résolution de fichiers avec paramètres
- [ ] Tester avec différents IDs

### Phase 4 : Cas Particuliers

- [ ] Gérer l'authentification en mode faker
- [ ] Gérer les mutations (retourner succès mocké)
- [ ] Gérer les fichiers binaires (PDF, Excel)
- [ ] Gérer les filtres (optionnel)

### Phase 5 : Documentation

- [ ] Documenter la structure des fichiers JSON
- [ ] Créer un guide pour ajouter de nouveaux fichiers mockés
- [ ] Documenter les limitations

---

## 🎯 Conclusion

### ✅ **Solution Faisable et Recommandée**

La solution est **totalement faisable** et présente de nombreux avantages pour le développement frontend :

1. ✅ **Architecture modulaire** : Méthode dans `AbstractApiController` pour contrôle granulaire
2. ✅ **Granulaire** : Chaque endpoint décide individuellement s'il veut utiliser le fake
3. ✅ **Modulaire** : Seuls les contrôleurs API sont affectés, pas les contrôleurs non-API
4. ✅ **Explicite** : Le code montre clairement quels endpoints utilisent le fake
5. ✅ **Maintenable** : Service dédié facile à maintenir
6. ✅ **Extensible** : Facile d'ajouter de nouveaux endpoints

### Prochaines Étapes

1. ✅ **Implémentation** : Infrastructure créée (FakeDataService, AbstractApiController)
2. ⏳ **Création des fichiers JSON** : Créer les fichiers JSON pour chaque endpoint nécessaire
3. ⏳ **Ajout dans les contrôleurs** : Ajouter `sendFakeData()` dans chaque endpoint API
4. ⏳ **Tests** : Tester le développement frontend avec les données mockées

---

## ✅ Implémentation Réalisée

**Date d'implémentation** : 2025-01-XX  
**Statut** : ✅ **Infrastructure implémentée - Prêt pour utilisation**

### Fichiers Créés/Modifiés

1. ✅ **`src/Service/FakeDataService.php`** - Service pour gérer les données fake
2. ✅ **`src/Controller/Api/AbstractApiController.php`** - Ajout des méthodes `isFakerMode()` et `sendFakeData()`
3. ✅ **`config/services.yaml`** - Configuration du service FakeDataService
4. ✅ **`src/Controller/Api/FactureApiController.php`** - Exemple d'utilisation (2 endpoints)
5. ✅ **`src/Controller/Api/TableauBordClientApiController.php`** - Exemple d'utilisation (1 endpoint)

### Utilisation

Pour activer le mode faker, ajoutez dans votre `.env` :
```bash
API_CALL_FAKER=true
```

Pour utiliser le fake dans un endpoint, ajoutez au début de la méthode :
```php
public function myEndpoint(Request $request): JsonResponse
{
    // Check if faker mode is enabled
    $fakeResponse = $this->sendFakeData('my-endpoint-name');
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
    $client = $this->getAuthenticatedClientFromHeaders($request);
    // ...
}
```

Pour les endpoints avec paramètres dynamiques :
```php
public function show(int $pkImmeuble, Request $request): JsonResponse
{
    // Check if faker mode is enabled with parameters
    $fakeResponse = $this->sendFakeData('immeubles-{pkImmeuble}', ['pkImmeuble' => $pkImmeuble]);
    if ($fakeResponse !== null) {
        return $fakeResponse;
    }
    
    // Continue with SOAP call...
}
```

### Avantages de cette Approche

- ✅ **Granulaire** : Chaque endpoint peut décider individuellement
- ✅ **Modulaire** : N'affecte pas les contrôleurs non-API
- ✅ **Explicite** : Le code montre clairement l'utilisation du fake
- ✅ **Flexible** : Facile d'activer/désactiver par endpoint
- ✅ **Pas de modification du Client** : Le service Client reste intact

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ **Infrastructure implémentée - Prêt pour utilisation**

