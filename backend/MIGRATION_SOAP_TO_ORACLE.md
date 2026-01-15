# Stratégie de Migration : SOAP vers Oracle Database

## 📋 Table des matières

1. [Contexte et Objectifs](#contexte-et-objectifs)
2. [Analyse de l'Architecture Actuelle](#analyse-de-larchitecture-actuelle)
3. [Architecture Cible](#architecture-cible)
4. [Stratégie de Migration](#stratégie-de-migration)
5. [Plan d'Action Détaillé](#plan-daction-détaillé)
6. [Risques et Mitigations](#risques-et-mitigations)
7. [Critères de Succès](#critères-de-succès)
8. [Annexes](#annexes)

---

## 🎯 Contexte et Objectifs

### Situation Actuelle

L'application utilise actuellement une architecture à trois couches :
- **Contrôleurs API** → **Services métier** → **Service Client (SOAP)** → **Web Services externes**

### Objectifs de la Migration

1. **Performance** : Réduire la latence en accédant directement à la base de données
2. **Maintenabilité** : Simplifier l'architecture en supprimant la dépendance aux Web Services SOAP
3. **Fiabilité** : Réduire les points de défaillance (plus de dépendance réseau SOAP)
4. **Scalabilité** : Améliorer la capacité à gérer les pics de charge
5. **Coûts** : Potentiellement réduire les coûts d'infrastructure SOAP

### Contraintes

- Migration progressive sans interruption de service
- Conservation de la compatibilité avec l'existant
- Validation de l'intégrité des données
- Formation de l'équipe sur Oracle

---

## 🔍 Analyse de l'Architecture Actuelle

### Flux Actuel

```
┌─────────────────┐
│  Contrôleur API │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Service Métier  │ (Immeuble, Logement, Depannage, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Client │ (App\Service\Client)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   BaseClient    │ (sendRequest)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Web Service    │ (SOAP)
│     SOAP        │
└─────────────────┘
```

### Services Identifiés

#### Service Client (App\Service\Client)
- `getImmeubles()` → `GetInfosImmeubles`
- `getTableauBordImmeuble()` → `GetTableauBordImmeuble`
- `getLogements()` → `GetInfosLogementsByImmeuble`
- `getTableauBordLogement()` → `GetTableauBordLogement`
- `getInterventionsImmeuble()` → `GetInterventionsImmeuble`
- `getAnomaliesImmeuble()` → `GetAnomaliesImmeuble`
- `getFuitesImmeuble()` → `GetFuitesImmeuble`
- `getDysfonctionnementsImmeuble()` → `GetDysfonctionnementsImmeuble`
- `getMyTableauBordClient()` → `GetTableauBordClient`
- `getOccupants()` → `GetOccupants`
- `createTicketInter()` → `CreateTicketInter`
- `getReportImmeuble()` → `GetReport`
- Etc.

#### Services Métier (Transformation)
- `Immeuble` : Génération de graphiques, calculs
- `Logement` : Transformation des données
- `Depannage`, `Fuite`, `Anomalie`, `Dysfonctionnement` : Extraction de filtres, exports

---

## 🏗️ Architecture Cible

### Nouvelle Architecture

```
┌─────────────────┐
│  Contrôleur API │ (inchangé)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Service Métier  │ (inchangé)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Client │ (refactorisé)
│   (Adapter)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ Oracle │ │   SOAP   │ (fallback)
│  Repo  │ │  Client  │
└────────┘ └──────────┘
```

### Composants à Créer

#### 1. Repository Layer (Oracle)
```
src/Repository/
├── Oracle/
│   ├── ImmeubleRepository.php
│   ├── LogementRepository.php
│   ├── InterventionRepository.php
│   ├── AnomalieRepository.php
│   ├── FuiteRepository.php
│   ├── DysfonctionnementRepository.php
│   ├── OccupantRepository.php
│   ├── TicketRepository.php
│   └── TableauBordRepository.php
```

#### 2. Adapter Pattern
```
src/Service/
├── Client.php (refactorisé avec stratégie)
├── ClientStrategyInterface.php
├── OracleClientStrategy.php
└── SoapClientStrategy.php (existant)
```

#### 3. Configuration
```
config/packages/
└── oracle.yaml (nouveau)
```

---

## 🚀 Stratégie de Migration

### Approche : Migration Progressive par Feature Flag

**Principe** : Permettre de basculer progressivement de SOAP vers Oracle, endpoint par endpoint, avec possibilité de rollback.

### Phases de Migration

#### Phase 1 : Préparation (2-3 semaines)
- Configuration Oracle
- Création de la couche Repository
- Mise en place du pattern Adapter
- Tests unitaires de la couche Repository

#### Phase 2 : Migration Pilote (1-2 semaines)
- Migration d'un endpoint simple (ex: `getMyTableauBordClient`)
- Tests de charge et performance
- Validation fonctionnelle
- Documentation

#### Phase 3 : Migration Progressive (8-12 semaines)
- Migration endpoint par endpoint
- Tests et validation à chaque étape
- Monitoring et ajustements

#### Phase 4 : Stabilisation (2-3 semaines)
- Migration des endpoints restants
- Optimisation des requêtes
- Documentation finale
- Formation équipe

#### Phase 5 : Nettoyage (1 semaine)
- Suppression du code SOAP obsolète
- Nettoyage de la configuration
- Documentation de l'architecture finale

---

## 📅 Plan d'Action Détaillé

### Phase 1 : Préparation

#### 1.1 Configuration Oracle (Semaine 1)

**Tâches :**
- [ ] Installer le driver Oracle OCI8 pour PHP
- [ ] Configurer la connexion Oracle dans `doctrine.yaml`
- [ ] Créer les variables d'environnement pour Oracle
- [ ] Tester la connexion à la base Oracle
- [ ] Configurer le pool de connexions

**Fichiers à modifier/créer :**
```yaml
# config/packages/oracle.yaml
doctrine:
    dbal:
        connections:
            oracle:
                url: '%env(resolve:ORACLE_DATABASE_URL)%'
                driver: 'oci8'
                server_version: '19'
                charset: 'UTF8'
```

```env
# .env
ORACLE_DATABASE_URL="oci8://user:password@host:1521/service_name"
```

**Livrables :**
- Connexion Oracle fonctionnelle
- Documentation de configuration

#### 1.2 Analyse et Mapping des Données (Semaine 1-2)

**Tâches :**
- [ ] Analyser les réponses SOAP actuelles (structure des objets)
- [ ] Identifier les tables Oracle correspondantes
- [ ] Documenter le mapping SOAP → Oracle
- [ ] Créer un document de mapping pour chaque endpoint

**Template de mapping :**
```markdown
## Endpoint: getTableauBordImmeuble

### SOAP Request
- Method: GetTableauBordImmeuble
- Params: SessionID, PkUser, PkImmeuble

### SOAP Response Structure
- Immeuble.*
- ImmeubleEC.*
- SerieConsosEF.*
- SerieConsosEC.*
- etc.

### Oracle Mapping
- Table principale: IMMEUBLES
- Tables liées: CONSOMMATIONS, COMPTEURS, etc.
- Requête SQL: [à définir]
```

**Livrables :**
- Document de mapping complet
- Schéma de base de données Oracle

#### 1.3 Création de la Couche Repository (Semaine 2-3)

**Tâches :**
- [ ] Créer l'interface `RepositoryInterface`
- [ ] Implémenter `ImmeubleRepository`
- [ ] Implémenter `LogementRepository`
- [ ] Implémenter les autres repositories
- [ ] Créer des DTOs (Data Transfer Objects) pour mapper Oracle → Objets
- [ ] Tests unitaires pour chaque repository

**Structure :**
```php
// src/Repository/Oracle/ImmeubleRepository.php
namespace App\Repository\Oracle;

use Doctrine\DBAL\Connection;

class ImmeubleRepository implements ImmeubleRepositoryInterface
{
    public function __construct(
        private Connection $connection
    ) {}
    
    public function getTableauBordImmeuble(int $pkImmeuble, int $pkUser): object
    {
        // Requête SQL Oracle
        // Mapping vers objet
        // Retour objet compatible avec l'existant
    }
}
```

**Livrables :**
- Tous les repositories implémentés
- Tests unitaires avec couverture > 80%
- Documentation des requêtes SQL

#### 1.4 Pattern Adapter (Semaine 2-3)

**Tâches :**
- [ ] Créer `ClientStrategyInterface`
- [ ] Implémenter `SoapClientStrategy` (wrapper du code existant)
- [ ] Implémenter `OracleClientStrategy` (nouveau)
- [ ] Refactoriser `Client` pour utiliser le pattern Strategy
- [ ] Ajouter un Feature Flag pour basculer entre stratégies

**Code :**
```php
// src/Service/ClientStrategyInterface.php
interface ClientStrategyInterface
{
    public function getTableauBordImmeuble(int $pkImmeuble): object;
    public function getLogements(int $pkImmeuble, ?GetLogementsParams $params): array;
    // ... autres méthodes
}

// src/Service/Client.php
class Client
{
    public function __construct(
        private ClientStrategyInterface $strategy
    ) {}
    
    public function getTableauBordImmeuble(int $pkImmeuble): object
    {
        return $this->strategy->getTableauBordImmeuble($pkImmeuble);
    }
}
```

**Configuration :**
```yaml
# config/packages/services.yaml
parameters:
    app.data_source: '%env(string:DATA_SOURCE)%' # 'soap' ou 'oracle'

services:
    App\Service\SoapClientStrategy:
        arguments:
            $client: '@App\Service\BaseClient'
    
    App\Service\OracleClientStrategy:
        arguments:
            $immeubleRepo: '@App\Repository\Oracle\ImmeubleRepository'
            $logementRepo: '@App\Repository\Oracle\LogementRepository'
            # ...
    
    App\Service\Client:
        arguments:
            $strategy: 
                - '@App\Service\SoapClientStrategy'
                - '@App\Service\OracleClientStrategy'
```

**Livrables :**
- Pattern Adapter implémenté
- Feature flag fonctionnel
- Tests d'intégration

---

### Phase 2 : Migration Pilote

#### 2.1 Sélection de l'Endpoint Pilote (Semaine 4)

**Critères de sélection :**
- Endpoint simple (peu de dépendances)
- Utilisé fréquemment
- Facile à tester
- Impact limité en cas d'erreur

**Candidat proposé :** `getMyTableauBordClient()`

#### 2.2 Migration de l'Endpoint Pilote (Semaine 4-5)

**Tâches :**
- [ ] Implémenter la méthode dans `OracleClientStrategy`
- [ ] Créer le repository correspondant
- [ ] Écrire les requêtes SQL
- [ ] Mapper les résultats vers les objets attendus
- [ ] Activer le feature flag pour cet endpoint uniquement
- [ ] Tests fonctionnels complets

**Tests à effectuer :**
- [ ] Test unitaire du repository
- [ ] Test d'intégration avec Oracle
- [ ] Test de comparaison SOAP vs Oracle (même résultat)
- [ ] Test de performance
- [ ] Test de charge

#### 2.3 Validation et Monitoring (Semaine 5)

**Tâches :**
- [ ] Comparer les résultats SOAP vs Oracle
- [ ] Mesurer les performances (latence, débit)
- [ ] Monitorer les erreurs en production
- [ ] Collecter les métriques
- [ ] Ajuster les requêtes si nécessaire

**Métriques à suivre :**
- Temps de réponse moyen
- Taux d'erreur
- Utilisation CPU/Mémoire
- Nombre de requêtes Oracle
- Latence réseau

**Livrables :**
- Endpoint migré et validé
- Rapport de performance
- Documentation de la migration

---

### Phase 3 : Migration Progressive

#### 3.1 Priorisation des Endpoints (Semaine 6)

**Critères de priorisation :**
1. **Fréquence d'utilisation** (endpoints les plus appelés en premier)
2. **Complexité** (simples → complexes)
3. **Dépendances** (indépendants → dépendants)
4. **Impact métier** (faible → élevé)

**Ordre proposé :**
1. `getMyTableauBordClient()` ✅ (pilote)
2. `getTableauBordImmeuble()`
3. `getMyImmeubles()`
4. `getTableauBordLogement()`
5. `getLogements()`
6. `getInterventionsImmeuble()`
7. `getAnomaliesImmeuble()`
8. `getFuitesImmeuble()`
9. `getDysfonctionnementsImmeuble()`
10. `getOccupants()`
11. `createTicketInter()`
12. `getReportImmeuble()`
13. Autres endpoints...

#### 3.2 Processus de Migration par Endpoint (Semaine 6-17)

**Pour chaque endpoint :**

1. **Analyse (1-2 jours)**
   - [ ] Analyser la méthode SOAP actuelle
   - [ ] Identifier les tables Oracle
   - [ ] Documenter le mapping
   - [ ] Estimer la complexité

2. **Implémentation (2-5 jours)**
   - [ ] Créer/étendre le repository
   - [ ] Écrire les requêtes SQL
   - [ ] Implémenter le mapping
   - [ ] Implémenter dans `OracleClientStrategy`

3. **Tests (1-2 jours)**
   - [ ] Tests unitaires
   - [ ] Tests d'intégration
   - [ ] Tests de comparaison SOAP vs Oracle
   - [ ] Tests de performance

4. **Déploiement (1 jour)**
   - [ ] Activer le feature flag
   - [ ] Déploiement en staging
   - [ ] Validation en staging
   - [ ] Déploiement en production

5. **Monitoring (2-3 jours)**
   - [ ] Surveiller les métriques
   - [ ] Vérifier les logs d'erreur
   - [ ] Comparer les résultats
   - [ ] Ajuster si nécessaire

6. **Validation (1 jour)**
   - [ ] Validation fonctionnelle
   - [ ] Validation performance
   - [ ] Documentation
   - [ ] Marquer comme complété

**Template de suivi :**
```markdown
## Endpoint: [Nom]

- **Statut** : [ ] À faire | [ ] En cours | [ ] Test | [ ] Production | [ ] Validé
- **Responsable** : [Nom]
- **Date début** : [Date]
- **Date fin prévue** : [Date]
- **Complexité** : ⭐⭐⭐ (1-5)
- **Notes** : [Notes]
```

#### 3.3 Gestion des Endpoints Complexes

**Endpoints nécessitant une attention particulière :**

1. **Endpoints avec calculs complexes**
   - Exemple : `generateEvolutionChartsDataByTab()`
   - **Solution** : Implémenter les calculs dans SQL ou PHP selon la performance

2. **Endpoints avec exports (Excel, PDF)**
   - Exemple : `exportAnomalies()`
   - **Solution** : Générer les données depuis Oracle, utiliser les services métier existants

3. **Endpoints avec transactions**
   - Exemple : `createTicketInter()`
   - **Solution** : Utiliser les transactions Doctrine

4. **Endpoints avec cache**
   - **Solution** : Adapter la stratégie de cache pour Oracle

---

### Phase 4 : Stabilisation

#### 4.1 Optimisation (Semaine 18-19)

**Tâches :**
- [ ] Analyser les requêtes lentes (EXPLAIN PLAN)
- [ ] Optimiser les requêtes SQL
- [ ] Ajouter des index si nécessaire
- [ ] Optimiser le pool de connexions
- [ ] Mettre en cache les requêtes fréquentes

**Outils :**
- Oracle SQL Developer
- Doctrine Profiler
- APM (Application Performance Monitoring)

#### 4.2 Migration des Endpoints Restants (Semaine 18-20)

**Tâches :**
- [ ] Migrer les endpoints restants
- [ ] Valider tous les endpoints
- [ ] Tests de régression complets
- [ ] Tests de charge globaux

#### 4.3 Documentation (Semaine 19-20)

**Tâches :**
- [ ] Documenter l'architecture finale
- [ ] Documenter les requêtes SQL
- [ ] Créer un guide de maintenance
- [ ] Documenter les procédures de rollback

#### 4.4 Formation (Semaine 20)

**Tâches :**
- [ ] Formation de l'équipe sur Oracle
- [ ] Formation sur la nouvelle architecture
- [ ] Partage des bonnes pratiques
- [ ] Documentation des cas d'usage

---

### Phase 5 : Nettoyage

#### 5.1 Suppression du Code SOAP (Semaine 21)

**Tâches :**
- [ ] Supprimer `SoapClientStrategy` (garder en backup)
- [ ] Supprimer `BaseClient` (si plus utilisé)
- [ ] Nettoyer la configuration SOAP
- [ ] Supprimer les dépendances SOAP inutiles

**⚠️ Important :** Garder le code en archive pour rollback d'urgence

#### 5.2 Finalisation (Semaine 21)

**Tâches :**
- [ ] Revue de code finale
- [ ] Tests de régression
- [ ] Mise à jour de la documentation
- [ ] Communication aux équipes

---

## ⚠️ Risques et Mitigations

### Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Différences de données SOAP vs Oracle | Moyenne | Élevé | Tests de comparaison systématiques, validation manuelle |
| Performance Oracle inférieure à SOAP | Faible | Moyen | Optimisation des requêtes, index, cache |
| Erreurs de mapping | Moyenne | Élevé | Tests unitaires complets, validation des DTOs |
| Problèmes de connexion Oracle | Faible | Élevé | Pool de connexions, retry logic, monitoring |
| Requêtes SQL complexes | Élevée | Moyen | Formation équipe, code review, documentation |

### Risques Fonctionnels

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Données manquantes | Moyenne | Élevé | Analyse complète du mapping, tests de régression |
| Comportement différent | Moyenne | Moyen | Tests de comparaison, validation métier |
| Ralentissement de l'application | Faible | Élevé | Tests de performance, optimisation progressive |

### Risques Organisationnels

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Manque de compétences Oracle | Moyenne | Moyen | Formation, documentation, support externe si nécessaire |
| Retard dans le planning | Élevée | Moyen | Buffer dans le planning, priorisation flexible |
| Résistance au changement | Faible | Faible | Communication, formation, accompagnement |

### Plan de Rollback

**Pour chaque endpoint migré :**
1. Désactiver le feature flag (retour à SOAP)
2. Vérifier que SOAP fonctionne toujours
3. Analyser les logs d'erreur
4. Corriger les problèmes Oracle
5. Re-migrer après correction

**Rollback global :**
- Conserver le code SOAP en production
- Feature flag global pour basculer tout en SOAP
- Procédure de rollback documentée et testée

---

## ✅ Critères de Succès

### Critères Techniques

- [ ] **100% des endpoints migrés** vers Oracle
- [ ] **Performance** : Temps de réponse ≤ SOAP (ou amélioration de 20%)
- [ ] **Fiabilité** : Taux d'erreur < 0.1%
- [ ] **Couverture de tests** : > 80% pour les repositories
- [ ] **Documentation** : 100% des endpoints documentés

### Critères Fonctionnels

- [ ] **Compatibilité** : Résultats identiques entre SOAP et Oracle (à 99.9%)
- [ ] **Tests de régression** : 100% des tests passent
- [ ] **Validation métier** : Validation par les utilisateurs finaux

### Critères de Qualité

- [ ] **Code review** : Tous les PRs validés
- [ ] **Documentation** : Architecture et procédures documentées
- [ ] **Formation** : Équipe formée sur Oracle
- [ ] **Monitoring** : Dashboard de monitoring en place

---

## 📚 Annexes

### A. Structure de Fichiers Proposée

```
backend/
├── config/
│   └── packages/
│       └── oracle.yaml
├── src/
│   ├── Repository/
│   │   ├── Oracle/
│   │   │   ├── ImmeubleRepository.php
│   │   │   ├── LogementRepository.php
│   │   │   ├── InterventionRepository.php
│   │   │   └── ...
│   │   └── RepositoryInterface.php
│   ├── Service/
│   │   ├── Client.php (refactorisé)
│   │   ├── ClientStrategyInterface.php
│   │   ├── SoapClientStrategy.php
│   │   └── OracleClientStrategy.php
│   └── DTO/
│       └── Oracle/
│           ├── ImmeubleDTO.php
│           ├── LogementDTO.php
│           └── ...
└── tests/
    ├── Repository/
    │   └── Oracle/
    │       └── ImmeubleRepositoryTest.php
    └── Service/
        └── OracleClientStrategyTest.php
```

### B. Exemple de Code Repository

```php
<?php

namespace App\Repository\Oracle;

use App\DTO\Oracle\ImmeubleDTO;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Result;

class ImmeubleRepository implements ImmeubleRepositoryInterface
{
    public function __construct(
        private Connection $connection
    ) {}

    public function getTableauBordImmeuble(int $pkImmeuble, int $pkUser): object
    {
        $sql = "
            SELECT 
                i.PK_IMMEUBLE,
                i.NUMERO,
                i.ADRESSE1,
                i.CP,
                i.VILLE,
                -- ... autres champs
            FROM IMMEUBLES i
            WHERE i.PK_IMMEUBLE = :pkImmeuble
            AND i.PK_USER = :pkUser
        ";

        $stmt = $this->connection->prepare($sql);
        $result = $stmt->executeQuery([
            'pkImmeuble' => $pkImmeuble,
            'pkUser' => $pkUser
        ]);

        $data = $result->fetchAssociative();
        
        if (!$data) {
            throw new \RuntimeException('Immeuble not found');
        }

        // Mapper vers DTO puis vers objet compatible
        $dto = ImmeubleDTO::fromArray($data);
        return $dto->toObject();
    }
}
```

### C. Exemple de Feature Flag

```php
<?php

namespace App\Service;

class Client
{
    public function __construct(
        private ClientStrategyInterface $soapStrategy,
        private ClientStrategyInterface $oracleStrategy,
        private string $dataSource // 'soap' ou 'oracle'
    ) {}

    public function getTableauBordImmeuble(int $pkImmeuble): object
    {
        $strategy = $this->dataSource === 'oracle' 
            ? $this->oracleStrategy 
            : $this->soapStrategy;
            
        return $strategy->getTableauBordImmeuble($pkImmeuble);
    }
}
```

### D. Checklist de Migration par Endpoint

```markdown
## [Nom de l'endpoint]

### Préparation
- [ ] Analyse de la méthode SOAP
- [ ] Identification des tables Oracle
- [ ] Documentation du mapping
- [ ] Estimation de la complexité

### Implémentation
- [ ] Repository créé/étendu
- [ ] Requêtes SQL écrites
- [ ] Mapping implémenté
- [ ] DTO créé si nécessaire
- [ ] Implémentation dans OracleClientStrategy

### Tests
- [ ] Tests unitaires du repository
- [ ] Tests d'intégration
- [ ] Tests de comparaison SOAP vs Oracle
- [ ] Tests de performance
- [ ] Tests de charge

### Déploiement
- [ ] Feature flag activé
- [ ] Déploiement staging
- [ ] Validation staging
- [ ] Déploiement production
- [ ] Monitoring activé

### Validation
- [ ] Validation fonctionnelle
- [ ] Validation performance
- [ ] Documentation mise à jour
- [ ] Statut : ✅ Complété
```

### E. Métriques à Suivre

**Performance :**
- Temps de réponse moyen (p50, p95, p99)
- Débit (requêtes/seconde)
- Utilisation CPU/Mémoire
- Nombre de requêtes Oracle par endpoint

**Fiabilité :**
- Taux d'erreur
- Nombre de timeouts
- Nombre de connexions échouées

**Qualité :**
- Couverture de tests
- Nombre de bugs détectés
- Temps de résolution des bugs

### F. Ressources et Outils

**Outils de développement :**
- Oracle SQL Developer
- Doctrine DBAL
- PHPUnit (tests)
- Symfony Profiler

**Outils de monitoring :**
- APM (New Relic, Datadog, etc.)
- Logs applicatifs
- Métriques Oracle

**Documentation :**
- Oracle Database Documentation
- Doctrine DBAL Documentation
- Symfony Best Practices

---

## 📝 Notes Finales

### Points d'Attention

1. **Compatibilité des données** : S'assurer que les données Oracle correspondent exactement aux données SOAP
2. **Performance** : Optimiser les requêtes SQL dès le début
3. **Tests** : Ne pas négliger les tests de comparaison SOAP vs Oracle
4. **Monitoring** : Mettre en place un monitoring dès le début de la migration
5. **Documentation** : Documenter au fur et à mesure, ne pas attendre la fin

### Prochaines Étapes

1. Valider cette stratégie avec l'équipe
2. Estimer les ressources nécessaires
3. Définir le planning détaillé
4. Démarrer la Phase 1

---

**Document créé le :** [Date]  
**Version :** 1.0  
**Auteur :** [Nom]  
**Dernière mise à jour :** [Date]

