# Migration SOAP → Oracle : architecture et roadmap

## 1. Contexte et objectifs

### 1.1 Situation actuelle

- **Contrôleurs API** (`src/Controller/Api/*`) : reçoivent les requêtes, appellent le **Client** (session SOAP via headers).
- **Service Client** (`App\Service\Client` étendant `BaseClient`) : point d’entrée unique pour les données ; appelle les **web services SOAP** via `sendRequest()`.
- **Services métier** (`Immeuble`, `Logement`, `Depannage`, `Fuite`, `Anomalie`, `Dysfonctionnement`, etc.) : **transformation** des données (graphiques, exports, filtres) ; ils ne font pas d’appel SOAP, ils travaillent sur les objets déjà renvoyés par le Client.

Flux actuel :

```
Requête HTTP (X-Session-ID, X-Pk-User)
    → Controller API
    → getAuthenticatedClientFromHeaders() → Client (session restaurée)
    → $client->getMyTableauBordClient() / getImmeubles() / getLogements() / …
    → BaseClient::sendRequest('GetTableauBordClient', …)
    → SoapClient → Web service SOAP
```

Les écritures (tickets, relevés, gestionnaires, etc.) passent aussi par le Client (ex. `setTicketStatutClient`, `setReleveOccupant`, `createGestionnaire`).

### 1.2 Objectifs de la migration

1. **GET** : à terme, servis par **appels directs Oracle** (SQL / Doctrine).
2. **Non-GET** : dans un premier temps rester sur **SOAP** ; à terme tout migrer en SQL.
3. **Cohabitation** : pendant la transition, pouvoir utiliser **Oracle pour les GET** et **SOAP pour les écritures** (et éventuellement quelques GET non encore migrés).
4. **Pas de big-bang** : migration progressive, par cas d’usage, avec possibilité de rollback (feature flag ou config).

### 1.3 Question d’architecture

Faut-il :

- **A)** Introduire une **sous-couche dédiée** (ex. `Service/Api/` ou `Service/DataSource/`) avec des “providers” Oracle vs SOAP, **ou**
- **B)** **Conserver les services actuels** et **injecter un connecteur Oracle** (ou une stratégie) **dans le Client existant** ?

Recommandation : **B** — garder le Client comme point d’entrée unique et injecter une “source de données” (SOAP ou Oracle, ou mixte) derrière lui. Pas de nouvelle sous-couche “API” dans `Service/`, uniquement des implémentations (SOAP vs Oracle) et une couche **Repository** pour Oracle.

---

## 2. Recommandation : conserver le Client, injecter la source de données

### 2.1 Pourquoi ne pas créer un sous-dossier `Service/Api/` ?

- Les contrôleurs parlent déjà au **Client** ; ajouter une couche “API” au-dessus du Client dupliquerait les appels et compliquerait la lisibilité.
- Les services métier (`Immeuble`, `Logement`, etc.) travaillent sur des **objets** renvoyés par le Client ; ils n’ont pas besoin de savoir si ces objets viennent de SOAP ou d’Oracle, tant que la **forme** reste la même (ou adaptée).
- Un **Client unique** qui délègue à une **stratégie / source de données** (SOAP ou Oracle) garde une seule API métier, un seul point à configurer (feature flag, env) et évite de dupliquer la logique d’auth/session.

### 2.2 Pourquoi injecter un “connecteur” Oracle dans le Client ?

- **Rétrocompatibilité** : les contrôleurs et l’auth (SoapSessionUser, headers) continuent d’utiliser le même `Client`.
- **Migration progressive** : on peut faire “GET → Oracle, reste → SOAP” puis “tout Oracle” en ne changeant que la stratégie ou la config, pas les contrôleurs.
- **Tests** : on peut mocker la source de données (SOAP ou Oracle) au même endroit.
- **Séparation des rôles** : le Client reste la **façade métier** ; la **lecture/écriture** est déléguée à un composant (SOAP ou Oracle) injecté.

---

## 3. Architecture cible proposée

### 3.1 Principe : Client = façade, délégation à une “source de données”

- Le **Client** conserve sa signature publique actuelle (ex. `getMyTableauBordClient()`, `getImmeubles()`, `setTicketStatutClient()`, etc.).
- En interne, le Client ne contient plus la logique SOAP directe : il délègue à un objet **“DataSource”** ou **“Backend”** (interface).
- Deux implémentations :
  - **SoapDataSource** (ou `SoapClientStrategy`) : réutilise `BaseClient` / SOAP actuel.
  - **OracleDataSource** (ou `OracleClientStrategy`) : utilise des **repositories** Oracle (Doctrine DBAL ou ORM) et retourne des objets **compatibles** avec ce que les contrôleurs et services métier attendent aujourd’hui.

Pendant la phase “GET Oracle + écritures SOAP”, on peut soit :

- avoir **une seule** implémentation “hybride” qui :
  - pour chaque méthode GET migrée → appelle Oracle,
  - pour le reste (GET non migrés + tous les non-GET) → appelle SOAP ;
- soit **deux implémentations** (Oracle + SOAP) et un **routeur** (ou décorateur) qui choisit par méthode.

Les deux sont viables ; le document suppose une **stratégie unique par “type”** (GET vs non-GET) ou par **feature flag par méthode**, pour simplifier.

### 3.2 Schéma cible (vue simplifiée)

```
┌─────────────────────────────────────────────────────────────────┐
│                     Contrôleurs API                               │
│  (ImmeubleApiController, LogementApiController, …)                │
│  + AbstractApiController → getAuthenticatedClientFromHeaders()    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Client (App\Service\Client) — façade inchangée pour les appels │
│  - getMyTableauBordClient()  - getImmeubles()  - getLogements()   │
│  - setTicketStatutClient()   - setReleveOccupant()  - …          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  DataSourceInterface (ou ClientStrategyInterface)                │
│  - getTableauBordClient(...)  - getImmeubles(...)  - …           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
            ┌───────────────────┴───────────────────┐
            ▼                                       ▼
┌───────────────────────────┐       ┌───────────────────────────────┐
│  SoapDataSource            │       │  OracleDataSource             │
│  (wrap BaseClient / SOAP)   │       │  (utilise Repository Oracle)  │
│  - lecture + écriture      │       │  - lecture (GET)              │
│    tant que non migré      │       │  - écriture (après Phase 3)    │
└─────────────┬──────────────┘       └───────────────┬───────────────┘
              │                                      │
              ▼                                      ▼
┌───────────────────────────┐       ┌───────────────────────────────┐
│  BaseClient → SoapClient  │       │  Repository\Oracle\*           │
│  Web services SOAP        │       │  - TableauBordRepository       │
└───────────────────────────┘       │  - ImmeubleRepository          │
                                     │  - LogementRepository          │
                                     │  - … + Doctrine DBAL/Connection│
                                     └───────────────────────────────┘
```

- **Services métier** (`Immeuble`, `Logement`, `Depannage`, etc.) restent utilisés par les contrôleurs pour **transformation** ; ils reçoivent les mêmes “formes” d’objets (éventuellement des DTOs identiques que la stratégie Oracle renverra pour compatibilité).

### 3.3 Où placer les classes ?

- **Pas de sous-couche “API” dans Service/** : on évite un `Service/Api/` qui redoublerait le rôle du Client.
- **Interface + implémentations dans Service/** :
  - `App\Service\DataSource\DataSourceInterface` (ou `ClientStrategyInterface`)
  - `App\Service\DataSource\SoapDataSource`
  - `App\Service\DataSource\OracleDataSource` (ou `HybridDataSource` si on fait GET=Oracle, reste=SOAP dans une seule classe)
- **Oracle : couche Repository** (recommandé) :
  - `App\Repository\Oracle\*` (ex. `TableauBordRepository`, `ImmeubleRepository`, `LogementRepository`, etc.) pour toute la logique SQL/Oracle.
- **Optionnel** : sous-dossier `Service/DataSource/` pour garder les stratégies regroupées, sans créer une couche “API” supplémentaire.

Résumé :

- **Conserver les services actuels** (Client, Immeuble, Logement, …).
- **Injecter** une “source de données” (SOAP ou Oracle) **dans le Client**.
- **Ne pas** ajouter une sous-couche “/api” dans `/services` ; à la place, une interface + 2 implémentations (SOAP / Oracle) et des repositories Oracle.

---

## 4. Roadmap de migration

### Phase 1 : GET d’abord via Oracle (lecture seule)

- **Objectif** : les endpoints **GET** (tableau de bord, immeubles, logements, rapports en lecture, etc.) s’appuient sur Oracle ; le reste reste en SOAP.
- **Actions** :
  - Définir `DataSourceInterface` avec les méthodes “GET” nécessaires (ex. `getTableauBordClient`, `getImmeubles`, `getLogements`, …).
  - Implémenter `SoapDataSource` qui délègue à l’actuel `BaseClient` / Client SOAP.
  - Créer les repositories Oracle (ex. `TableauBordRepository`, `ImmeubleRepository`, `LogementRepository`) et implémenter `OracleDataSource` pour ces GET.
  - Refactoriser `Client` pour qu’il délègue à une `DataSource` injectée (une seule implémentation “hybride” ou un routeur GET→Oracle, reste→SOAP).
  - Config / feature flag pour choisir la source (ex. `DATA_SOURCE=oracle|soap|hybrid`).
- **Critère de succès** : aucun changement de contrat des contrôleurs ; les GET migrés renvoient les mêmes structures (éventuellement via DTOs mappés depuis Oracle).

### Phase 2 : Garder les non-GET en SOAP

- **Objectif** : toutes les **écritures** et appels **non-GET** restent en SOAP (ex. création de ticket, relevé occupant, mise à jour statut, gestionnaires, etc.).
- **Actions** :
  - S’assurer que l’interface de données (ou la stratégie hybride) envoie bien tous les appels non-GET vers le SOAP.
  - Documenter quels endpoints sont “GET Oracle” vs “SOAP”.
  - Tests de non-régression sur écritures et sur les GET encore en SOAP si besoin.
- **Critère de succès** : production stable avec GET Oracle + écritures SOAP.

### Phase 3 : Migrer les écritures vers Oracle (SQL)

- **Objectif** : remplacer progressivement les appels SOAP d’écriture par des **procédures stockées**, **requêtes SQL** ou **ORM** sur Oracle.
- **Actions** :
  - Étendre les repositories Oracle (ou en créer) pour les opérations d’écriture (ex. `TicketRepository::setStatut()`, `OccupantRepository::setReleve()`, …).
  - Étendre `OracleDataSource` (ou la stratégie) pour appeler ces repositories au lieu de SOAP.
  - Feature flag ou config par opération si besoin (ex. “tickets encore en SOAP”, “relevés en Oracle”).
  - Désactiver les appels SOAP une fois tout migré.
- **Critère de succès** : plus d’appel SOAP métier ; tout passe par Oracle.

### Phase 4 : Nettoyage

- **Objectif** : retirer le code SOAP inutilisé, BaseClient dédié SOAP (ou le garder pour d’éventuels autres usages), et documenter l’architecture finale.
- **Actions** : suppression / archivage du code mort, mise à jour de la config et de la doc (dont ce fichier).

---

## 5. Décisions techniques à trancher

| Sujet | Options | Recommandation |
|-------|--------|----------------|
| Structure sous Service/ | (A) `Service/Api/` avec providers vs (B) pas de sous-couche “API”, stratégie injectée dans Client | **B** : garder Client, injecter DataSource/Strategy. |
| Où mettre la logique Oracle ? | Repository uniquement vs Service dédié “Oracle” qui appelle des repositories | **Repository** pour SQL ; une seule classe “OracleDataSource” (ou stratégie) dans Service qui utilise ces repositories. |
| Compatibilité des réponses | Même objets / stdClass que SOAP vs DTOs dédiés | **DTOs** (ou stdClass construits) pour que les services métier (Immeuble, Logement, …) et les contrôleurs ne voient pas de différence. |
| Feature flag | Global (tout GET Oracle ou tout SOAP) vs par endpoint | Commencer **global** (ex. `DATA_SOURCE=hybrid`), affiner par endpoint si besoin. |
| Auth / session | Rester sur session SOAP (retrieveSession) vs session Oracle | **Rester** sur session SOAP (ou même mécanisme de session) tant que l’auth actuelle est basée sur SOAP ; à long terme, possible migration vers une auth propre (JWT, etc.) si souhaité. |

---

## 6. Résumé

- **Architecture** : on **conserve les contrôleurs et le Client** ; on **n’introduit pas** une sous-couche “/api” dans `/services`. On **injecte** une source de données (SOAP ou Oracle) **dans le Client**.
- **Oracle** : logique SQL dans **Repository (Oracle)** ; une **OracleDataSource** (ou stratégie) dans Service utilise ces repositories et expose la même “API” que le SOAP pour le Client.
- **Roadmap** : **Phase 1** = GET via Oracle ; **Phase 2** = écritures et non-GET restent en SOAP ; **Phase 3** = migration des écritures en SQL ; **Phase 4** = nettoyage SOAP.

Cela permet d’avoir **en parallèle** des appels SOAP (pour les non-GET) et des appels directs Oracle (pour les GET), puis à terme tout en SQL, sans dupliquer la couche “API” dans les services.

---

## 7. Exemple implémenté : GET Factures

Un premier endpoint GET a été migré selon ce schéma : **liste et détail des factures** (`FactureApiController`).

### Fichiers créés

| Fichier | Rôle |
|--------|------|
| `src/Service/DataSource/FactureListProviderInterface.php` | Contrat : `getFactures(Client $client): object` |
| `src/Service/DataSource/SoapFactureListProvider.php` | Délègue à `$client->getFactures()` (SOAP) |
| `src/Service/DataSource/OracleFactureListProvider.php` | Utilise `FactureRepository` et renvoie un objet compatible SOAP |
| `src/Service/DataSource/FactureListProviderRouter.php` | Choisit SOAP ou Oracle selon la config |
| `src/Repository/Oracle/FactureRepository.php` | Requête SQL (à adapter au schéma Oracle) |

### Configuration

- **Paramètre** : `data_source_factures` (défaut `soap`).
- **Variable d’environnement** : `DATA_SOURCE_FACTURES=soap` ou `DATA_SOURCE_FACTURES=oracle`.
- Dans `config/services.yaml`, `FactureListProviderInterface` est aliasée vers `FactureListProviderRouter`, qui reçoit ce paramètre et délègue au bon provider.

### Comportement

- **GET /api/factures** (liste) et **GET /api/factures/{pkFacture}** (détail) utilisent `FactureListProviderInterface` → SOAP ou Oracle selon la config.
- **GET /api/factures/{pkFacture}/download** (PDF) reste en SOAP (`$client->getReportFacture()`).

### Adapter la requête Oracle

Dans `FactureRepository::getFacturesForUser()`, la requête SQL (noms de tables/colonnes) est un **placeholder**. À adapter au schéma réel et aux droits utilisateur (ex. filtre par `PKUSER` ou équivalent).

---

## 8. Générer repositories / entités depuis la BDD Oracle

Il n’existe **pas** de commande Symfony du type « génère tous les repositories depuis la BDD ». On peut en revanche s’appuyer sur le schéma Oracle de deux manières : **ORM (entités)** ou **DBAL (SQL manuel)**.

### Approche 1 : ORM – entités + repositories à partir du schéma

Doctrine peut **générer des classes Entity** à partir des tables Oracle existantes. Ensuite, on crée un repository par entité (à la main ou avec `make:entity`).

1. **Connexion Oracle** : `DATABASE_URL` doit pointer vers Oracle (voir `config/packages/doctrine.yaml`).

2. **Générer les entités depuis la BDD** :
   ```bash
   php bin/console doctrine:mapping:import "App\Entity" attribute --path=src/Entity
   ```
   - Crée une classe Entity par table (dans `src/Entity/`).
   - Utilise les **attributes** PHP 8 (recommandé). Pour des annotations : remplacer `attribute` par `annotation`.
   - Les noms de tables/colonnes Oracle sont reportés tels quels ; vous pourrez renommer les propriétés ensuite.

3. **Créer (ou régénérer) les repositories** :
   - Soit à la main : une classe `XxxRepository` dans `src/Repository/` qui étend `ServiceEntityRepository<Xxx>` (ou `EntityRepository`).
   - Soit en créant une entité avec le maker, qui propose d’ajouter un repository :
     ```bash
   php bin/console make:entity
   ```
   (indiquer le nom de l’entité existante si besoin, et choisir « yes » pour générer un repository).

4. **Limites** : le mapping importé reflète le schéma Oracle (noms, types). Pour coller au format « SOAP » attendu par le reste de l’app, il faudra soit adapter les entités, soit faire une couche de conversion (Entity → stdClass/DTO) dans le provider.

**Quand l’utiliser** : schéma Oracle stable, besoin de requêtes type DQL/QueryBuilder, relations, et possibilité d’adapter le modèle à l’app.

---

### Approche 2 : DBAL – repositories SQL manuel (recommandée pour la migration)

C’est l’approche utilisée pour **FactureRepository** : pas d’entités, uniquement **Doctrine DBAL** (`Connection`) et du SQL dans des classes dédiées (`src/Repository/Oracle/*`).

- **Pas de génération** : vous écrivez la requête SQL et le mapping (tableau associatif → stdClass/array) vous-même.
- **Avantages** : contrôle total sur la forme des données, facile d’aligner la sortie sur la réponse SOAP, pas de conflit avec un schéma Oracle « métier » différent du contrat SOAP.
- **Workflow typique** :
  1. Inspecter le schéma Oracle (tables/vues, colonnes) via un client SQL ou :
     ```bash
   php bin/console doctrine:query:sql "SELECT * FROM MA_TABLE WHERE ROWNUM = 1"
   ```
  2. Créer (ou compléter) `src/Repository/Oracle/XxxRepository.php` avec une méthode qui exécute une requête et retourne des tableaux associatifs (ou des objets construits).
  3. Le provider (ex. `OracleFactureListProvider`) appelle ce repository et construit la structure attendue par le contrôleur (ex. `ListeFactures->facture`).

**Recommandation pour votre migration** : rester sur cette approche DBAL + repositories Oracle dédiés tant que vous gardez la compatibilité avec la forme « SOAP » côté API. Quand toute la lecture sera migrée et stabilisée, vous pourrez éventuellement introduire des entités ORM et des repositories ORM pour les parties où le schéma Oracle devient la référence.

---

### Récap

| Besoin | Outil / approche |
|--------|-------------------|
| Générer des **entités** à partir des tables Oracle | `doctrine:mapping:import "App\Entity" attribute --path=src/Entity` |
| Créer un **repository** pour une entité | `make:entity` (option repository) ou créer une classe qui étend `ServiceEntityRepository<Xxx>` |
| Repository **sans entité** (SQL pur, format libre) | Pas de commande ; écrire `src/Repository/Oracle/XxxRepository.php` + SQL à la main (approche actuelle FactureRepository). |
| Inspecter le schéma / tester une requête | `doctrine:query:sql "SELECT …"` ou client SQL (DBeaver, SQL Developer, etc.) |
