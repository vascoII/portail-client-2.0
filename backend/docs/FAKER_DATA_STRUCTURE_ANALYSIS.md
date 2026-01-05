# 📊 Analyse de la Structure des Données pour les Fichiers JSON Fake

**Date** : 2025-01-XX  
**Objectif** : Comprendre la structure des réponses API pour créer les fichiers JSON fake avec la bonne structure

---

## 🔍 Observations Générales

### 1. **Pas de DTOs (Data Transfer Objects)**

✅ **Confirmation** : Il n'y a **aucune classe DTO** dans le projet. Les données proviennent directement des objets SOAP retournés par le service `Client` et sont normalisées à la volée.

### 2. **Structure de Réponse Standard**

Toutes les réponses API utilisent la méthode `$this->success($data, $message)` qui crée automatiquement cette structure :

```json
{
  "success": true,
  "status": 200,
  "message": "...",  // Optionnel
  "data": { ... }    // Les données réelles
}
```

### 3. **Normalisation des Données**

La méthode `normalize()` dans `AbstractApiController` :

- Convertit récursivement les objets en tableaux
- Gère les objets imbriqués
- Préserve la structure des données

**Important** : Le `FakeDataService` lit le JSON avec `json_decode($json, false)`, ce qui retourne un **objet** (pas un array). Cet objet est ensuite normalisé avant d'être passé à `success()`.

### 4. **Structure des Fichiers JSON Fake**

**⚠️ CRUCIAL** : Les fichiers JSON doivent contenir **uniquement les données** (ce qui sera dans `data`), **PAS** le wrapper `success/status/data`, car `sendFakeData()` ajoute automatiquement ce wrapper via `$this->success($normalizedData, $message)`.

---

## 📋 Structure des Réponses par Endpoint

### TableauBordClientApiController (`/api/parc`)

#### `api.parc.json` (GET `/api/parc`)

```json
{
  "board": {
    "NbCompteursPoses": 100,
    "NbCompteursCommandes": 120,
    "NbCompteursReleves": 95,
    "NbCompteursARelever": 25,
    "NbImmeubles": 15,
    "NbImmeublesTransfertFichiers": 12,
    "PcImmeublesTelereleve": "79",
    "PcImmeublesTransfertFichiers": "80",
    "ListeInfosImmeubles": {
      "infosImmeuble": [
        {
          "PkImmeuble": 2108,
          "Immeuble": {
            "Nom": "Résidence Les Jardins",
            "Adresse1": "123 Rue de la Paix",
            "Cp": "75001",
            "Ville": "Paris",
            "NbLogements": 45
          },
          "NbAnomalies": 2,
          "NbDepannages": 5,
          "NbDysfonctionnements": 1,
          "NbFuites": 0,
          "NbCompteurs": 90
        }
      ]
    }
  },
  "chantier": {
    "installed": 100,
    "installed_percent": 83,
    "remaining": 20,
    "remaining_percent": 17,
    "total": 120,
    "date": null
  }
}
```

---

### FactureApiController (`/api/factures`)

#### `api.factures.json` (GET `/api/factures`)

```json
{
  "factures": [
    {
      "pkFacture": 12345,
      "numero": "FAC-2025-001",
      "dateEdition": "2025-01-15",
      "dateEditionFormatted": "15/01/2025",
      "montantTotalHT": 1000.0,
      "montantTotalHTFormatted": "1 000,00 €",
      "montantTotalTTC": 1200.0,
      "montantTotalTTCFormatted": "1 200,00 €",
      "montantTotalAPayer": 1200.0,
      "montantTotalAPayerFormatted": "1 200,00 €"
    }
  ],
  "count": 1
}
```

#### `api.factures.pkFacture.json` (GET `/api/factures/{pkFacture}`)

```json
{
  "pkFacture": 12345,
  "numero": "FAC-2025-001",
  "dateEdition": "2025-01-15",
  "dateEditionFormatted": "15/01/2025",
  "montantTotalHT": 1000.0,
  "montantTotalHTFormatted": "1 000,00 €",
  "montantTotalTTC": 1200.0,
  "montantTotalTTCFormatted": "1 200,00 €",
  "montantTotalAPayer": 1200.0,
  "montantTotalAPayerFormatted": "1 200,00 €"
}
```

---

### SecurityApiController (`/api/security`)

#### `api.security.login.param.json` (GET `/api/security/login/{param}`)

```json
{
  "user": {
    "PKUser": 1043,
    "LoginID": "demo@techem.fr",
    "Email": "demo@techem.fr",
    "UserType": "G",
    "UserName": "Demo",
    "FirstName": "Client"
  },
  "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"],
  "session_id": "54ea1174-b2f9-4472-bfb6-93ebe19d596b",
  "pk_user": 1043
}
```

#### `api.security.me.json` (GET `/api/security/me`)

```json
{
  "user": {
    "pkUser": 1043,
    "loginID": "demo@techem.fr",
    "email": "demo@techem.fr",
    "userType": "G",
    "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"],
    "dashboardUrl": "/api/dashboard"
  }
}
```

---

### ImmeubleApiController (`/api/immeubles`)

#### `api.immeubles.json` (GET `/api/immeubles`)

```json
{
  "board": {
    "NbCompteursPoses": 100,
    "NbCompteursCommandes": 120,
    "NbCompteursReleves": 95,
    "NbCompteursARelever": 25,
    "NbImmeubles": 15,
    "NbImmeublesTransfertFichiers": 12,
    "PcImmeublesTelereleve": "79",
    "PcImmeublesTransfertFichiers": "80",
    "ListeInfosImmeubles": {
      "infosImmeuble": [...]
    }
  },
  "filters": []
}
```

#### `api.immeubles.pkImmeuble.json` (GET `/api/immeubles/{pkImmeuble}`)

```json
{
  "immeuble": {
    "PkImmeuble": 2108,
    "Immeuble": {
      "PkImmeuble": 2108,
      "Nom": "Résidence Les Jardins",
      "Adresse1": "123 Rue de la Paix",
      "Adresse2": null,
      "Cp": "75001",
      "Ville": "Paris",
      "NbLogements": 45
    },
    "ImmeubleEC": {
      "NbCompteursPoses": 90,
      "NbCompteursCommandes": 90,
      "NbCompteursReleves": 85,
      "NbCompteursARelever": 5,
      "Chantier": {
        "NbCompteursPoses": 90,
        "NbCompteursCommandes": 90,
        "DateEntreeChantier": "2024-01-15T00:00:00"
      }
    },
    "SerieConsosECValues": [
      ["2024-01", "1500"],
      ["2024-02", "1600"]
    ],
    "SerieConsosEFValues": [...],
    "PcCompteursTelereveleOK": 94.44,
    "NbDepannages": 5,
    "NbDysfonctionnements": 1,
    "NbAnomalies": 2,
    "NbFuites": 0,
    "NbAppareils": 90,
    "RatioNbDepannages": 0.056,
    "RatioNbDysfonctionnements": 0.011
  },
  "evolution_charts": {
    "EC": [...],
    "EF": [...]
  },
  "comparative_chart": {
    "labels": [...],
    "datasets": [...]
  },
  "tabs_top_consos": {
    "EC": [...],
    "EF": [...]
  },
  "tabs_evo_consos": {
    "EC": [...],
    "EF": [...]
  },
  "chantier": {
    "installed": 90,
    "installed_percent": 100,
    "remaining": 0,
    "remaining_percent": 0,
    "total": 90,
    "date": "15/01/2024"
  }
}
```

#### `api.immeubles.pkImmeuble.interventions.json` (GET `/api/immeubles/{pkImmeuble}/interventions`)

```json
{
  "immeuble": {
    "PkImmeuble": 2108,
    "Immeuble": {
      "Nom": "Résidence Les Jardins",
      ...
    }
  },
  "depannages": [
    {
      "PkDepannage": 142990,
      "NumIntervention": "00142990",
      "TicketDate": "2025-05-20T19:22:34",
      "Statut": "Nouveau",
      "FkLogement": 1165420,
      "RefLogement": "001095P0901",
      "Nom": "M. Gethi",
      "Email": "test@techem.com",
      "TelFixe": "06.11.11.11.11",
      "MotifLibre": "Pouvez-vous faire vérifier le compteur...",
      "ObjetRetour": "Vérification compteur",
      "FkImmeuble": 2108,
      "Imm_Id": "070038"
    }
  ],
  "filters": {
    "statuts": ["Nouveau", "En cours", "Clos"],
    "logements": [...]
  }
}
```

---

### LogementApiController (`/api/logements`)

#### `api.logements.pkLogement.json` (GET `/api/logements/{pkLogement}`)

```json
{
  "logement": {
    "PkLogement": 1165420,
    "Logement": {
      "PkLogement": 1165420,
      "RefLogement": "001095P0901",
      "Numero": "0901",
      "Batiment": "B",
      "Escalier": "1",
      "Etage": "9",
      "TypeLogement": "Appartement"
    },
    "Occupant": {
      "PkOccupant": 12345,
      "Nom": "Dupont",
      "Email": "dupont@example.com",
      "TelMobile": "06.12.34.56.78"
    },
    "LogementEC": {
      "SerieConsos": {
        "ValeursXYL": "2024-01|1500;2024-02|1600"
      },
      "ListeInfosAppareils": {
        "infosAppareilEC": [
          {
            "Appareil": {
              "PkAppareil": 123456,
              "Numero": "123456",
              "Emplacement": "Salon"
            },
            "SerieConsos": {
              "ValeursXYL": "2024-01|750;2024-02|800"
            }
          }
        ]
      }
    },
    "LogementECValues": [
      ["2024-01", "1500"],
      ["2024-02", "1600"]
    ],
    "LogementEF": {...},
    "LogementRepart": {
      "ListeInfosAppareils": {
        "infosAppareilRepart": [
          {
            "Appareil": {
              "PkAppareil": 123456,
              "Numero": "123456",
              "Emplacement": "Salon"
            },
            "SerieConsosDJU": {
              "ValeursXYL": "2024-01|1200;2024-02|1300"
            }
          }
        ]
      }
    },
    "NbDepannages": 2,
    "NbDysfonctionnements": 0,
    "NbAnomalies": 1,
    "NbFuites": 0,
    "NbAppareils": 2
  },
  "ticketOwner": {
    "PkLogement": 1165420,
    "RefLogement": "001095P0901",
    "Nom": "Dupont",
    "Email": "dupont@example.com",
    "TelFixe": "01.23.45.67.89",
    "TelMobile": "06.12.34.56.78"
  },
  "nbTickets": 2,
  "consoTabs": {
    "EC": {
      "labels": ["Jan 2024", "Feb 2024"],
      "datasets": [...]
    },
    "EF": {...}
  },
  "changeinprogress": false,
  "occupant": {
    "PkOccupant": 12345,
    "Nom": "Dupont",
    "Email": "dupont@example.com",
    "TelMobile": "06.12.34.56.78"
  }
}
```

---

### OccupantApiController (`/api/occupant`)

#### `api.occupant.json` (GET `/api/occupant`)

```json
{
  "logement": {
    "PkLogement": 1165420,
    "Logement": {...},
    "Occupant": {...},
    "LogementEC": {...},
    "LogementECValues": [...],
    ...
  },
  "consoTabs": {
    "EC": {...},
    "EF": {...}
  },
  "soustraitants": [
    {
      "PkSousTraitant": 1,
      "Nom": "Sous-traitant 1",
      "Email": "st1@example.com"
    }
  ]
}
```

---

### OperatorApiController (`/api/operators`)

#### `api.operators.json` (GET `/api/operators`)

```json
{
  "users": [
    {
      "PKUser": 1043,
      "LoginID": "demo@techem.fr",
      "Email": "demo@techem.fr",
      "UserName": "Demo",
      "FirstName": "Client",
      "UserRole": "Gestionnaire",
      "PhoneNumber": "01.23.45.67.89",
      "UserType": "G"
    }
  ]
}
```

#### `api.operators.id.json` (GET `/api/operators/{id}`)

```json
{
  "user": {
    "PKUser": 1043,
    "LoginID": "demo@techem.fr",
    "Email": "demo@techem.fr",
    "UserName": "Demo",
    "FirstName": "Client",
    "UserRole": "Gestionnaire",
    "PhoneNumber": "01.23.45.67.89",
    "UserType": "G"
  },
  "immeubles": [
    {
      "PkImmeuble": 2108,
      "Immeuble": {
        "Nom": "Résidence Les Jardins",
        ...
      }
    }
  ],
  "diffImmeubles": []
}
```

---

### TicketingApiController (`/api/tickets`)

#### `api.tickets.json` (GET `/api/tickets`)

```json
{
  "board": {
    "NbTickets": 5,
    "NbTicketsNouveaux": 2,
    "NbTicketsEnCours": 2,
    "NbTicketsClos": 1
  },
  "tickets": [
    {
      "Nom": "M. Gethi",
      "Email": "test@techem.com",
      "TelFixe": "06.11.11.11.11",
      "TicketDate": "2025-05-20T19:22:34",
      "MotifLibre": "Pouvez-vous faire vérifier le compteur...",
      "Statut": "Nouveau",
      "ObjetRetour": "Vérification compteur",
      "FkLogement": 1165420,
      "RefLogement": "001095P0901",
      "NumIntervention": "00142990",
      "FkImmeuble": 2108,
      "Imm_Id": "070038",
      "CaseNumber": "00105598",
      "CaseId": "5003X00002CuohYQAR",
      "LastUpdateDate": "2025-05-21T14:23:51"
    }
  ],
  "count": 1
}
```

#### `api.tickets.create.pkLogement.json` (GET `/api/tickets/create/{pkLogement}`)

```json
{
  "ticketOwner": {
    "PkLogement": 1165420,
    "RefLogement": "001095P0901",
    "Nom": "Dupont",
    "Email": "dupont@example.com",
    "TelFixe": "01.23.45.67.89",
    "TelMobile": "06.12.34.56.78"
  },
  "formData": {
    "pkLogement": 1165420,
    "name": "Dupont",
    "email": "dupont@example.com",
    "phone": "01.23.45.67.89",
    "mobile": "06.12.34.56.78"
  }
}
```

---

### FrontApiController (`/api`)

#### `api.dashboard.json` (GET `/api/dashboard`)

```json
{
  "board": {
    "NbCompteursPoses": 100,
    "NbCompteursCommandes": 120,
    "NbCompteursReleves": 95,
    "NbCompteursARelever": 25,
    "NbImmeubles": 15,
    "NbImmeublesTransfertFichiers": 12,
    "PcImmeublesTelereleve": "79",
    "PcImmeublesTransfertFichiers": "80"
  }
}
```

---

## 🔑 Points Clés à Retenir

### 1. **Format des Fichiers JSON**

Les fichiers JSON doivent contenir **uniquement les données** qui seront dans la clé `data` de la réponse finale. Le wrapper `success/status/data` est ajouté automatiquement par `sendFakeData()`.

### 2. **Structure des Objets SOAP**

Les objets SOAP retournés par le service `Client` ont des propriétés en **PascalCase** (ex: `PKUser`, `NbCompteursPoses`, `PcImmeublesTelereleve`). Ces propriétés sont préservées lors de la normalisation.

### 3. **Objets Imbriqués**

Les structures SOAP sont souvent profondément imbriquées :

- `$board->ListeInfosImmeubles->infosImmeuble[0]->Immeuble->Nom`
- `$immeuble->ImmeubleEC->Chantier->NbCompteursPoses`
- `$logement->LogementEC->ListeInfosAppareils->infosAppareilEC[0]->Appareil->Numero`

### 4. **Données Calculées/Transformées**

Certains endpoints ajoutent des données calculées ou transformées :

- **TableauBordClientApiController** : Ajoute `chantier` avec des calculs de pourcentages
- **ImmeubleApiController** : Ajoute `evolution_charts`, `comparative_chart`, `tabs_top_consos`, `tabs_evo_consos`, `chantier`
- **LogementApiController** : Ajoute `consoTabs`, `changeinprogress`
- **FactureApiController** : Ajoute des champs formatés (`dateEditionFormatted`, `montantTotalHTFormatted`)

### 5. **Services de Transformation**

Certains contrôleurs utilisent des services pour transformer les données :

- `ImmeubleService::generateTabTopConsos()`
- `ImmeubleService::generateTabEvoConsos()`
- `ImmeubleService::generateEvolutionChartsDataByTab()`
- `ImmeubleService::generateComparativeChartData()`
- `LogementService::generateTabConsos()`
- `DepannageService::extractFiltersValues()`
- `FuiteService::extractFiltersValues()`
- `AnomalieService::extractFiltersValues()`
- `DysfonctionnementService::extractFiltersValues()`

**⚠️ Problème** : Ces services ne sont pas disponibles pour générer les données fake. Il faudra soit :

- Créer des données simplifiées sans ces transformations
- Ou créer des données qui imitent le résultat de ces transformations

### 6. **Séries de Consommation**

Les séries de consommation sont stockées dans des chaînes de caractères au format `"2024-01|1500;2024-02|1600"` et sont parsées en tableaux 2D :

```json
"SerieConsosECValues": [
  ["2024-01", "1500"],
  ["2024-02", "1600"]
]
```

### 7. **Listes et Tableaux**

Les listes SOAP peuvent être :

- Un **objet unique** si un seul élément
- Un **tableau** si plusieurs éléments

Le code gère cela avec :

```php
if (!is_array($result->ListeInfosImmeubles->infosImmeuble)) {
    $result->ListeInfosImmeubles->infosImmeuble = [$result->ListeInfosImmeubles->infosImmeuble];
}
```

Pour les fichiers fake, il est plus simple de toujours utiliser des **tableaux**, même pour un seul élément.

---

## 🎯 Stratégie Recommandée pour Créer les Fichiers JSON

### Option 1 : Données Simplifiées (Recommandée pour démarrer)

Créer des structures de données **simplifiées** qui contiennent les champs essentiels pour que les composants React fonctionnent, sans toutes les transformations complexes.

**Avantages** :

- ✅ Rapide à créer
- ✅ Permet de développer les composants frontend
- ✅ Structure claire et lisible

**Inconvénients** :

- ⚠️ Ne reflète pas exactement la structure réelle
- ⚠️ Certaines fonctionnalités avancées ne fonctionneront pas

### Option 2 : Données Complètes (Recommandée pour la production)

Créer des structures de données **complètes** qui imitent exactement les réponses SOAP, y compris toutes les transformations.

**Avantages** :

- ✅ Reflète exactement la structure réelle
- ✅ Toutes les fonctionnalités fonctionnent

**Inconvénients** :

- ⚠️ Très long à créer
- ⚠️ Nécessite de comprendre toutes les transformations
- ⚠️ Difficile à maintenir

### Option 3 : Données Hybrides (Recommandée pour l'itération)

Créer des structures de données **progressives** :

1. **Phase 1** : Données minimales pour faire fonctionner les composants de base
2. **Phase 2** : Ajouter les données manquantes au fur et à mesure des besoins
3. **Phase 3** : Compléter avec toutes les données pour les tests finaux

---

## 📝 Exemple de Fichier JSON Simplifié

### `api.parc.json` (Version Simplifiée)

```json
{
  "board": {
    "NbCompteursPoses": 100,
    "NbCompteursCommandes": 120,
    "NbCompteursReleves": 95,
    "NbCompteursARelever": 25,
    "NbImmeubles": 15,
    "NbImmeublesTransfertFichiers": 12,
    "PcImmeublesTelereleve": "79",
    "PcImmeublesTransfertFichiers": "80",
    "ListeInfosImmeubles": {
      "infosImmeuble": [
        {
          "PkImmeuble": 2108,
          "Immeuble": {
            "PkImmeuble": 2108,
            "Nom": "Résidence Les Jardins",
            "Adresse1": "123 Rue de la Paix",
            "Cp": "75001",
            "Ville": "Paris",
            "NbLogements": 45
          },
          "NbAnomalies": 2,
          "NbDepannages": 5,
          "NbDysfonctionnements": 1,
          "NbFuites": 0,
          "NbCompteurs": 90
        },
        {
          "PkImmeuble": 2109,
          "Immeuble": {
            "PkImmeuble": 2109,
            "Nom": "Résidence Le Parc",
            "Adresse1": "456 Avenue des Champs",
            "Cp": "75008",
            "Ville": "Paris",
            "NbLogements": 30
          },
          "NbAnomalies": 0,
          "NbDepannages": 1,
          "NbDysfonctionnements": 0,
          "NbFuites": 1,
          "NbCompteurs": 60
        }
      ]
    }
  },
  "chantier": {
    "installed": 100,
    "installed_percent": 83,
    "remaining": 20,
    "remaining_percent": 17,
    "total": 120,
    "date": null
  }
}
```

---

## 🚨 Défis Identifiés

### 1. **Absence de Documentation sur les Structures SOAP**

Il n'y a pas de documentation claire sur la structure exacte des objets SOAP retournés. Il faudra :

- Analyser le code des contrôleurs pour comprendre quelles propriétés sont utilisées
- Regarder les templates Twig pour voir comment les données sont affichées
- Tester avec des données réelles si possible

### 2. **Transformations Complexes**

Certaines données sont transformées par des services PHP qui ne sont pas disponibles pour les fichiers fake :

- Graphiques de consommation (`evolution_charts`, `comparative_chart`)
- Tableaux de consommation (`tabs_top_consos`, `tabs_evo_consos`)
- Filtres extraits (`filters`)

**Solution** : Créer des données qui imitent le résultat de ces transformations, ou créer des données simplifiées.

### 3. **Données Conditionnelles**

Certaines données sont ajoutées conditionnellement :

- `demo` / `preview` si des fichiers existent
- `GPS` pour les coordonnées
- `changeinprogress` pour les occupants

**Solution** : Inclure ces données dans les fichiers fake avec des valeurs par défaut.

### 4. **Formats de Dates**

Les dates peuvent être dans différents formats :

- ISO 8601 : `"2025-05-20T19:22:34"`
- Format français : `"15/01/2024"`
- Format SQL : `"2024-01-15"`

**Solution** : Utiliser le format qui correspond à ce qui est attendu par le frontend.

---

## 💡 Recommandations

### Pour Démarrer Rapidement

1. **Créer des fichiers JSON simplifiés** avec les champs essentiels
2. **Tester avec les composants React** pour identifier les champs manquants
3. **Itérer** en ajoutant les données manquantes au fur et à mesure

### Pour une Solution Complète

1. **Analyser les templates Twig** pour comprendre quelles données sont affichées
2. **Créer des structures complètes** qui imitent les réponses SOAP
3. **Tester avec les composants React** pour valider la structure
4. **Documenter** les structures pour faciliter la maintenance

### Outils Utiles

- **Inspecter les réponses API réelles** (si possible avec SOAP disponible)
- **Analyser les templates Twig** pour voir quelles propriétés sont utilisées
- **Utiliser les types TypeScript** du frontend pour comprendre la structure attendue
- **Créer un script de génération** pour créer des données de test cohérentes

---

## 📊 Prochaines Étapes

1. ✅ **Analyser la structure** (fait)
2. ⏳ **Créer des fichiers JSON simplifiés** pour les endpoints prioritaires
3. ⏳ **Tester avec les composants React**
4. ⏳ **Itérer** en ajoutant les données manquantes
5. ⏳ **Documenter** les structures finales

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Analyse complète - Prêt pour création des fichiers JSON
