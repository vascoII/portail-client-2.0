# 📋 Stratégie de Migration des Pages et Composants - Twig vers React

## 📊 Vue d'ensemble

Ce document présente une stratégie complète pour migrer tous les templates Twig vers React/Next.js, en distinguant :
- **Composants** : Fichiers dont le nom commence par `_` (ex: `_list_logements.html.twig`)
- **Pages** : Fichiers dont le nom ne commence pas par `_` (ex: `index.html.twig`, `show.html.twig`)

### Statistiques

- **144 fichiers Twig** identifiés au total
- **~70 composants potentiels** (fichiers commençant par `_`)
- **~74 pages potentielles** (fichiers ne commençant pas par `_`)
- **Technologies cibles** : Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Hooks API disponibles** : Tous les hooks nécessaires sont déjà créés ✅

### Pattern de Migration

- **Composants** → `frontend/src/components/`
- **Pages** → `frontend/src/app/` (Next.js App Router)
- **Layouts** → `frontend/src/app/layout.tsx` ou layouts spécifiques

---

## 📦 Inventaire des Composants (Fichiers commençant par `_`)

### 🎨 Composants Partagés (Racine `templates/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 1 | AlarmGaugePanel | `_alarm_gauge_panel.html.twig` | Panneau de jauge d'alarme | 🟡 |
| 2 | Anomaly | `_anomaly.html.twig` | Carte d'anomalie | 🟡 |
| 3 | Dysfunction | `_dysfunction.html.twig` | Carte de dysfonctionnement | 🟡 |
| 4 | Intervention | `_intervention.html.twig` | Carte d'intervention | 🟡 |
| 5 | Leak | `_leak.html.twig` | Carte de fuite | 🟡 |
| 6 | ListAnomalies | `_list_anomalies.html.twig` | Liste d'anomalies | 🟡 |
| 7 | ListDysfunctions | `_list_dysfunctions.html.twig` | Liste de dysfonctionnements | 🟡 |
| 8 | ListInterventions | `_list_interventions.html.twig` | Liste d'interventions | 🟡 |
| 9 | ListLeaks | `_list_leaks.html.twig` | Liste de fuites | 🟡 |
| 10 | ShowIntervention | `_show_intervention.html.twig` | Détails d'intervention | 🟡 |
| 11 | StatusGaugePanel | `_status_gauge_panel.html.twig` | Panneau de jauge de statut | 🟡 |

### 🏢 Composants Immeuble (`templates/Immeuble/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 12 | ChantierPanel | `Immeuble/_chantier_panel.html.twig` | Panneau de chantier | 🟡 |
| 13 | ConsoTab | `Immeuble/_conso_tab.html.twig` | Onglet de consommation | 🟡 |
| 14 | ConsoTable | `Immeuble/_conso_table.html.twig` | Tableau de consommation | 🟡 |
| 15 | ListAnomalies | `Immeuble/_list_anomalies.html.twig` | Liste d'anomalies immeuble | 🟡 |
| 16 | ListDysfunctions | `Immeuble/_list_dysfunctions.html.twig` | Liste de dysfonctionnements immeuble | 🟡 |
| 17 | ListImmeubles | `Immeuble/_list_immeubles.html.twig` | Liste d'immeubles | 🔴 |
| 18 | ListInterventions | `Immeuble/_list_interventions.html.twig` | Liste d'interventions immeuble | 🟡 |
| 19 | ListLeaks | `Immeuble/_list_leaks.html.twig` | Liste de fuites immeuble | 🟡 |
| 20 | Menu | `Immeuble/_menu.html.twig` | Menu navigation immeuble | 🟡 |
| 21 | PanelCET | `Immeuble/_panel_cet.html.twig` | Panel CET (Compteur Énergie Thermique) | 🟡 |
| 22 | PanelEau | `Immeuble/_panel_eau.html.twig` | Panel eau | 🟡 |
| 23 | PanelElect | `Immeuble/_panel_elect.html.twig` | Panel électricité | 🟡 |
| 24 | PanelGaz | `Immeuble/_panel_gaz.html.twig` | Panel gaz | 🟡 |
| 25 | PanelRepart | `Immeuble/_panel_repart.html.twig` | Panel répartiteur | 🟡 |
| 26 | PanelTemp | `Immeuble/_panel_temp.html.twig` | Panel température | 🟡 |

### 🏠 Composants Logement (`templates/Logement/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 27 | AlarmGaugePanel | `Logement/_alarm_gauge_panel.html.twig` | Panneau de jauge d'alarme logement | 🟡 |
| 28 | ConsoTab | `Logement/_conso_tab.html.twig` | Onglet de consommation logement | 🟡 |
| 29 | InfosAppareils | `Logement/_infos_appareils.html.twig` | Informations appareils (générique) | 🟡 |
| 30 | InfosAppareilsChauffage | `Logement/_infos_appareils_chauffage.html.twig` | Informations appareils chauffage | 🟡 |
| 31 | InfosAppareilsEau | `Logement/_infos_appareils_eau.html.twig` | Informations appareils eau | 🟡 |
| 32 | ListAnomalies | `Logement/_list_anomalies.html.twig` | Liste d'anomalies logement | 🟡 |
| 33 | ListDysfunctions | `Logement/_list_dysfunctions.html.twig` | Liste de dysfonctionnements logement | 🟡 |
| 34 | ListInterventions | `Logement/_list_interventions.html.twig` | Liste d'interventions logement | 🟡 |
| 35 | ListLeaks | `Logement/_list_leaks.html.twig` | Liste de fuites logement | 🟡 |
| 36 | ListLogements | `Logement/_list_logements.html.twig` | Liste de logements | 🔴 |
| 37 | Menu | `Logement/_menu.html.twig` | Menu navigation logement | 🟡 |
| 38 | PanelCET | `Logement/_panel_cet.html.twig` | Panel CET logement | 🟡 |
| 39 | PanelEau | `Logement/_panel_eau.html.twig` | Panel eau logement | 🟡 |
| 40 | PanelElect | `Logement/_panel_elect.html.twig` | Panel électricité logement | 🟡 |
| 41 | PanelGaz | `Logement/_panel_gaz.html.twig` | Panel gaz logement | 🟡 |
| 42 | PanelRepart | `Logement/_panel_repart.html.twig` | Panel répartiteur logement | 🟡 |
| 43 | PanelTemp | `Logement/_panel_temp.html.twig` | Panel température logement | 🟡 |
| 44 | StatusGaugePanel | `Logement/_status_gauge_panel.html.twig` | Panneau de jauge de statut logement | 🟡 |

### 👥 Composants Occupant (`templates/Occupant/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 45 | ConsoTab | `Occupant/_conso_tab.html.twig` | Onglet de consommation occupant | 🟡 |
| 46 | ListAnomalies | `Occupant/_list_anomalies.html.twig` | Liste d'anomalies occupant | 🟡 |
| 47 | ListDysfunctions | `Occupant/_list_dysfunctions.html.twig` | Liste de dysfonctionnements occupant | 🟡 |
| 48 | ListInterventions | `Occupant/_list_interventions.html.twig` | Liste d'interventions occupant | 🟡 |
| 49 | ListLeaks | `Occupant/_list_leaks.html.twig` | Liste de fuites occupant | 🟡 |
| 50 | Menu | `Occupant/_menu.html.twig` | Menu navigation occupant | 🟡 |
| 51 | PanelCET | `Occupant/_panel_cet.html.twig` | Panel CET occupant | 🟡 |
| 52 | PanelEau | `Occupant/_panel_eau.html.twig` | Panel eau occupant | 🟡 |
| 53 | PanelElect | `Occupant/_panel_elect.html.twig` | Panel électricité occupant | 🟡 |
| 54 | PanelGaz | `Occupant/_panel_gaz.html.twig` | Panel gaz occupant | 🟡 |
| 55 | PanelRepart | `Occupant/_panel_repart.html.twig` | Panel répartiteur occupant | 🟡 |
| 56 | PanelTemp | `Occupant/_panel_temp.html.twig` | Panel température occupant | 🟡 |

### 👤 Composants Opérateur (`templates/Operator/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 57 | AddBuilding | `Operator/_add_building.html.twig` | Liste d'immeubles à ajouter | 🟡 |
| 58 | Menu | `Operator/_menu.html.twig` | Menu navigation opérateur | 🟡 |
| 59 | RemoveBuilding | `Operator/_remove_building.html.twig` | Liste d'immeubles à retirer | 🟡 |

### 📊 Composants Tableau de Bord (`templates/TableauBordClient/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 60 | ChantierPanel | `TableauBordClient/_chantier_panel.html.twig` | Panneau de chantier tableau de bord | 🟡 |
| 61 | Menu | `TableauBordClient/_menu.html.twig` | Menu navigation tableau de bord | 🟡 |

### 🎫 Composants Ticketing (`templates/Ticketing/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 62 | AddMenuTickets | `Ticketing/add_menu_tickets.html.twig` | Menu ajout de tickets | 🟡 |
| 63 | FormTicketAttachment | `Ticketing/form-ticket-attachment.html.twig` | Formulaire de ticket avec pièce jointe | 🔴 |

### 💰 Composants Facture (`templates/Facture/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 64 | ListFactures | `Facture/_list_factures.html.twig` | Liste de factures | 🟡 |

### 📧 Composants Email (`templates/Email/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 65 | EmailBase | `Email/base.html.twig` | Layout de base pour emails | 🟢 |
| 66 | EmailFormFields | `Email/Form/fields.html.twig` | Champs de formulaire email | 🟢 |
| 67 | EmailIntervention | `Email/intervention.html.twig` | Email d'intervention | 🟢 |
| 68 | EmailSecurityCreate | `Email/Security/create.html.twig` | Email création compte | 🟢 |
| 69 | EmailSecurityLogin | `Email/Security/login.html.twig` | Email de connexion | 🟢 |
| 70 | EmailSecurityResetPassword | `Email/Security/reset-password.html.twig` | Email réinitialisation MDP | 🟢 |
| 71 | EmailSecurityResetOrCreate | `Email/Security/reset-or-create.html.twig` | Email reset ou create | 🟢 |

### 📝 Composants Form (`templates/Form/`)

| # | Composant | Fichier Source | Description | Priorité |
|---|-----------|----------------|-------------|----------|
| 72 | FormFields | `Form/fields.html.twig` | Champs de formulaire génériques | 🟢 |

**Total Composants** : **72 composants** identifiés

---

## 📄 Inventaire des Pages (Fichiers ne commençant pas par `_`)

### 🔐 Pages d'Authentification & Sécurité (`templates/Security/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 1 | Login | `Security/login.html.twig` | `/signin` | ✅ **Migré** | - |
| 2 | Reset Password | `Security/reset-password.html.twig` | `/reset-password` | ❌ À faire | 🔴 |
| 3 | Create Account | `Security/create.html.twig` | `/create` | ❌ À faire | 🟢 |
| 4 | Reset or Create | `Security/reset-or-create.html.twig` | `/reset-or-create` | ❌ À faire | 🟢 |

### 🔐 Pages Login (`templates/login/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 5 | Login Index | `login/index.html.twig` | `/login` | ❌ À faire | 🟢 |
| 6 | Login | `login/login.html.twig` | `/login` | ❌ À faire | 🟢 |

### 🏢 Pages Immeuble (`templates/Immeuble/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 7 | Index (Liste) | `Immeuble/index.html.twig` | `/immeuble` | ✅ **Créé** | - |
| 8 | Show (Détails) | `Immeuble/show.html.twig` | `/immeuble/[pkImmeuble]` | ✅ **Créé** | - |
| 9 | List Anomalies | `Immeuble/listAnomalies.html.twig` | `/immeuble/[pkImmeuble]/anomalies` | ✅ **Créé** | - |
| 10 | List Dysfunctions | `Immeuble/listDysfunctions.html.twig` | `/immeuble/[pkImmeuble]/dysfonctionnements` | ✅ **Créé** | - |
| 11 | List Interventions | `Immeuble/listInterventions.html.twig` | `/immeuble/[pkImmeuble]/interventions` | ✅ **Créé** | - |
| 12 | Show Intervention | `Immeuble/showIntervention.html.twig` | `/immeuble/[pkImmeuble]/interventions/[pkIntervention]` | ✅ **Créé** | - |
| 13 | List Leaks | `Immeuble/listLeaks.html.twig` | `/immeuble/[pkImmeuble]/fuites` | ✅ **Créé** | - |

### 🏠 Pages Logement (`templates/Logement/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 14 | Index (Liste) | `Logement/index.html.twig` | `/immeuble/[pkImmeuble]/logements` | ✅ **Créé** | - |
| 15 | Show (Détails) | `Logement/show.html.twig` | `/logement/[pkLogement]` | ✅ **Créé** | - |
| 16 | Edit | `Logement/edit.html.twig` | `/gestionParc/[pkLogement]/edit` | ✅ **Créé** | - |
| 17 | New Occupant | `Logement/newOccupant.html.twig` | `/gestionParc/[pkLogement]/declareOccupant` | ✅ **Créé** | - |
| 18 | List Anomalies | `Logement/listAnomalies.html.twig` | `/logement/[pkLogement]/anomalies` | ✅ **Créé** | - |
| 19 | List Dysfunctions | `Logement/listDysfunctions.html.twig` | `/logement/[pkLogement]/dysfonctionnements` | ✅ **Créé** | - |
| 20 | List Interventions | `Logement/listInterventions.html.twig` | `/logement/[pkLogement]/interventions` | ✅ **Créé** | - |
| 21 | Show Intervention | `Logement/showIntervention.html.twig` | `/logement/[pkLogement]/interventions/[pkIntervention]` | ✅ **Créé** | - |
| 22 | List Leaks | `Logement/listLeaks.html.twig` | `/logement/[pkLogement]/fuites` | ✅ **Créé** | - |
| 23 | Search | `Logement/search.html.twig` | `/logements/recherche` | ✅ **Créé** | - |

### 👥 Pages Occupant (`templates/Occupant/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 24 | Show (Dashboard) | `Occupant/show.html.twig` | `/occupant` | ✅ **Créé** | - |
| 25 | List Anomalies | `Occupant/listAnomalies.html.twig` | `/occupant/anomalies` | ✅ **Créé** | - |
| 26 | List Dysfunctions | `Occupant/listDysfunctions.html.twig` | `/occupant/dysfonctionnements` | ✅ **Créé** | - |
| 27 | List Interventions | `Occupant/listInterventions.html.twig` | `/occupant/interventions` | ✅ **Créé** | - |
| 28 | Show Intervention | `Occupant/showIntervention.html.twig` | `/occupant/interventions/[pkIntervention]` | ✅ **Créé** | - |
| 29 | List Leaks | `Occupant/listLeaks.html.twig` | `/occupant/fuites` | ✅ **Créé** | - |
| 30 | Simulateur | `Occupant/simulateur.html.twig` | `/occupant/simulateur` | ✅ **Créé** | - |
| 31 | My Account | `Occupant/myAccount.html.twig` | `/occupant/myAccount` | ✅ **Créé** | - |
| 32 | Alertes | `Occupant/alertes.html.twig` | `/occupant/alertes` | ✅ **Créé** | - |
| 33 | Update Password | `Occupant/updatePassword.html.twig` | `/update-password` | ✅ **Créé** | - |

### 👤 Pages Opérateur (`templates/Operator/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 34 | Index (Liste) | `Operator/index.html.twig` | `/gestionnaire` | ✅ **Créé** | - |
| 35 | Create | `Operator/create.html.twig` | `/gestionnaire/nouveau` | ✅ **Créé** | - |
| 36 | View (Détails) | `Operator/view.html.twig` | `/gestionnaire/[id]` | ✅ **Créé** | - |
| 37 | Edit | `Operator/edit.html.twig` | `/gestionnaire/[id]/edit` | ✅ **Créé** | - |
| 38 | Edit Password | `Operator/editPassword.html.twig` | `/gestionnaire/[id]/password` | ✅ **Créé** | - |
| 39 | Stats | `Operator/stats.html.twig` | `/gestionnaire/statistiques` | ✅ **Créé** | - |
| 40 | Update Password | `Operator/updatePassword.html.twig` | `/update-password` | ✅ **Créé** | - |

### 📊 Pages Tableau de Bord (`templates/TableauBordClient/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 41 | Index (Dashboard) | `TableauBordClient/index.html.twig` | `/parc` ou `/dashboard` | ✅ **Créé** | - |

### 🎫 Pages Ticketing (`templates/Ticketing/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 42 | Index Tickets | `Ticketing/index-tickets.html.twig` | `/tickets` | ✅ **Créé** | - |
| 43 | List Tickets | `Ticketing/list-tickets.html.twig` | `/tickets` (partial) | ❌ À faire | 🟡 |
| 44 | Details Tickets | `Ticketing/details-tickets.html.twig` | `/tickets/[id]` | ❌ À faire | 🟡 |
| 45 | Create Ticket | `Ticketing/create-ticket.html.twig` | Modal/Form | ❌ À faire | 🔴 |
| 46 | Tickets List | `Ticketing/tickets-list.html.twig` | `/tickets` (alternative) | ❌ À faire | 🟡 |

### 💰 Pages Facture (`templates/Facture/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 47 | Index | `Facture/index.html.twig` | `/factures` | ✅ **Créé** | - |

### 🔍 Pages Recherche (`templates/Search/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 48 | Index | `Search/index.html.twig` | `/recherche` | ✅ **Créé** | - |

### 📄 Pages Front (`templates/Front/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 49 | Index | `Front/index.html.twig` | `/` (redirect) | ❌ À faire | 🟢 |
| 50 | CGU Page | `Front/cgu_page.html.twig` | `/cgu` | ✅ **Créé** | - |
| 51 | Legal Notices | `Front/legal_notices.html.twig` | `/legal-notices` | ✅ **Créé** | - |
| 52 | Personal Datas | `Front/personal_datas.html.twig` | `/personal-datas` | ✅ **Créé** | - |
| 53 | Legal Notices Content | `Front/legal_notices_content.html.twig` | Partial | ❌ À faire | 🟢 |
| 54 | Legal Notices Connected | `Front/legal_notices_connected.html.twig` | Partial | ❌ À faire | 🟢 |
| 55 | CGU Client Content | `Front/cgu_client_content.html.twig` | Partial | ❌ À faire | 🟢 |
| 56 | CGU Gestionnaire Content | `Front/cgu_gestionnaire_content.html.twig` | Partial | ❌ À faire | 🟢 |
| 57 | CGU Occupant Content | `Front/cgu_occupant_content.html.twig` | Partial | ❌ À faire | 🟢 |

### 📧 Pages Email (`templates/Email/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 58 | Base | `Email/base.html.twig` | Template email | ❌ À faire | 🟢 |
| 59 | Intervention | `Email/intervention.html.twig` | Template email | ❌ À faire | 🟢 |
| 60 | Security Create | `Email/Security/create.html.twig` | Template email | ❌ À faire | 🟢 |
| 61 | Security Login | `Email/Security/login.html.twig` | Template email | ❌ À faire | 🟢 |
| 62 | Security Reset Password | `Email/Security/reset-password.html.twig` | Template email | ❌ À faire | 🟢 |
| 63 | Security Reset Or Create | `Email/Security/reset-or-create.html.twig` | Template email | ❌ À faire | 🟢 |

### 🎨 Layouts & Bases (`templates/` racine)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 64 | Base | `base.html.twig` | Layout principal | ❌ À faire | 🔴 |
| 65 | Base Occupant | `base_occupant.html.twig` | Layout occupant | ❌ À faire | 🔴 |
| 66 | Base Footer | `base_footer.html.twig` | Footer | ❌ À faire | 🟡 |
| 67 | Base Global | `base-global.html.twig` | Layout global | ❌ À faire | 🟡 |
| 68 | Layout | `layout.html.twig` | Layout générique | ❌ À faire | 🟡 |
| 69 | Security Base | `Security/base.html.twig` | Layout sécurité | ❌ À faire | 🟡 |
| 70 | Update Password | `update-password.html.twig` | Partial | ❌ À faire | 🔴 |

### 🧪 Pages de Test (`templates/` racine)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 71 | Test | `test.html.twig` | `/test` (dev) | ❌ À faire | 🟢 |
| 72 | Test SDW | `test_sdw.html.twig` | `/test-sdw` (dev) | ❌ À faire | 🟢 |

### 📁 Pages Old (`templates/Front/old/`)

| # | Page | Fichier Source | Route React | Statut | Priorité |
|---|------|----------------|-------------|--------|----------|
| 73-78 | Old Pages | `Front/old/*.html.twig` | N/A (anciennes versions) | ❌ Ignorer | ⚪ |

**Total Pages** : **~74 pages** identifiées (dont ~40 déjà créées ✅)

---

## 🎯 Stratégie de Migration par Priorité

### Phase 1 : Layouts & Bases (Priorité 🔴)

**Objectif** : Créer les layouts de base nécessaires pour toutes les pages.

#### Étape 1.1 : Layout Principal (Base)
- **Fichier** : `templates/base.html.twig`
- **Destination** : `frontend/src/app/(admin)/layout.tsx`
- **Fonctionnalités** :
  - Header avec navigation
  - Sidebar
  - Footer
  - Breadcrumbs
  - Gestion des menus selon les rôles
- **Temps estimé** : 4-6 heures

#### Étape 1.2 : Layout Occupant
- **Fichier** : `templates/base_occupant.html.twig`
- **Destination** : `frontend/src/app/occupant/layout.tsx`
- **Fonctionnalités** :
  - Header spécifique occupant
  - Navigation occupant
  - Footer
- **Temps estimé** : 3-4 heures

#### Étape 1.3 : Layout Sécurité
- **Fichier** : `templates/Security/base.html.twig`
- **Destination** : `frontend/src/app/(full-width-pages)/(auth)/layout.tsx`
- **Fonctionnalités** :
  - Layout centré
  - Logo
  - Pas de navigation
- **Temps estimé** : 2-3 heures

---

### Phase 2 : Composants Critiques (Priorité 🔴)

**Objectif** : Créer les composants les plus utilisés.

#### Étape 2.1 : Liste de Logements
- **Fichier** : `Logement/_list_logements.html.twig`
- **Destination** : `frontend/src/components/logements/LogementsList.tsx`
- **Fonctionnalités** :
  - Affichage de la liste
  - Filtres
  - Pagination
  - Actions (voir, éditer)
- **Temps estimé** : 4-5 heures

#### Étape 2.2 : Liste d'Immeubles
- **Fichier** : `Immeuble/_list_immeubles.html.twig`
- **Destination** : `frontend/src/components/immeubles/ImmeublesList.tsx`
- **Fonctionnalités** :
  - Affichage de la liste
  - Filtres
  - Pagination
  - Actions (voir)
- **Temps estimé** : 4-5 heures

#### Étape 2.3 : Formulaire de Ticket (Modal)
- **Fichier** : `Ticketing/form-ticket-attachment.html.twig`
- **Destination** : `frontend/src/components/tickets/CreateTicketModal.tsx`
- **Fonctionnalités** :
  - Modal avec overlay
  - Formulaire complet
  - Upload de fichier
  - Validation
- **Temps estimé** : 4-5 heures

---

### Phase 3 : Composants de Liste (Priorité 🟡)

**Objectif** : Créer les composants de liste réutilisables.

#### Étape 3.1 : Liste d'Anomalies
- **Fichiers** : 
  - `_list_anomalies.html.twig`
  - `Immeuble/_list_anomalies.html.twig`
  - `Logement/_list_anomalies.html.twig`
  - `Occupant/_list_anomalies.html.twig`
- **Destination** : `frontend/src/components/anomalies/AnomaliesList.tsx`
- **Fonctionnalités** :
  - Composant réutilisable
  - Filtres
  - Tri
  - Export
- **Temps estimé** : 3-4 heures

#### Étape 3.2 : Liste de Fuites
- **Fichiers** : 
  - `_list_leaks.html.twig`
  - `Immeuble/_list_leaks.html.twig`
  - `Logement/_list_leaks.html.twig`
  - `Occupant/_list_leaks.html.twig`
- **Destination** : `frontend/src/components/leaks/LeaksList.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 3.3 : Liste d'Interventions
- **Fichiers** : 
  - `_list_interventions.html.twig`
  - `Immeuble/_list_interventions.html.twig`
  - `Logement/_list_interventions.html.twig`
  - `Occupant/_list_interventions.html.twig`
- **Destination** : `frontend/src/components/interventions/InterventionsList.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 3.4 : Liste de Dysfonctionnements
- **Fichiers** : 
  - `_list_dysfunctions.html.twig`
  - `Immeuble/_list_dysfunctions.html.twig`
  - `Logement/_list_dysfunctions.html.twig`
  - `Occupant/_list_dysfunctions.html.twig`
- **Destination** : `frontend/src/components/dysfunctions/DysfunctionsList.tsx`
- **Temps estimé** : 3-4 heures

---

### Phase 4 : Composants de Cartes (Priorité 🟡)

**Objectif** : Créer les composants de cartes individuelles.

#### Étape 4.1 : Carte d'Anomalie
- **Fichier** : `_anomaly.html.twig`
- **Destination** : `frontend/src/components/anomalies/AnomalyCard.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 4.2 : Carte de Fuite
- **Fichier** : `_leak.html.twig`
- **Destination** : `frontend/src/components/leaks/LeakCard.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 4.3 : Carte d'Intervention
- **Fichier** : `_intervention.html.twig`
- **Destination** : `frontend/src/components/interventions/InterventionCard.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 4.4 : Carte de Dysfonctionnement
- **Fichier** : `_dysfunction.html.twig`
- **Destination** : `frontend/src/components/dysfunctions/DysfunctionCard.tsx`
- **Temps estimé** : 2-3 heures

---

### Phase 5 : Composants de Panels (Priorité 🟡)

**Objectif** : Créer les composants de panels de consommation.

#### Étape 5.1 : Panel Eau
- **Fichiers** : 
  - `Immeuble/_panel_eau.html.twig`
  - `Logement/_panel_eau.html.twig`
  - `Occupant/_panel_eau.html.twig`
- **Destination** : `frontend/src/components/panels/PanelEau.tsx`
- **Fonctionnalités** :
  - Graphiques de consommation
  - Filtres de dates
  - Informations appareils
- **Temps estimé** : 4-5 heures

#### Étape 5.2 : Panel Répartiteur
- **Fichiers** : 
  - `Immeuble/_panel_repart.html.twig`
  - `Logement/_panel_repart.html.twig`
  - `Occupant/_panel_repart.html.twig`
- **Destination** : `frontend/src/components/panels/PanelRepart.tsx`
- **Temps estimé** : 4-5 heures

#### Étape 5.3 : Panel CET
- **Fichiers** : 
  - `Immeuble/_panel_cet.html.twig`
  - `Logement/_panel_cet.html.twig`
  - `Occupant/_panel_cet.html.twig`
- **Destination** : `frontend/src/components/panels/PanelCET.tsx`
- **Temps estimé** : 4-5 heures

#### Étape 5.4 : Panel Température
- **Fichiers** : 
  - `Immeuble/_panel_temp.html.twig`
  - `Logement/_panel_temp.html.twig`
  - `Occupant/_panel_temp.html.twig`
- **Destination** : `frontend/src/components/panels/PanelTemp.tsx`
- **Temps estimé** : 4-5 heures

#### Étape 5.5 : Panel Électricité & Gaz
- **Fichiers** : 
  - `Immeuble/_panel_elect.html.twig`, `Immeuble/_panel_gaz.html.twig`
  - `Logement/_panel_elect.html.twig`, `Logement/_panel_gaz.html.twig`
  - `Occupant/_panel_elect.html.twig`, `Occupant/_panel_gaz.html.twig`
- **Destination** : `frontend/src/components/panels/PanelElect.tsx`, `PanelGaz.tsx`
- **Temps estimé** : 3-4 heures chacun

---

### Phase 6 : Composants de Navigation (Priorité 🟡)

**Objectif** : Créer les composants de menu/navigation.

#### Étape 6.1 : Menu Immeuble
- **Fichier** : `Immeuble/_menu.html.twig`
- **Destination** : `frontend/src/components/navigation/ImmeubleMenu.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 6.2 : Menu Logement
- **Fichier** : `Logement/_menu.html.twig`
- **Destination** : `frontend/src/components/navigation/LogementMenu.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 6.3 : Menu Occupant
- **Fichier** : `Occupant/_menu.html.twig`
- **Destination** : `frontend/src/components/navigation/OccupantMenu.tsx`
- **Temps estimé** : 2-3 heures

#### Étape 6.4 : Menu Tableau de Bord
- **Fichier** : `TableauBordClient/_menu.html.twig`
- **Destination** : `frontend/src/components/navigation/DashboardMenu.tsx`
- **Temps estimé** : 2-3 heures

---

### Phase 7 : Composants Spécialisés (Priorité 🟡)

**Objectif** : Créer les composants spécialisés restants.

#### Étape 7.1 : Panneau de Chantier
- **Fichiers** : 
  - `Immeuble/_chantier_panel.html.twig`
  - `TableauBordClient/_chantier_panel.html.twig`
- **Destination** : `frontend/src/components/panels/ChantierPanel.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 7.2 : Onglet de Consommation
- **Fichiers** : 
  - `Immeuble/_conso_tab.html.twig`
  - `Logement/_conso_tab.html.twig`
  - `Occupant/_conso_tab.html.twig`
- **Destination** : `frontend/src/components/consumption/ConsoTab.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 7.3 : Tableau de Consommation
- **Fichier** : `Immeuble/_conso_table.html.twig`
- **Destination** : `frontend/src/components/consumption/ConsoTable.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 7.4 : Informations Appareils
- **Fichiers** : 
  - `Logement/_infos_appareils.html.twig`
  - `Logement/_infos_appareils_eau.html.twig`
  - `Logement/_infos_appareils_chauffage.html.twig`
- **Destination** : `frontend/src/components/devices/DeviceInfo.tsx`
- **Temps estimé** : 3-4 heures

#### Étape 7.5 : Panneaux de Jauge
- **Fichiers** : 
  - `_alarm_gauge_panel.html.twig`
  - `_status_gauge_panel.html.twig`
  - `Logement/_alarm_gauge_panel.html.twig`
  - `Logement/_status_gauge_panel.html.twig`
- **Destination** : `frontend/src/components/gauges/AlarmGaugePanel.tsx`, `StatusGaugePanel.tsx`
- **Temps estimé** : 2-3 heures chacun

#### Étape 7.6 : Détails d'Intervention
- **Fichier** : `_show_intervention.html.twig`
- **Destination** : `frontend/src/components/interventions/InterventionDetails.tsx`
- **Temps estimé** : 3-4 heures

---

### Phase 8 : Pages Manquantes (Priorité 🟡)

**Objectif** : Compléter les pages qui n'ont pas encore été créées.

#### Étape 8.1 : Pages Ticketing
- **Pages** :
  - `Ticketing/list-tickets.html.twig` → `/tickets` (partial)
  - `Ticketing/details-tickets.html.twig` → `/tickets/[id]`
- **Temps estimé** : 3-4 heures par page

#### Étape 8.2 : Pages Front Partials
- **Pages** :
  - `Front/legal_notices_content.html.twig`
  - `Front/legal_notices_connected.html.twig`
  - `Front/cgu_client_content.html.twig`
  - `Front/cgu_gestionnaire_content.html.twig`
  - `Front/cgu_occupant_content.html.twig`
- **Temps estimé** : 1-2 heures par page

---

### Phase 9 : Composants Opérateur (Priorité 🟡)

**Objectif** : Créer les composants spécifiques aux opérateurs.

#### Étape 9.1 : Ajout/Retrait d'Immeubles
- **Fichiers** : 
  - `Operator/_add_building.html.twig`
  - `Operator/_remove_building.html.twig`
- **Destination** : `frontend/src/components/operators/BuildingSelector.tsx`
- **Temps estimé** : 3-4 heures

---

### Phase 10 : Composants Email (Priorité 🟢)

**Objectif** : Créer les templates d'emails (si nécessaire côté frontend).

**Note** : Les templates d'emails sont généralement gérés côté backend. Cette phase peut être ignorée si les emails sont générés uniquement côté serveur.

---

## 🏗️ Structure de Migration

### Organisation des Composants

```
frontend/src/components/
├── anomalies/
│   ├── AnomaliesList.tsx
│   └── AnomalyCard.tsx
├── leaks/
│   ├── LeaksList.tsx
│   └── LeakCard.tsx
├── interventions/
│   ├── InterventionsList.tsx
│   ├── InterventionCard.tsx
│   └── InterventionDetails.tsx
├── dysfunctions/
│   ├── DysfunctionsList.tsx
│   └── DysfunctionCard.tsx
├── logements/
│   └── LogementsList.tsx
├── immeubles/
│   └── ImmeublesList.tsx
├── tickets/
│   └── CreateTicketModal.tsx
├── panels/
│   ├── PanelEau.tsx
│   ├── PanelRepart.tsx
│   ├── PanelCET.tsx
│   ├── PanelTemp.tsx
│   ├── PanelElect.tsx
│   ├── PanelGaz.tsx
│   └── ChantierPanel.tsx
├── consumption/
│   ├── ConsoTab.tsx
│   └── ConsoTable.tsx
├── devices/
│   └── DeviceInfo.tsx
├── gauges/
│   ├── AlarmGaugePanel.tsx
│   └── StatusGaugePanel.tsx
├── navigation/
│   ├── ImmeubleMenu.tsx
│   ├── LogementMenu.tsx
│   ├── OccupantMenu.tsx
│   └── DashboardMenu.tsx
└── operators/
    └── BuildingSelector.tsx
```

### Organisation des Pages

```
frontend/src/app/
├── (admin)/                    # Layout admin
│   ├── layout.tsx              # Base layout
│   ├── dashboard/
│   │   └── page.tsx            # ✅ Créé
│   ├── immeuble/
│   │   ├── page.tsx            # ✅ Créé
│   │   └── [pkImmeuble]/
│   │       ├── page.tsx        # ✅ Créé
│   │       ├── anomalies/
│   │       ├── fuites/
│   │       ├── interventions/
│   │       └── logements/
│   ├── logement/
│   │   └── [pkLogement]/
│   │       ├── page.tsx        # ✅ Créé
│   │       └── ...
│   ├── gestionParc/
│   │   └── [pkLogement]/
│   │       ├── page.tsx        # ✅ Créé
│   │       ├── edit/
│   │       └── declareOccupant/
│   ├── gestionnaire/
│   │   ├── page.tsx            # ✅ Créé
│   │   ├── nouveau/
│   │   └── [id]/
│   ├── tickets/
│   │   └── page.tsx            # ✅ Créé
│   └── factures/
│       └── page.tsx            # ✅ Créé
├── occupant/                   # Layout occupant
│   ├── layout.tsx              # Base occupant layout
│   ├── page.tsx                # ✅ Créé
│   ├── interventions/
│   ├── fuites/
│   ├── anomalies/
│   ├── dysfonctionnements/
│   ├── simulateur/
│   ├── myAccount/
│   └── alertes/
├── (full-width-pages)/         # Layout full-width
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout
│   │   ├── signin/
│   │   ├── reset-password/
│   │   └── update-password/
│   ├── legal-notices/
│   ├── personal-datas/
│   ├── cgu/
│   └── recherche/
└── layout.tsx                  # Root layout
```

---

## 📊 Estimation Totale

### Temps par Phase

- **Phase 1** (Layouts) : 9-13 heures
- **Phase 2** (Composants Critiques) : 12-15 heures
- **Phase 3** (Composants de Liste) : 12-16 heures
- **Phase 4** (Composants de Cartes) : 8-12 heures
- **Phase 5** (Composants de Panels) : 18-23 heures
- **Phase 6** (Navigation) : 8-12 heures
- **Phase 7** (Composants Spécialisés) : 16-22 heures
- **Phase 8** (Pages Manquantes) : 8-12 heures
- **Phase 9** (Composants Opérateur) : 3-4 heures
- **Phase 10** (Emails) : 0 heures (ignoré)

**Total estimé** : **94-129 heures** (~12-16 jours de travail)

---

## 🚀 Ordre d'Exécution Recommandé

### Sprint 1 : Fondations (2-3 jours)
1. Layouts de base (Phase 1)
2. Composants critiques (Phase 2)

### Sprint 2 : Composants Réutilisables (2-3 jours)
1. Composants de liste (Phase 3)
2. Composants de cartes (Phase 4)

### Sprint 3 : Composants Spécialisés (3-4 jours)
1. Composants de panels (Phase 5)
2. Composants de navigation (Phase 6)
3. Composants spécialisés (Phase 7)

### Sprint 4 : Finalisation (1-2 jours)
1. Pages manquantes (Phase 8)
2. Composants opérateur (Phase 9)

---

## ✅ Critères de Succès

Un composant/page est considéré comme migré avec succès si :

1. ✅ **Fonctionnalité** : Toutes les fonctionnalités du template Twig sont reproduites
2. ✅ **Design** : Le design est fidèle ou amélioré
3. ✅ **Interactivité** : Toutes les interactions fonctionnent
4. ✅ **API** : Intégration avec les hooks API
5. ✅ **Responsive** : Fonctionne sur mobile et desktop
6. ✅ **Accessibilité** : Labels, ARIA, navigation clavier
7. ✅ **Performance** : Chargement rapide, optimisations

---

## 📝 Notes Importantes

### 1. Réutilisabilité

Beaucoup de composants sont similaires entre Immeuble, Logement et Occupant. Créer des composants réutilisables avec des props pour gérer les différences.

### 2. Graphiques

Les panels de consommation utilisent probablement des graphiques. Utiliser une bibliothèque comme Recharts ou ApexCharts.

### 3. Filtres

Les composants de liste ont souvent des filtres complexes. Créer un système de filtrage réutilisable.

### 4. Navigation

Les menus doivent être dynamiques selon les rôles utilisateur. Utiliser les hooks d'authentification.

### 5. Layouts

Les layouts doivent gérer :
- Navigation selon les rôles
- Breadcrumbs dynamiques
- Messages flash
- Notifications

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Stratégie complète - Prêt pour migration

