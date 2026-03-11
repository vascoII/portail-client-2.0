## Migration des séries de consommations immeuble (EAU / REPART / CET / Capteurs)

### 1. Contexte

- **Actuel** : les écrans de tableau de bord immeuble (`getTableauBordImmeuble` côté PHP, `GetTableauBordImmeuble` côté C#) s'appuient sur les WebServices historiques (`WS_Common.cs`) pour :
  - les **compteurs et agrégats** (NBEC, NBEF, NBREPART, NBCET, NBLOGEMENT, NBFUITES\_*, NBANO\_*, etc.),
  - les **ratios de relevés** (nombre de compteurs relevés / à relever),
  - les **séries de consommations** (EAU, REPART, CET, compteur général),
  - les **capteurs** (température / humidité).
- **Déjà migré côté Oracle** :
  - tableau de bord client → `TableauBordClientRepository`,
  - principaux compteurs immeuble (logements, NBs, ratios de relevés) → `ImmeubleRepository::getImmeubleCount`, `getImmeubleEc`, `getImmeubleEf`, `getImmeubleRepart`, `getImmeubleCet`.
- **Reste à migrer** : toute la partie **séries de consommations** et **capteurs**, qui est plus complexe (agrégations temporelles, MongoDB, etc.).

Ce document décrit le **chantier spécifique** pour migrer ces séries vers un accès Oracle/direct, ou à défaut clarifier ce qui restera délégué aux WebServices/Mongo.

---

### 2. Périmètre fonctionnel côté C#

Dans `WS_Common.cs`, pour `GetTableauBordImmeuble` (branche `#if WS2`) :

- **EAU (EC / EF)** :
  - Séries annuelles / mensuelles via :
    - `GetSerieConsosRelevesMois2Ans(...)`
    - `GetSerieConsosReleves(...)`
  - Alimentent :
    - `TBImmeuble.ImmeubleEC.SerieConsos1`, `SerieConsos2`
    - `TBImmeuble.ImmeubleEF.SerieConsos1`, `SerieConsos2`
  - Séries EAU globales via `GetSerieConsosReleves(SessionID, PkUser, "I", PkImmeuble, "EC+EF", ...)` pour `TBImmeuble.SerieConsosEAU`.

- **REPART / CET** :
  - Sur REPART :
    - `GetSerieConsos15J("I", PkImmeuble, "REPART", ...)` pour `SerieConsosTotale1/2/DJU`.
  - Sur CET :
    - `GetSerieConsosRelevesMois2Ans("I", PkImmeuble, "CET", ...)` pour `SerieConsosTotale1/2/DJU`.

- **Compteur général** :
  - Séries similaires (relevés / index) utilisées pour `SerieConsosCompteurGeneral`.

- **Capteurs** :
  - **MongoDB**, pas Oracle :
    - `GetIndexRecapCapteur("I", PkImmeuble, UnitesFk.Temperature/Humidite, LastDateIndex)` pour `IndexRecapTemperature/Humidite`.
    - `GetSerieCapteurByImmeuble(...)` pour `SerieConsosTemperature/Humidite`.

Ces méthodes manipulent :

- Tables Oracle : `RELEVE`, `INDEXCONSO`, éventuellement `COMPTEUR`, `ARTICLE`.
- Collections MongoDB : `INDEXCONSOTCH`, etc. (pour capteurs).

---

### 3. Objectifs de la migration

1. **Réduire progressivement la dépendance au SOAP** pour les séries de consos:
   - Construire `SerieDto` côté PHP directement depuis Oracle pour :
     - `SerieConsosEAU` (EAU globale),
     - `ImmeubleEC.SerieConsos1/2`,
     - `ImmeubleEF.SerieConsos1/2`,
     - `ImmeubleRepart.SerieConsos`, `SerieConsosTotale1/2/DJU`,
     - `ImmeubleCET.SerieConsos`, `SerieConsosTotale1/2/DJU`,
     - `SerieConsosCompteurGeneral`.
2. **Capteurs** :
   - Soit rester branché sur les WebServices/Mongo dans un premier temps,
   - soit définir un flux dédié (microservice ou cron) qui pousse les valeurs capteurs dans des tables Oracle pour un traitement homogène.

---

### 4. Plan technique par étape

#### 4.1. Cartographier précisément les requêtes Oracle dans WS_Common

Pour chaque méthode série :

- `GetSerieConsosRelevesMois2Ans` :
  - Lister les tables Oracle utilisées (`RELEVE`, `INDEXCONSO`, `COMPTEUR`, etc.).
  - Comprendre :
    - découpage par mois,
    - fenêtrage temporel (2 ans, glissant),
    - filtrage par type appareil / fluide.
- `GetSerieConsosReleves` :
  - Idem mais sur une fenêtre plus simple (date début / date fin).
- `GetSerieConsos15J` :
  - Vérifier la granularité (période de 15 jours, index DJU, etc.).

**Sortie attendue** : pour chaque méthode, un pseudo‑SQL clair décrivant :

- Les jointures,
- Le group by,
- La structure de sortie (valeursXyl, année, intervalle par défaut).

#### 4.2. Définir des méthodes repository Oracle dédiées

Dans `ImmeubleRepository` (ou un repo Oracle dédié aux consos) :

- Ajouter des méthodes internes type :

```php
private function buildSerieEauForImmeuble(int $pkImmeuble): SerieDto
private function buildSerieRepartForImmeuble(int $pkImmeuble): SerieDto
private function buildSerieCETForImmeuble(int $pkImmeuble): SerieDto
private function buildSerieCompteurGeneralForImmeuble(int $pkImmeuble): SerieDto
```

- Ces méthodes :
  - exécutent le (ou les) SQL(s) reconstitués depuis WS_Common,
  - formatent les résultats dans le format `valeursXyl` attendu par le front,
  - remplissent `defaultIntervalle` et `annee` de `SerieDto`.

#### 4.3. Implémenter `getImmeubleSerieConsosEau` et `getImmeubleSerieConsosCompteurGeneral`

Dans `ImmeubleRepository` :

- `getImmeubleSerieConsosEau($pkUser, $pkImmeuble)` :
  - appelle `buildSerieEauForImmeuble($pkImmeuble)`,
  - renvoie le `SerieDto` produit.
- `getImmeubleSerieConsosCompteurGeneral($pkUser, $pkImmeuble)` :
  - appelle `buildSerieCompteurGeneralForImmeuble($pkImmeuble)`.

#### 4.4. Alimentation des séries dans les DTO EAU / REPART / CET

Mettre à jour :

- `getImmeubleEc` / `getImmeubleEf` :
  - appel à `buildSerieEauForImmeuble(...)` pour `serieConsos1/2` (paramétrée par type ERC/année).
- `getImmeubleRepart` :
  - appel à `buildSerieRepartForImmeuble(...)` pour `serieConsos`, `serieConsosTotale1/2/DJU`.
- `getImmeubleCet` :
  - appel à `buildSerieCETForImmeuble(...)` pour `serieConsos`, `serieConsosTotale1/2/DJU`.

L’idée est d’éviter de dupliquer trop de logique : idéalement, `buildSerie*` sait construire les différentes variantes (totale, DJU, etc.) d’un coup.

---

### 5. Cas spécifiques capteurs (température / humidité)

Les capteurs (température/humidité) sont une **exception importante** :

- Les données sont **dans MongoDB**, pas Oracle :
  - `GetIndexRecapCapteur` → Mongo (aggrégations, `$group`, `$lookup`).
  - `GetSerieCapteurByImmeuble` → Mongo.
- Tant qu’on n’a pas :
  - soit un **accès Mongo** équivalent en PHP,
  - soit un **flux de réplication** vers Oracle,
  - on ne peut pas reproduire ces valeurs dans `ImmeubleCapteurDto` par SQL Oracle.

**Plan recommandé** :

1. **Court terme** :
   - Laisser `getImmeubleCapteur` renvoyer des DTO vides / neutres (ce qui est déjà le cas),
   - Coupler toujours l’affichage capteurs avec la réponse actuelle du WS.
2. **Moyen terme** (si besoin métier fort) :
   - Soit intégrer un client MongoDB côté Symfony et reproduire les aggrégations Mongo en PHP,
   - Soit mettre en place un **job batch** qui écrit régulièrement les index capteurs dans des tables Oracle lues par le repo.

---

### 6. Stratégie de validation

Pour chaque série migrée :

1. **Mode double lecture** (comme déjà fait pour le tableau de bord immeuble) :
   - dans `ImmeubleApiController::show`, garder :
     - `immeuble` (SOAP),
     - `immeubleOracle` (Oracle).
2. **Comparer** sur un échantillon :
   - séries EAU → courbes similaires (même nombre de points, mêmes dates / valeurs),
   - séries REPART/CET/compteur général,
   - assurer que les agrégations, périodes et intervalles sont bien identiques.
3. **Bascule progressive** :
   - une fois les écarts résolus, autoriser le front à consommer directement les séries Oracle (via `immeubleOracle`), en conservant temporairement l’ancien flux pour debug.

---

### 7. Priorisation recommandée

1. **Étape 1 – EAU simple** :
   - `getImmeubleSerieConsosEau`,
   - `ImmeubleEC.SerieConsos1/2`, `ImmeubleEF.SerieConsos1/2`.
2. **Étape 2 – REPART / CET** :
   - séries totales et DJU.
3. **Étape 3 – Compteur général** :
   - `SerieConsosCompteurGeneral`.
4. **Étape 4 – Capteurs** :
   - seulement si un accès Mongo ou un miroir Oracle est disponible.

Ce fichier doit être mis à jour au fur et à mesure que chaque étape est implémentée et validée (liste des méthodes repository finalisées, des DTO complètement alimentés, et des endpoints basculés en “Oracle only”). 

