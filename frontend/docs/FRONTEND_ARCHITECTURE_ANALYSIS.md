# Analyse de l'Architecture Frontend - Techem Portail Client

## 📋 Vue d'ensemble

Ce document analyse l'architecture des templates Twig existants pour servir de référence lors de la création d'un nouveau frontend qui consommera l'API REST.

---

## 🏗️ Structure hiérarchique des templates

### Hiérarchie d'héritage

```
base-global.html.twig (racine HTML)
    ├── base.html.twig (layout gestionnaire)
    │   ├── Immeuble/*.twig
    │   ├── Logement/*.twig
    │   ├── TableauBordClient/*.twig
    │   ├── Operator/*.twig
    │   ├── Ticketing/*.twig
    │   └── Facture/*.twig
    │
    └── base_occupant.html.twig (layout occupant)
        └── Occupant/*.twig
```

### Templates de base

#### 1. `base-global.html.twig`
- **Rôle** : Template racine HTML
- **Contenu** :
  - Structure HTML de base (`<html>`, `<head>`, `<body>`)
  - Meta tags
  - Blocs pour stylesheets et javascripts
  - Loader global

#### 2. `base.html.twig`
- **Rôle** : Layout principal pour gestionnaires
- **Extends** : `base-global.html.twig`
- **Fonctionnalités** :
  - Header avec logo, recherche, menu utilisateur
  - Sidebar avec navigation principale
  - Footer
  - Modal de recherche avancée
  - Support multilingue (FR/EN)
- **Blocs principaux** :
  - `body__main_menu` : Menu de navigation latéral
  - `main_content` : Contenu principal
  - `breadcrumb_mobile` : Fil d'Ariane mobile
  - `modal` : Modales

#### 3. `base_occupant.html.twig`
- **Rôle** : Layout simplifié pour occupants
- **Extends** : `base-global.html.twig`
- **Différences avec `base.html.twig`** :
  - Header simplifié (pas de recherche avancée)
  - Menu latéral réduit
  - Titre : "Bienvenue dans votre espace occupant"

---

## 🧩 Composants réutilisables (Partials)

### Convention de nommage
Les templates commençant par `_` sont des **partials** (composants réutilisables).

### Partials globaux

#### `_list_interventions.html.twig`
- **Usage** : Liste de dépannages/interventions
- **Fonctionnalités** :
  - Filtres (numéro, nom, date, motif, statut, bâtiment, escalier, étage)
  - Affichage liste avec compteur
  - Filtrage JavaScript côté client
- **Données attendues** :
  - `depannages` : Array d'interventions
  - `filters` : Objet avec valeurs de filtres
  - `modeoccupant` : Boolean (optionnel)

#### `_list_anomalies.html.twig`
- **Usage** : Liste d'anomalies de consommation
- **Structure similaire** à `_list_interventions.html.twig`

#### `_list_leaks.html.twig`
- **Usage** : Liste de fuites
- **Structure similaire** aux autres listes

#### `_list_dysfunctions.html.twig`
- **Usage** : Liste de dysfonctionnements/alarmes techniques
- **Structure similaire** aux autres listes

#### `_show_intervention.html.twig`
- **Usage** : Détail d'une intervention
- **Données** :
  - `depannage` : Objet intervention
  - `immeuble` ou `logement` : Contexte

#### `_anomaly.html.twig`, `_leak.html.twig`, `_dysfunction.html.twig`
- **Usage** : Items individuels dans les listes

#### `_status_gauge_panel.html.twig`, `_alarm_gauge_panel.html.twig`
- **Usage** : Panneaux de jauge/indicateur visuel

### Partials spécifiques Immeuble

#### `Immeuble/_menu.html.twig`
- **Menu latéral** pour la navigation d'un immeuble
- **Items** :
  - Le parc (retour)
  - Immeuble (détail)
  - Fuites (avec badge compteur)
  - Alarmes techniques (avec badge)
  - Anomalies (avec badge)
  - Dépannages (avec badge)
  - Tickets (rendu via controller)

#### `Immeuble/_list_immeubles.html.twig`
- **Liste d'immeubles** avec filtres
- **Fonctionnalités** :
  - Filtres par énergie, fuites, anomalies, dysfonctionnements, dépannages, chantiers
  - Recherche par référence/numéro, code postal/ville
  - Affichage liste/grid (grand/petit)
  - Métadonnées : compteurs, alertes visuelles
- **Données** :
  - `immeubles` : Array d'objets immeuble
  - `gestion` : Boolean (mode gestion parc)

#### `Immeuble/_panel_*.html.twig`
- **Panneaux de consommation** par type d'énergie :
  - `_panel_eau.html.twig` : Eau (froide/chaude)
  - `_panel_repart.html.twig` : Répartiteurs
  - `_panel_cet.html.twig` : Compteur d'énergie thermique
  - `_panel_elect.html.twig` : Électricité
  - `_panel_gaz.html.twig` : Gaz
  - `_panel_temp.html.twig` : Température

#### `Immeuble/_conso_tab.html.twig`, `Immeuble/_conso_table.html.twig`
- **Onglets et tableaux** de consommation

#### `Immeuble/_chantier_panel.html.twig`
- **Panneau de chantier** (progression installation compteurs)

### Partials spécifiques Logement

#### `Logement/_menu.html.twig`
- **Menu latéral** pour un logement
- Similaire à `Immeuble/_menu.html.twig` mais adapté au logement

#### `Logement/_list_logements.html.twig`
- **Liste de logements** avec filtres
- Structure similaire à `_list_immeubles.html.twig`

#### `Logement/_infos_appareils*.html.twig`
- **Informations sur les appareils** :
  - `_infos_appareils.html.twig` : Général
  - `_infos_appareils_eau.html.twig` : Eau
  - `_infos_appareils_chauffage.html.twig` : Chauffage

### Partials spécifiques Occupant

#### `Occupant/_menu.html.twig`
- **Menu simplifié** pour occupant
- Items :
  - Logement
  - Simulateur de consommation
  - (Items commentés : Mon compte, Mes consommations, Mes alertes, etc.)

---

## 📱 Pages principales

### Tableau de bord client (`TableauBordClient/index.html.twig`)

**Structure** :
```
- Panneau principal (col-md-8)
  - Bouton "Immeubles" (compteur)
  - Bouton "Gestion parc" (si autorisé)
  - Statistiques appareils (Eau, Répartiteurs, CET, Électricité, Gaz)
  - Jauge "Transfert électronique de fichiers"
- Panneau dépannages (col-md-4)
  - Jauge dépannages en cours
  - Bouton "Livret d'intervention"
- Panneau alertes client (col-md-8)
  - Fuites (compteur)
  - Anomalies (compteur)
- Panneau alarmes techniques (col-md-4)
  - Jauge alarmes techniques
- Panneau chantiers (col-xs-12)
  - Progression installation compteurs
  - Jauge "Vos relevés"
```

**Données** :
- `board` : Objet tableau de bord avec :
  - `NbImmeubles`, `NbCompteurs`
  - `NbCompteursEF`, `NbCompteursEC`, `NbCompteursRepart`, etc.
  - `NbDepannages`, `NbFuites`, `NbAnomalies`, `NbDysfonctionnements`
  - `PcImmeublesTransfertFichiers`, `PcImmeublesTelereleve`
  - `NbChantiers`, `NbCompteursCommandes`, `NbCompteursPoses`

### Liste d'immeubles (`Immeuble/index.html.twig`)

**Structure** :
- Breadcrumb
- Rendu du partial `_list_immeubles.html.twig` via controller

**Données** :
- `board` : Tableau de bord
- `filters` : Filtres actifs
- `gestion` : Boolean (mode gestion)

### Détail immeuble (`Immeuble/show.html.twig`)

**Structure** :
- Breadcrumb
- Menu latéral (`_menu.html.twig`)
- Panneaux de consommation par énergie
- Graphiques d'évolution
- Panneau chantier
- (Optionnel) GPS si mode preview/demo

**Données** :
- `immeuble` : Objet immeuble complet
- `evolution_charts_js` : Données pour graphiques
- `comparative_chart_js` : Données graphique comparatif
- `tabs_top_consos`, `tabs_evo_consos` : Données onglets
- `chantier` : Données chantier

### Liste de logements (`Logement/index.html.twig`)

**Structure** :
- Breadcrumb
- Formulaire d'intervention (modal)
- Rendu du partial `_list_logements.html.twig`

**Données** :
- `immeuble` : Objet immeuble
- `interventionForm` : Formulaire Symfony
- `gestion` : Boolean

### Détail logement (`Logement/show.html.twig`)

**Structure** :
- Menu latéral
- Onglets de consommation
- Panneaux par type d'énergie
- Formulaire d'intervention
- Compteur de tickets

**Données** :
- `logement` : Objet logement complet
- `consoTabs` : Données onglets consommation
- `interventionForm` : Formulaire
- `nbTickets` : Nombre de tickets
- `changeinprogress` : Boolean (changement occupant en cours)

### Espace occupant (`Occupant/show.html.twig`)

**Structure** :
- Menu simplifié
- Panneaux de consommation
- Onglets consommation
- Similaire à `Logement/show.html.twig` mais adapté occupant

**Données** :
- `logement` : Objet logement
- `consoTabs` : Données onglets
- `modeoccupant` : true

### Gestion des tickets (`Ticketing/list-tickets.html.twig`)

**Structure** :
- Table DataTables avec colonnes :
  - Voir (bouton détails)
  - N° Demande
  - Date demande
  - Demandeur
  - Objet
  - Immeuble
  - Nom occupant
  - Ref Logement
  - Statut
  - Dernière modification
  - Dépannage (lien)
  - Clôture (bouton si statut "Clos")
- Modales :
  - Détails ticket
  - Clôture ticket

**Données** :
- `tickets` : Array de tickets
- `showAll` : Boolean

---

## 🎨 Système de design

### Framework CSS
- **Bootstrap 3** (via `bootstrap.css`)
- **Neon Theme** (thème custom)
- **Font Awesome 4.2.0** (icônes)
- **Entypo** (icônes custom)
- **Fontello** (icônes custom Techem)

### Bibliothèques JavaScript

#### Core
- **jQuery 1.11.0**
- **jQuery UI 1.10.3**
- **Bootstrap JS**
- **GSAP** (animations)

#### Spécialisées
- **DevExtreme 23.1.5** (graphiques, widgets)
- **DataTables** (tableaux tickets)
- **Bootstrap Datepicker** (sélection dates)

#### Custom
- `neon-api.js`, `neon-custom.js` : Fonctions custom Neon
- `custom.js` : Scripts custom
- `status-gauge.js`, `performance-gauge.js` : Jauges visuelles

### Composants visuels

#### Jauges (Gauges)
- **Status Gauge** : Jauge circulaire pour statuts (dépannages, alarmes)
- **Performance Gauge** : Jauge pour pourcentages (transfert fichiers, relevés)
- Utilisation Canvas HTML5

#### Badges
- Compteurs dans les menus (fuites, anomalies, etc.)
- Classes : `badge`, `badge-grey`

#### Panneaux (Panels)
- Classes : `panel`, `panel-primary`, `panel-default`
- Structure : `.panel > .block-title + contenu`

#### Filtres
- Structure : `.filters > form > .form-group`
- Types :
  - Inputs texte
  - Selects
  - Checkboxes
  - Dropdowns (boutons)

---

## 🔐 Gestion des rôles et permissions

### Rôles Symfony
- `ROLE_USER` : Base
- `ROLE_OCCUPANT` : Occupant
- `ROLE_GESTIONNAIRE` : Gestionnaire
- `ROLE_ADMIN` : Administrateur
- `ROLE_MAISONMERE`, `ROLE_AGENCE`, `ROLE_SYNDICAT` : Rôles hiérarchiques

### Vérifications dans les templates

```twig
{% if is_granted('ROLE_OCCUPANT') %}
    {# Contenu occupant #}
{% endif %}

{% if is_granted('ROLE_GESTIONNAIRE') %}
    {# Contenu gestionnaire #}
{% endif %}

{% if app.token.attribute('soap.user').showChgtOccupant == 1 %}
    {# Fonctionnalité conditionnelle #}
{% endif %}
```

### Attributs utilisateur (soap.user)
- `PKUser` : ID utilisateur
- `UserName`, `FirstName` : Nom/prénom
- `UserType` : Type (O, M, A, S, C, G)
- `showChgtOccupant` : Permission changement occupant
- `showFactures` : Permission factures
- `CGU` : Acceptation CGU

---

## 🌐 Internationalisation (i18n)

### Langues supportées
- **Français (fr)** : Par défaut
- **Anglais (en)** : Disponible

### Utilisation dans les templates

```twig
{{ "Texte à traduire"|trans }}
{{ 'Clé de traduction'|trans }}
```

### Sélecteur de langue
- Dropdown dans le header
- Routes : `TechemCoreBundle_Translation_set_locale`

---

## 📊 Patterns de données

### Structure Immeuble

```javascript
{
  Immeuble: {
    PkImmeuble: "123",
    Ref: "REF001",
    Numero: "070038",
    Adresse1: "...",
    Adresse2: "...",
    Adresse3: "...",
    Cp: "75001",
    Ville: "Paris"
  },
  ImmeubleEC: {
    NbCompteursEC: 10,
    NbFuites: 2,
    NbAnomalies: 1
  },
  ImmeubleEF: {
    NbCompteursEF: 15,
    NbFuites: 1,
    NbAnomalies: 0
  },
  NbDepannages: 3,
  NbDepannagesTotal: 5,
  NbDysfonctionnements: 2,
  NbChantiers: 1,
  NbCompteursRepart: 20,
  NbCompteursCET: 5,
  NbCompteursElect: 0,
  NbCompteursGaz: 0
}
```

### Structure Logement

```javascript
{
  Logement: {
    PkLogement: "456",
    NumBatiment: "A",
    NumEscalier: "1",
    NumEtage: "2",
    NumOrdre: "01"
  },
  Occupant: {
    PkOccupant: "789",
    Ref: "OCC001",
    Nom: "Dupont"
  },
  Immeuble: {
    PkImmeuble: "123",
    // ...
  },
  LogementRepart: {
    ListeInfosAppareils: {
      infosAppareilRepart: [...]
    },
    SerieConsosDJU: {...}
  },
  LogementEC: {...},
  LogementEF: {...},
  NbDepannages: 1,
  NbDysfonctionnements: 0,
  // ...
}
```

### Structure Intervention/Dépannage

```javascript
{
  PkDepannage: "123",
  Numero: "00142990",
  Date: "2025-01-15",
  MotifAbrege: "Panne",
  MotifLibre: "Description...",
  Observation: "...",
  Statut: "Ouvert",
  // ...
}
```

### Structure Ticket

```javascript
{
  CaseId: "5003X00002CuohYQAR",
  CaseNumber: "00105598",
  TicketDate: "2025-05-20T19:22:34",
  Nom: "M. Gethi",
  Email: "test@techem.com",
  TelFixe: "06.11.11.11.11",
  MotifLibre: "Description...",
  ObjetRetour: "Objet",
  Statut: "Nouveau",
  FkLogement: "1165420",
  RefLogement: "001095P0901",
  FkImmeuble: "2108",
  Imm_Id: "070038",
  NumIntervention: "00142990",
  WebUser_Nom: "Demo",
  WebUser_Prenom: "Client",
  LastUpdateDate: "2025-05-21T14:23:51"
}
```

---

## 🔄 Patterns de navigation

### Routes principales

#### Gestionnaire
- `/parc` : Tableau de bord
- `/immeuble` : Liste immeubles
- `/immeuble/{pkImmeuble}` : Détail immeuble
- `/immeuble/{pkImmeuble}/logements` : Liste logements
- `/logement/{pkLogement}` : Détail logement
- `/gestionParc` : Gestion parc
- `/tickets` : Liste tickets
- `/gestionnaire` : Gestion opérateurs

#### Occupant
- `/occupant` : Espace occupant
- `/occupant/simulateur` : Simulateur
- `/occupant/myAccount` : Mon compte
- `/occupant/alertes` : Alertes

### Breadcrumbs
- Affichage hiérarchique : `Le parc > Liste des immeubles > Immeuble XXX`
- Mobile : Dropdown avec navigation

### Menu latéral
- Structure : `<ul id="main-menu">` avec items `<li>`
- Classes : `active`, `active2` pour état actif
- Badges : Compteurs dans les items

---

## 📝 Patterns de formulaires

### Formulaire d'intervention

**Champs** :
- `pkLogement` : ID logement
- `name` : Nom occupant
- `email` : Email
- `phone` : Téléphone fixe
- `mobile` : Téléphone mobile
- `message` : Message/description
- `attachment` : Pièce jointe (image)

**Soumission** :
- AJAX (XMLHttpRequest)
- Endpoint : `/logement/{pkLogement}/createticket`
- Réponse JSON

### Formulaire de recherche

**Types** :
1. **Recherche simple** : Champ texte "tout"
2. **Recherche avancée** :
   - Type : Immeuble / Occupant
   - Référence / Numéro
   - Nom
   - Adresse / CP / Ville

**Soumission** :
- GET vers `/recherche`
- Paramètres query string

### Filtres

**Pattern** :
- Filtres côté client (JavaScript)
- Événement `data-change` sur `.filters`
- Filtrage DOM avec classes `hidden`

**Types de filtres** :
- Checkboxes (booléens)
- Selects (énergies)
- Inputs texte (recherche)
- Dropdowns (bâtiment, escalier, étage)

---

## 🎯 Patterns JavaScript

### Filtrage côté client

```javascript
$('.filters').on('data-change', function () {
    $('.loader').trigger('start');
    var $items = $('.content li'),
        $filtered_items = $items;
    
    // Application des filtres
    // ...
    
    $items.addClass('hidden');
    $filtered_items.toggleClass('hidden');
    $('.loader').trigger('stop');
});
```

### Loader global

```javascript
$('.loader').trigger('start'); // Afficher
$('.loader').trigger('stop');  // Cacher
```

### Modales Bootstrap

```javascript
$('#myModal').modal('show');
$('#myModal').modal('hide');
```

### DataTables (Tickets)

```javascript
$('#tableTickets').DataTable({
    // Configuration
});
```

---

## 📦 Structure des assets

### CSS
```
bundles/techemcore/css/
  - bootstrap.css
  - neon-core.css
  - neon-theme.css
  - neon-forms.css
  - custom.css
  - main.css
```

### JavaScript
```
bundles/techemcore/js/
  - jquery-1.11.0.min.js
  - bootstrap.min.js
  - custom.js
  - neon-custom.js
  - custom/
    - status-gauge.js
    - performance-gauge.js
```

### Images
```
bundles/techemcore/images/
  - fidesio/ (logo, icônes)
```

---

## 🔗 Mapping API ↔️ Templates

### Endpoints API correspondants

| Template | Endpoint API |
|----------|-------------|
| `TableauBordClient/index.html.twig` | `GET /api/dashboard` |
| `Immeuble/index.html.twig` | `GET /api/immeubles` |
| `Immeuble/show.html.twig` | `GET /api/immeubles/{pkImmeuble}` |
| `Immeuble/listInterventions.html.twig` | `GET /api/immeubles/{pkImmeuble}/interventions` |
| `Immeuble/listLeaks.html.twig` | `GET /api/immeubles/{pkImmeuble}/fuites` |
| `Immeuble/listAnomalies.html.twig` | `GET /api/immeubles/{pkImmeuble}/anomalies` |
| `Immeuble/listDysfunctions.html.twig` | `GET /api/immeubles/{pkImmeuble}/dysfonctionnements` |
| `Logement/index.html.twig` | `GET /api/logements/immeuble/{pkImmeuble}` |
| `Logement/show.html.twig` | `GET /api/logements/{pkLogement}` |
| `Occupant/show.html.twig` | `GET /api/occupant` |
| `Ticketing/list-tickets.html.twig` | `GET /api/tickets` |
| `Operator/index.html.twig` | `GET /api/operators` |

### Exports

| Template | Endpoint API |
|----------|-------------|
| Export anomalies | `GET /api/immeubles/{pkImmeuble}/anomalies/export` |
| Export fuites | `GET /api/immeubles/{pkImmeuble}/fuites/export` |
| Export interventions | `GET /api/immeubles/{pkImmeuble}/interventions/export` |
| Export dysfonctionnements | `GET /api/immeubles/{pkImmeuble}/dysfonctionnements/export` |

---

## 🎨 Recommandations pour le nouveau frontend

### Architecture recommandée

#### Framework
- **React** ou **Vue.js** pour composants réutilisables
- **TypeScript** pour type safety
- **React Router** ou **Vue Router** pour navigation

#### State Management
- **Redux** (React) ou **Vuex** (Vue) pour état global
- **React Query** ou **Vue Query** pour cache API

#### UI Framework
- **Material-UI** (React) ou **Vuetify** (Vue)
- Ou **Tailwind CSS** pour design custom

#### Composants à créer

1. **Layout Components**
   - `AppLayout` : Layout principal (header, sidebar, footer)
   - `OccupantLayout` : Layout simplifié occupant
   - `Header` : Header avec logo, recherche, menu utilisateur
   - `Sidebar` : Menu latéral avec navigation
   - `Footer` : Footer

2. **Dashboard Components**
   - `Dashboard` : Tableau de bord principal
   - `StatCard` : Carte statistique
   - `GaugeChart` : Jauge circulaire
   - `ProgressBar` : Barre de progression

3. **List Components**
   - `BuildingList` : Liste immeubles
   - `HousingList` : Liste logements
   - `InterventionList` : Liste interventions
   - `TicketList` : Liste tickets
   - `FilterBar` : Barre de filtres
   - `SearchBar` : Barre de recherche

4. **Detail Components**
   - `BuildingDetail` : Détail immeuble
   - `HousingDetail` : Détail logement
   - `InterventionDetail` : Détail intervention
   - `TicketDetail` : Détail ticket

5. **Form Components**
   - `InterventionForm` : Formulaire intervention
   - `SearchForm` : Formulaire recherche
   - `FilterForm` : Formulaire filtres

6. **Chart Components**
   - `ConsumptionChart` : Graphique consommation
   - `EvolutionChart` : Graphique évolution
   - `ComparativeChart` : Graphique comparatif

7. **Common Components**
   - `Badge` : Badge compteur
   - `Modal` : Modale
   - `Breadcrumb` : Fil d'Ariane
   - `Loader` : Indicateur de chargement
   - `Alert` : Alerte/notification

### Structure de dossiers recommandée

```
src/
  components/
    layout/
      AppLayout.tsx
      Header.tsx
      Sidebar.tsx
      Footer.tsx
    dashboard/
      Dashboard.tsx
      StatCard.tsx
      GaugeChart.tsx
    building/
      BuildingList.tsx
      BuildingDetail.tsx
      BuildingCard.tsx
    housing/
      HousingList.tsx
      HousingDetail.tsx
      HousingCard.tsx
    intervention/
      InterventionList.tsx
      InterventionDetail.tsx
      InterventionCard.tsx
    ticket/
      TicketList.tsx
      TicketDetail.tsx
      TicketForm.tsx
    common/
      Badge.tsx
      Modal.tsx
      Breadcrumb.tsx
      Loader.tsx
      FilterBar.tsx
  pages/
    DashboardPage.tsx
    BuildingListPage.tsx
    BuildingDetailPage.tsx
    HousingListPage.tsx
    HousingDetailPage.tsx
    OccupantPage.tsx
    TicketsPage.tsx
  services/
    api.ts
    auth.ts
    building.ts
    housing.ts
    intervention.ts
    ticket.ts
  hooks/
    useAuth.ts
    useApi.ts
    useBuilding.ts
    useHousing.ts
  types/
    building.ts
    housing.ts
    intervention.ts
    ticket.ts
    user.ts
  utils/
    formatters.ts
    validators.ts
```

### Gestion d'état recommandée

```typescript
// Exemple avec React Query
import { useQuery } from 'react-query';

function BuildingList() {
  const { data, isLoading, error } = useQuery(
    'buildings',
    () => api.get('/api/immeubles')
  );

  if (isLoading) return <Loader />;
  if (error) return <Error message={error.message} />;

  return <BuildingListComponent buildings={data.data} />;
}
```

### Authentification

```typescript
// services/auth.ts
export const auth = {
  login: async (username: string, password: string) => {
    const response = await api.post('/api/security/login', {
      username,
      password
    });
    return response.data;
  },
  
  logout: async () => {
    await api.post('/api/security/logout');
  },
  
  check: async () => {
    const response = await api.get('/api/security/check');
    return response.data;
  }
};
```

---

## 📚 Ressources supplémentaires

- [Documentation API](./API_DOCUMENTATION.md)
- [Guide d'authentification](./API_AUTHENTICATION_GUIDE.md)
- [Stratégie de migration API](./API_MIGRATION_STRATEGY.md)

---

## ✅ Checklist de migration

### Phase 1 : Setup
- [ ] Choisir framework (React/Vue)
- [ ] Configurer build tool (Vite/Webpack)
- [ ] Configurer routing
- [ ] Configurer state management
- [ ] Configurer API client avec authentification

### Phase 2 : Layout
- [ ] Créer `AppLayout`
- [ ] Créer `Header` avec recherche
- [ ] Créer `Sidebar` avec navigation
- [ ] Créer `Footer`
- [ ] Implémenter breadcrumbs
- [ ] Implémenter modales

### Phase 3 : Pages principales
- [ ] Dashboard
- [ ] Liste immeubles
- [ ] Détail immeuble
- [ ] Liste logements
- [ ] Détail logement
- [ ] Espace occupant

### Phase 4 : Fonctionnalités
- [ ] Filtres et recherche
- [ ] Formulaires (intervention, etc.)
- [ ] Graphiques et jauges
- [ ] Exports (PDF, Excel)
- [ ] Gestion tickets

### Phase 5 : Optimisations
- [ ] Lazy loading
- [ ] Cache API
- [ ] Optimisation images
- [ ] Tests unitaires
- [ ] Tests E2E

---

**Document créé le** : 2025-01-XX  
**Version** : 1.0

