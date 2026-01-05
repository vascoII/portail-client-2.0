# 📄 Liste Complète des Pages - Architecture Next.js App Router

**Date** : 2025-01-XX  
**Objectif** : Mapper toutes les routes Symfony vers la structure Next.js App Router  
**Note** : Les routes Symfony ont un préfixe `/{_locale}` mais Next.js gère la locale via `next-intl`

---

## 📊 Résumé

| Catégorie | Nombre de Pages | Statut |
|-----------|----------------|--------|
| **Authentification** | 4 | ✅ Partiellement créées |
| **Dashboard** | 2 | ✅ Partiellement créées |
| **Immeubles** | 10 | ✅ Partiellement créées |
| **Logements** | 12 | ✅ Partiellement créées |
| **Gestion Parc** | 5 | ✅ Partiellement créées |
| **Occupant** | 10 | ✅ Partiellement créées |
| **Opérateurs** | 6 | ✅ Partiellement créées |
| **Tickets** | 1 | ✅ Créée |
| **Factures** | 1 | ✅ Créée |
| **Recherche** | 1 | ✅ Créée |
| **Front/Général** | 3 | ✅ Partiellement créées |
| **Exports/Downloads** | 15+ | ❌ À créer (API routes) |
| **TOTAL** | **70+** | **~40 créées** |

---

## 🔐 1. Authentification & Sécurité

### 1.1. Page d'Accueil (Redirection)
- **Route Symfony** : `/` → `FrontController::indexAction`
- **Route Next.js** : `/`
- **Fichier** : `app/page.tsx`
- **Description** : Redirige vers `/login`, `/dashboard` ou `/occupant` selon l'état d'authentification
- **Statut** : ❌ À créer

### 1.2. Connexion
- **Route Symfony** : `/login` → `SecurityController::loginAction`
- **Route Next.js** : `/login` ⚠️ **À migrer depuis `/signin`**
- **Fichier** : `app/(full-width-pages)/(auth)/login/page.tsx` (après renommage)
- **Composant** : `components/techem/security/form/login.tsx`
- **Statut** : ✅ Créée (nécessite renommage du dossier `signin/` → `login/`)
- **Note** : Voir `SIGNIN_TO_LOGIN_MIGRATION.md` pour les détails de migration

### 1.3. Connexion via Paramètre
- **Route Symfony** : `/login/{param}` → `SecurityController::loginFromParamAction`
- **Route Next.js** : `/signin/[param]/page.tsx`
- **Fichier** : `app/(full-width-pages)/(auth)/signin/[param]/page.tsx`
- **Description** : Connexion automatique via lien email
- **Statut** : ❌ À créer

### 1.4. Réinitialisation Mot de Passe
- **Route Symfony** : `/reset-password` → `SecurityController::resetPasswordAction`
- **Route Next.js** : `/reset-password`
- **Fichier** : `app/(full-width-pages)/(auth)/reset-password/page.tsx`
- **Composant** : `components/techem/security/form/reset-password.tsx`
- **Statut** : ✅ Créée

### 1.5. Mise à Jour Mot de Passe
- **Route Symfony** : `/update-password` → `SecurityController::updatePasswordAction`
- **Route Next.js** : `/update-password`
- **Fichier** : `app/(full-width-pages)/(auth)/update-password/page.tsx`
- **Composant** : `components/techem/security/form/update-password.tsx`
- **Statut** : ✅ Créée

### 1.6. Déconnexion
- **Route Symfony** : `/logout` → `SecurityController::logoutAction`
- **Route Next.js** : `/logout` (API route ou redirect)
- **Description** : Déconnexion via API, redirection vers `/signin`
- **Statut** : ⚠️ Géré par middleware/hook

---

## 📊 2. Dashboard & Tableau de Bord

### 2.1. Dashboard Client (Gestionnaire)
- **Route Symfony** : `/parc` → `TableauBordClientController::indexAction`
- **Route Next.js** : `/dashboard`
- **Fichier** : `app/(admin)/dashboard/page.tsx`
- **Hook API** : `useDashboard().getDashboard()`
- **Statut** : ✅ Créée

### 2.2. Dashboard Occupant
- **Route Symfony** : `/occupant` → `OccupantController::showAction`
- **Route Next.js** : `/occupant`
- **Fichier** : `app/occupant/page.tsx`
- **Hook API** : `useOccupant().getDashboard()`
- **Statut** : ✅ Créée

---

## 🏢 3. Immeubles

### 3.1. Liste des Immeubles
- **Route Symfony** : `/immeuble` → `ImmeubleController::indexAction`
- **Route Next.js** : `/immeuble`
- **Fichier** : `app/(admin)/immeuble/page.tsx`
- **Hook API** : `useImmeubles().getImmeubles()`
- **Composant** : `components/techem/immeuble/form/filter.tsx`
- **Statut** : ✅ Créée

### 3.2. Filtrage Immeubles (API)
- **Route Symfony** : `/immeuble/filtre` → `ImmeubleController::filterResultAction`
- **Route Next.js** : API route uniquement
- **Hook API** : `useImmeubles().filterImmeubles()`
- **Statut** : ✅ Géré par hook

### 3.3. Détails Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}` → `ImmeubleController::showAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/page.tsx`
- **Hook API** : `useImmeubles().getImmeuble()`
- **Statut** : ✅ Créée

### 3.4. Liste Logements d'un Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/logements` → `LogementController::indexAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/logements`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/logements/page.tsx`
- **Hook API** : `useLogements().getLogementsByImmeuble()`
- **Statut** : ✅ Créée

### 3.5. Interventions d'un Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/interventions` → `ImmeubleController::listInterventionsAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/interventions`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/interventions/page.tsx`
- **Hook API** : `useImmeubles().getInterventions()`
- **Statut** : ✅ Créée

### 3.6. Détails Intervention Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/interventions/{pkIntervention}` → `ImmeubleController::showInterventionAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/interventions/[pkIntervention]`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/interventions/[pkIntervention]/page.tsx`
- **Hook API** : `useImmeubles().getIntervention()`
- **Statut** : ✅ Créée

### 3.7. Fuites d'un Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/fuites` → `ImmeubleController::listLeaksAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/fuites`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/fuites/page.tsx`
- **Hook API** : `useImmeubles().getFuites()`
- **Statut** : ✅ Créée

### 3.8. Anomalies d'un Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/anomalies` → `ImmeubleController::listAnomaliesAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/anomalies`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/anomalies/page.tsx`
- **Hook API** : `useImmeubles().getAnomalies()`
- **Statut** : ✅ Créée

### 3.9. Dysfonctionnements d'un Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/dysfonctionnements` → `ImmeubleController::listDysfunctionsAction`
- **Route Next.js** : `/immeuble/[pkImmeuble]/dysfonctionnements`
- **Fichier** : `app/(admin)/immeuble/[pkImmeuble]/dysfonctionnements/page.tsx`
- **Hook API** : `useImmeubles().getDysfonctionnements()`
- **Statut** : ✅ Créée

### 3.10. Export Interventions Immeuble
- **Route Symfony** : `/immeuble/{pkImmeuble}/interventions-export` → `ImmeubleController::exportInterventionsAction`
- **Route Next.js** : API route uniquement (download)
- **Hook API** : `useImmeubles().exportInterventions()`
- **Statut** : ⚠️ Géré par API

---

## 🏠 4. Logements

### 4.1. Détails Logement
- **Route Symfony** : `/logement/{pkLogement}` → `LogementController::showAction`
- **Route Next.js** : `/logement/[pkLogement]`
- **Fichier** : `app/(admin)/logement/[pkLogement]/page.tsx`
- **Hook API** : `useLogements().getLogement()`
- **Statut** : ✅ Créée

### 4.2. Interventions d'un Logement
- **Route Symfony** : `/logement/{pkLogement}/interventions` → `LogementController::listInterventionsAction`
- **Route Next.js** : `/logement/[pkLogement]/interventions`
- **Fichier** : `app/(admin)/logement/[pkLogement]/interventions/page.tsx`
- **Hook API** : `useLogements().getInterventions()`
- **Statut** : ✅ Créée

### 4.3. Détails Intervention Logement
- **Route Symfony** : `/logement/{pkLogement}/interventions/{pkIntervention}` → `LogementController::showInterventionAction`
- **Route Next.js** : `/logement/[pkLogement]/interventions/[pkIntervention]`
- **Fichier** : `app/(admin)/logement/[pkLogement]/interventions/[pkIntervention]/page.tsx`
- **Hook API** : `useLogements().getIntervention()`
- **Statut** : ✅ Créée

### 4.4. Fuites d'un Logement
- **Route Symfony** : `/logement/{pkLogement}/fuites` → `LogementController::listLeaksAction`
- **Route Next.js** : `/logement/[pkLogement]/fuites`
- **Fichier** : `app/(admin)/logement/[pkLogement]/fuites/page.tsx`
- **Hook API** : `useLogements().getFuites()`
- **Statut** : ✅ Créée

### 4.5. Anomalies d'un Logement
- **Route Symfony** : `/logement/{pkLogement}/anomalies` → `LogementController::listAnomaliesAction`
- **Route Next.js** : `/logement/[pkLogement]/anomalies`
- **Fichier** : `app/(admin)/logement/[pkLogement]/anomalies/page.tsx`
- **Hook API** : `useLogements().getAnomalies()`
- **Statut** : ✅ Créée

### 4.6. Dysfonctionnements d'un Logement
- **Route Symfony** : `/logement/{pkLogement}/dysfonctionnements` → `LogementController::listDysfunctionsAction`
- **Route Next.js** : `/logement/[pkLogement]/dysfonctionnements`
- **Fichier** : `app/(admin)/logement/[pkLogement]/dysfonctionnements/page.tsx`
- **Hook API** : `useLogements().getDysfonctionnements()`
- **Statut** : ✅ Créée

### 4.7. Recherche Logements
- **Route Symfony** : `/logements/recherche` → `LogementController::searchAction`
- **Route Next.js** : `/logements/recherche`
- **Fichier** : `app/(admin)/logements/recherche/page.tsx`
- **Composant** : `components/techem/logement/form/filter.tsx`
- **Hook API** : `useLogements().searchLogements()`
- **Statut** : ✅ Créée

### 4.8. Export Logements
- **Route Symfony** : `/immeuble/{pkImmeuble}/logements/export` → `LogementController::exportAction`
- **Route Next.js** : API route uniquement
- **Statut** : ⚠️ Géré par API

---

## 🏗️ 5. Gestion Parc

### 5.1. Index Gestion Parc
- **Route Symfony** : `/gestionParc` → `ImmeubleController::indexAction` (avec `gestion: true`)
- **Route Next.js** : `/gestionParc`
- **Fichier** : `app/(admin)/gestionParc/page.tsx`
- **Hook API** : `useGestionParc().getIndex()`
- **Statut** : ✅ Créée

### 5.2. Filtrage Gestion Parc
- **Route Symfony** : `/gestionParc/filtre` → `GestionParcController::filterResultAction`
- **Route Next.js** : API route uniquement
- **Hook API** : `useGestionParc().filter()`
- **Statut** : ✅ Géré par hook

### 5.3. Logements Gestion Parc (par Immeuble)
- **Route Symfony** : `/gestionParc/{pkImmeuble}` → `LogementController::indexAction` (avec `gestion: true`)
- **Route Next.js** : `/gestionParc/[pkImmeuble]`
- **Fichier** : `app/(admin)/gestionParc/[pkImmeuble]/page.tsx`
- **Hook API** : `useGestionParc().getLogementsByImmeuble()`
- **Statut** : ❌ À créer

### 5.4. Détails Logement Gestion Parc
- **Route Symfony** : `/gestionParc/{pkLogement}/show` → `LogementController::showAction` (avec `gestion: true`)
- **Route Next.js** : `/gestionParc/[pkLogement]`
- **Fichier** : `app/(admin)/gestionParc/[pkLogement]/page.tsx`
- **Hook API** : `useGestionParc().getLogement()`
- **Statut** : ✅ Créée

### 5.5. Édition Logement Gestion Parc
- **Route Symfony** : `/gestionParc/{pkLogement}/edit` → `LogementController::editAction`
- **Route Next.js** : `/gestionParc/[pkLogement]/edit`
- **Fichier** : `app/(admin)/gestionParc/[pkLogement]/edit/page.tsx`
- **Composant** : `components/techem/logement/form/edit-occupant.tsx`
- **Hook API** : `useGestionParc().updateLogement()`
- **Statut** : ✅ Créée

### 5.6. Déclaration Occupant Gestion Parc
- **Route Symfony** : `/gestionParc/{pkLogement}/declareOccupant` → `LogementController::declareOccupantAction`
- **Route Next.js** : `/gestionParc/[pkLogement]/declareOccupant`
- **Fichier** : `app/(admin)/gestionParc/[pkLogement]/declareOccupant/page.tsx`
- **Composant** : `components/techem/logement/form/new-occupant.tsx`
- **Hook API** : `useGestionParc().declareOccupant()`
- **Statut** : ✅ Créée

---

## 👥 6. Occupant (Espace Occupant)

### 6.1. Dashboard Occupant
- **Route Symfony** : `/occupant` → `OccupantController::showAction`
- **Route Next.js** : `/occupant`
- **Fichier** : `app/occupant/page.tsx`
- **Hook API** : `useOccupant().getDashboard()`
- **Statut** : ✅ Créée

### 6.2. Simulateur de Consommation
- **Route Symfony** : `/occupant/simulateur` → `OccupantController::SimulateurAction`
- **Route Next.js** : `/occupant/simulateur`
- **Fichier** : `app/occupant/simulateur/page.tsx`
- **Composant** : `components/techem/occupant/form/simulator.tsx`
- **Statut** : ✅ Créée

### 6.3. Mon Compte
- **Route Symfony** : `/occupant/myAccount` → `OccupantController::myAccountAction`
- **Route Next.js** : `/occupant/myAccount`
- **Fichier** : `app/occupant/myAccount/page.tsx`
- **Composant** : `components/techem/occupant/form/rgpd-consent.tsx`
- **Hook API** : `useOccupant().getMyAccount()`
- **Statut** : ✅ Créée

### 6.4. Alertes
- **Route Symfony** : `/occupant/alertes` → `OccupantController::alertesAction`
- **Route Next.js** : `/occupant/alertes`
- **Fichier** : `app/occupant/alertes/page.tsx`
- **Composant** : `components/techem/occupant/form/alerts.tsx`
- **Hook API** : `useOccupant().getAlertes()`
- **Statut** : ✅ Créée

### 6.5. Interventions Occupant
- **Route Symfony** : `/occupant/interventions` → `OccupantController::listInterventionsAction`
- **Route Next.js** : `/occupant/interventions`
- **Fichier** : `app/occupant/interventions/page.tsx`
- **Hook API** : `useOccupant().getInterventions()`
- **Statut** : ✅ Créée

### 6.6. Détails Intervention Occupant
- **Route Symfony** : `/occupant/interventions/{pkIntervention}` → `OccupantController::showInterventionAction`
- **Route Next.js** : `/occupant/interventions/[pkIntervention]`
- **Fichier** : `app/occupant/interventions/[pkIntervention]/page.tsx`
- **Hook API** : `useOccupant().getIntervention()`
- **Statut** : ✅ Créée

### 6.7. Fuites Occupant
- **Route Symfony** : `/occupant/fuites` → `OccupantController::listLeaksAction`
- **Route Next.js** : `/occupant/fuites`
- **Fichier** : `app/occupant/fuites/page.tsx`
- **Hook API** : `useOccupant().getFuites()`
- **Statut** : ✅ Créée

### 6.8. Anomalies Occupant
- **Route Symfony** : `/occupant/anomalies` → `OccupantController::listAnomaliesAction`
- **Route Next.js** : `/occupant/anomalies`
- **Fichier** : `app/occupant/anomalies/page.tsx`
- **Hook API** : `useOccupant().getAnomalies()`
- **Statut** : ✅ Créée

### 6.9. Dysfonctionnements Occupant
- **Route Symfony** : `/occupant/dysfonctionnements` → `OccupantController::listDysfunctionsAction`
- **Route Next.js** : `/occupant/dysfonctionnements`
- **Fichier** : `app/occupant/dysfonctionnements/page.tsx`
- **Hook API** : `useOccupant().getDysfonctionnements()`
- **Statut** : ✅ Créée

### 6.10. Exports Occupant
- **Routes Symfony** : 
  - `/occupant/anomalies/export`
  - `/occupant/fuites/export`
  - `/occupant/interventions/export`
  - `/occupant/dysfonctionnements/export`
- **Route Next.js** : API routes uniquement
- **Statut** : ⚠️ Géré par API

---

## 👤 7. Opérateurs (Gestionnaires)

### 7.1. Liste des Opérateurs
- **Route Symfony** : `/gestionnaire` → `OperatorController::indexAction`
- **Route Next.js** : `/gestionnaire`
- **Fichier** : `app/(admin)/gestionnaire/page.tsx`
- **Hook API** : `useOperators().getOperators()`
- **Statut** : ✅ Créée

### 7.2. Création Opérateur
- **Route Symfony** : `/gestionnaire/nouveau` → `OperatorController::createAction`
- **Route Next.js** : `/gestionnaire/nouveau`
- **Fichier** : `app/(admin)/gestionnaire/nouveau/page.tsx`
- **Composant** : `components/techem/operator/form/create.tsx`
- **Hook API** : `useOperators().createOperator()`
- **Statut** : ✅ Créée

### 7.3. Statistiques Opérateurs
- **Route Symfony** : `/gestionnaire/statistiques` → `OperatorController::otatsoccupantsAction`
- **Route Next.js** : `/gestionnaire/statistiques`
- **Fichier** : `app/(admin)/gestionnaire/statistiques/page.tsx`
- **Hook API** : `useOperators().getStatistics()`
- **Statut** : ✅ Créée

### 7.4. Détails Opérateur
- **Route Symfony** : `/gestionnaire/{id}` → `OperatorController::viewAction`
- **Route Next.js** : `/gestionnaire/[id]`
- **Fichier** : `app/(admin)/gestionnaire/[id]/page.tsx`
- **Hook API** : `useOperators().getOperator()`
- **Statut** : ✅ Créée

### 7.5. Édition Opérateur
- **Route Symfony** : `/gestionnaire/{id}/edit` → `OperatorController::editAction`
- **Route Next.js** : `/gestionnaire/[id]/edit`
- **Fichier** : `app/(admin)/gestionnaire/[id]/edit/page.tsx`
- **Composant** : `components/techem/operator/form/edit.tsx`
- **Hook API** : `useOperators().updateOperator()`
- **Statut** : ✅ Créée

### 7.6. Changement Mot de Passe Opérateur
- **Route Symfony** : `/gestionnaire/{id}/password` → `OperatorController::editPasswordAction`
- **Route Next.js** : `/gestionnaire/[id]/password`
- **Fichier** : `app/(admin)/gestionnaire/[id]/password/page.tsx`
- **Composant** : `components/techem/operator/form/edit-password.tsx`
- **Hook API** : `useOperators().updatePassword()`
- **Statut** : ✅ Créée

---

## 🎫 8. Tickets

### 8.1. Liste des Tickets
- **Route Symfony** : `/tickets` → `TicketingController::ticketListAction`
- **Route Next.js** : `/tickets`
- **Fichier** : `app/(admin)/tickets/page.tsx`
- **Hook API** : `useTickets().getTickets()`
- **Statut** : ✅ Créée

### 8.2. Création Ticket (Modal)
- **Route Symfony** : `/logement/{pkLogement}/createticket` → `LogementController::createTicketAction` (POST)
- **Route Next.js** : Composant Modal (pas de page dédiée)
- **Composant** : `components/techem/ticketing/form/create-ticket.tsx`
- **Hook API** : `useLogements().createTicket()`
- **Statut** : ✅ Créé (composant)

---

## 💰 9. Factures

### 9.1. Liste des Factures
- **Route Symfony** : `/factures` → `FactureController::indexAction`
- **Route Next.js** : `/factures`
- **Fichier** : `app/(admin)/factures/page.tsx`
- **Hook API** : `useFactures().getFactures()`
- **Statut** : ✅ Créée

### 9.2. Téléchargement Facture
- **Route Symfony** : `/factures/download/{pkFacture}` → `FactureController::reportAction`
- **Route Next.js** : API route uniquement (download)
- **Hook API** : `useFactures().downloadFacture()`
- **Statut** : ⚠️ Géré par API

---

## 🔍 10. Recherche

### 10.1. Recherche Unifiée
- **Route Symfony** : `/recherche` → `SearchController::indexAction`
- **Route Next.js** : `/recherche`
- **Fichier** : `app/(full-width-pages)/recherche/page.tsx`
- **Composant** : `components/techem/search/search.tsx`
- **Hook API** : `useSearch().search()`
- **Statut** : ✅ Créée

---

## 📄 11. Front & Pages Générales

### 11.1. Mentions Légales
- **Route Symfony** : `/legal-notices` → `FrontController::legalNoticesAction`
- **Route Next.js** : `/legal-notices`
- **Fichier** : `app/(full-width-pages)/legal-notices/page.tsx`
- **Statut** : ✅ Créée

### 11.2. Données Personnelles
- **Route Symfony** : `/personal-datas` → `FrontController::personalDatasAction`
- **Route Next.js** : `/personal-datas`
- **Fichier** : `app/(full-width-pages)/personal-datas/page.tsx`
- **Statut** : ✅ Créée

### 11.3. Validation CGU
- **Route Symfony** : `/cgu` → `FrontController::cguAction`
- **Route Next.js** : `/cgu`
- **Fichier** : `app/(full-width-pages)/cgu/page.tsx`
- **Composant** : `components/techem/front/form/cgu-validation.tsx`
- **Hook API** : `useFront().acceptCGU()`
- **Statut** : ✅ Créée

---

## 🌐 12. Traduction

### 12.1. Changement de Locale
- **Route Symfony** : `/change/locale/{language}` → `TranslationController::changeLocaleAction`
- **Route Next.js** : Géré par `next-intl` (pas de page dédiée)
- **Statut** : ⚠️ Géré par next-intl

---

## 📁 Structure Complète des Dossiers

```
app/
├── page.tsx                                    ❌ À créer (redirection)
├── (full-width-pages)/
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx                       ✅ Créée (à renommer depuis signin)
│   │   │   └── [param]/
│   │   │       └── page.tsx                   ❌ À créer
│   │   ├── reset-password/
│   │   │   └── page.tsx                       ✅ Créée
│   │   └── update-password/
│   │       └── page.tsx                       ✅ Créée
│   ├── legal-notices/
│   │   └── page.tsx                           ✅ Créée
│   ├── personal-datas/
│   │   └── page.tsx                           ✅ Créée
│   ├── cgu/
│   │   └── page.tsx                           ✅ Créée
│   └── recherche/
│       └── page.tsx                           ✅ Créée
├── (admin)/
│   ├── dashboard/
│   │   └── page.tsx                           ✅ Créée
│   ├── parc/
│   │   └── page.tsx                           ❌ À créer (alias /dashboard)
│   ├── immeuble/
│   │   ├── page.tsx                           ✅ Créée
│   │   └── [pkImmeuble]/
│   │       ├── page.tsx                       ✅ Créée
│   │       ├── logements/
│   │       │   └── page.tsx                   ✅ Créée
│   │       ├── interventions/
│   │       │   ├── page.tsx                   ✅ Créée
│   │       │   └── [pkIntervention]/
│   │       │       └── page.tsx               ✅ Créée
│   │       ├── fuites/
│   │       │   └── page.tsx                   ✅ Créée
│   │       ├── anomalies/
│   │       │   └── page.tsx                   ✅ Créée
│   │       └── dysfonctionnements/
│   │           └── page.tsx                   ✅ Créée
│   ├── logement/
│   │   └── [pkLogement]/
│   │       ├── page.tsx                       ✅ Créée
│   │       ├── interventions/
│   │       │   ├── page.tsx                   ✅ Créée
│   │       │   └── [pkIntervention]/
│   │       │       └── page.tsx               ✅ Créée
│   │       ├── fuites/
│   │       │   └── page.tsx                   ✅ Créée
│   │       ├── anomalies/
│   │       │   └── page.tsx                   ✅ Créée
│   │       └── dysfonctionnements/
│   │           └── page.tsx                   ✅ Créée
│   ├── logements/
│   │   └── recherche/
│   │       └── page.tsx                       ✅ Créée
│   ├── gestionParc/
│   │   ├── page.tsx                           ✅ Créée
│   │   ├── [pkImmeuble]/
│   │   │   └── page.tsx                       ❌ À créer
│   │   └── [pkLogement]/
│   │       ├── page.tsx                       ✅ Créée
│   │       ├── edit/
│   │       │   └── page.tsx                   ✅ Créée
│   │       └── declareOccupant/
│   │           └── page.tsx                   ✅ Créée
│   ├── gestionnaire/
│   │   ├── page.tsx                           ✅ Créée
│   │   ├── nouveau/
│   │   │   └── page.tsx                       ✅ Créée
│   │   ├── statistiques/
│   │   │   └── page.tsx                       ✅ Créée
│   │   └── [id]/
│   │       ├── page.tsx                       ✅ Créée
│   │       ├── edit/
│   │       │   └── page.tsx                   ✅ Créée
│   │       └── password/
│   │           └── page.tsx                   ✅ Créée
│   ├── tickets/
│   │   └── page.tsx                           ✅ Créée
│   └── factures/
│       └── page.tsx                           ✅ Créée
└── occupant/
    ├── page.tsx                                ✅ Créée
    ├── simulateur/
    │   └── page.tsx                            ✅ Créée
    ├── myAccount/
    │   └── page.tsx                            ✅ Créée
    ├── alertes/
    │   └── page.tsx                            ✅ Créée
    ├── interventions/
    │   ├── page.tsx                            ✅ Créée
    │   └── [pkIntervention]/
    │       └── page.tsx                        ✅ Créée
    ├── fuites/
    │   └── page.tsx                            ✅ Créée
    ├── anomalies/
    │   └── page.tsx                            ✅ Créée
    └── dysfonctionnements/
        └── page.tsx                            ✅ Créée
```

---

## 📋 Mapping Routes Symfony → Next.js

| Route Symfony | Route Next.js | Fichier | Statut |
|---------------|---------------|---------|--------|
| `/` | `/` | `app/page.tsx` | ❌ |
| `/login` | `/login` | `app/(full-width-pages)/(auth)/login/page.tsx` | ✅ (à renommer) |
| `/login/{param}` | `/login/[param]` | `app/(full-width-pages)/(auth)/login/[param]/page.tsx` | ❌ |
| `/reset-password` | `/reset-password` | `app/(full-width-pages)/(auth)/reset-password/page.tsx` | ✅ |
| `/update-password` | `/update-password` | `app/(full-width-pages)/(auth)/update-password/page.tsx` | ✅ |
| `/parc` | `/dashboard` | `app/(admin)/dashboard/page.tsx` | ✅ |
| `/occupant` | `/occupant` | `app/occupant/page.tsx` | ✅ |
| `/immeuble` | `/immeuble` | `app/(admin)/immeuble/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}` | `/immeuble/[pkImmeuble]` | `app/(admin)/immeuble/[pkImmeuble]/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/logements` | `/immeuble/[pkImmeuble]/logements` | `app/(admin)/immeuble/[pkImmeuble]/logements/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/interventions` | `/immeuble/[pkImmeuble]/interventions` | `app/(admin)/immeuble/[pkImmeuble]/interventions/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/interventions/{pkIntervention}` | `/immeuble/[pkImmeuble]/interventions/[pkIntervention]` | `app/(admin)/immeuble/[pkImmeuble]/interventions/[pkIntervention]/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/fuites` | `/immeuble/[pkImmeuble]/fuites` | `app/(admin)/immeuble/[pkImmeuble]/fuites/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/anomalies` | `/immeuble/[pkImmeuble]/anomalies` | `app/(admin)/immeuble/[pkImmeuble]/anomalies/page.tsx` | ✅ |
| `/immeuble/{pkImmeuble}/dysfonctionnements` | `/immeuble/[pkImmeuble]/dysfonctionnements` | `app/(admin)/immeuble/[pkImmeuble]/dysfonctionnements/page.tsx` | ✅ |
| `/logement/{pkLogement}` | `/logement/[pkLogement]` | `app/(admin)/logement/[pkLogement]/page.tsx` | ✅ |
| `/logement/{pkLogement}/interventions` | `/logement/[pkLogement]/interventions` | `app/(admin)/logement/[pkLogement]/interventions/page.tsx` | ✅ |
| `/logement/{pkLogement}/interventions/{pkIntervention}` | `/logement/[pkLogement]/interventions/[pkIntervention]` | `app/(admin)/logement/[pkLogement]/interventions/[pkIntervention]/page.tsx` | ✅ |
| `/logement/{pkLogement}/fuites` | `/logement/[pkLogement]/fuites` | `app/(admin)/logement/[pkLogement]/fuites/page.tsx` | ✅ |
| `/logement/{pkLogement}/anomalies` | `/logement/[pkLogement]/anomalies` | `app/(admin)/logement/[pkLogement]/anomalies/page.tsx` | ✅ |
| `/logement/{pkLogement}/dysfonctionnements` | `/logement/[pkLogement]/dysfonctionnements` | `app/(admin)/logement/[pkLogement]/dysfonctionnements/page.tsx` | ✅ |
| `/logements/recherche` | `/logements/recherche` | `app/(admin)/logements/recherche/page.tsx` | ✅ |
| `/gestionParc` | `/gestionParc` | `app/(admin)/gestionParc/page.tsx` | ✅ |
| `/gestionParc/{pkImmeuble}` | `/gestionParc/[pkImmeuble]` | `app/(admin)/gestionParc/[pkImmeuble]/page.tsx` | ❌ |
| `/gestionParc/{pkLogement}/show` | `/gestionParc/[pkLogement]` | `app/(admin)/gestionParc/[pkLogement]/page.tsx` | ✅ |
| `/gestionParc/{pkLogement}/edit` | `/gestionParc/[pkLogement]/edit` | `app/(admin)/gestionParc/[pkLogement]/edit/page.tsx` | ✅ |
| `/gestionParc/{pkLogement}/declareOccupant` | `/gestionParc/[pkLogement]/declareOccupant` | `app/(admin)/gestionParc/[pkLogement]/declareOccupant/page.tsx` | ✅ |
| `/occupant/simulateur` | `/occupant/simulateur` | `app/occupant/simulateur/page.tsx` | ✅ |
| `/occupant/myAccount` | `/occupant/myAccount` | `app/occupant/myAccount/page.tsx` | ✅ |
| `/occupant/alertes` | `/occupant/alertes` | `app/occupant/alertes/page.tsx` | ✅ |
| `/occupant/interventions` | `/occupant/interventions` | `app/occupant/interventions/page.tsx` | ✅ |
| `/occupant/interventions/{pkIntervention}` | `/occupant/interventions/[pkIntervention]` | `app/occupant/interventions/[pkIntervention]/page.tsx` | ✅ |
| `/occupant/fuites` | `/occupant/fuites` | `app/occupant/fuites/page.tsx` | ✅ |
| `/occupant/anomalies` | `/occupant/anomalies` | `app/occupant/anomalies/page.tsx` | ✅ |
| `/occupant/dysfonctionnements` | `/occupant/dysfonctionnements` | `app/occupant/dysfonctionnements/page.tsx` | ✅ |
| `/gestionnaire` | `/gestionnaire` | `app/(admin)/gestionnaire/page.tsx` | ✅ |
| `/gestionnaire/nouveau` | `/gestionnaire/nouveau` | `app/(admin)/gestionnaire/nouveau/page.tsx` | ✅ |
| `/gestionnaire/statistiques` | `/gestionnaire/statistiques` | `app/(admin)/gestionnaire/statistiques/page.tsx` | ✅ |
| `/gestionnaire/{id}` | `/gestionnaire/[id]` | `app/(admin)/gestionnaire/[id]/page.tsx` | ✅ |
| `/gestionnaire/{id}/edit` | `/gestionnaire/[id]/edit` | `app/(admin)/gestionnaire/[id]/edit/page.tsx` | ✅ |
| `/gestionnaire/{id}/password` | `/gestionnaire/[id]/password` | `app/(admin)/gestionnaire/[id]/password/page.tsx` | ✅ |
| `/tickets` | `/tickets` | `app/(admin)/tickets/page.tsx` | ✅ |
| `/factures` | `/factures` | `app/(admin)/factures/page.tsx` | ✅ |
| `/recherche` | `/recherche` | `app/(full-width-pages)/recherche/page.tsx` | ✅ |
| `/legal-notices` | `/legal-notices` | `app/(full-width-pages)/legal-notices/page.tsx` | ✅ |
| `/personal-datas` | `/personal-datas` | `app/(full-width-pages)/personal-datas/page.tsx` | ✅ |
| `/cgu` | `/cgu` | `app/(full-width-pages)/cgu/page.tsx` | ✅ |

---

## ⚠️ Routes Spéciales (API/Downloads)

Ces routes ne nécessitent pas de pages React, elles sont gérées par l'API :

- `/parc/intervention` → Export PDF/Excel (API)
- `/immeuble/{pkImmeuble}/interventions-export` → Export (API)
- `/immeuble/{pkImmeuble}/fuites-export` → Export (API)
- `/immeuble/{pkImmeuble}/anomalies-export` → Export (API)
- `/immeuble/{pkImmeuble}/dysfonctionnements-export` → Export (API)
- `/logement/{pkLogement}/interventions/export` → Export (API)
- `/logement/{pkLogement}/fuites/export` → Export (API)
- `/logement/{pkLogement}/anomalies/export` → Export (API)
- `/logement/{pkLogement}/dysfonctionnements/export` → Export (API)
- `/occupant/interventions/export` → Export (API)
- `/occupant/fuites/export` → Export (API)
- `/occupant/anomalies/export` → Export (API)
- `/occupant/dysfonctionnements/export` → Export (API)
- `/factures/download/{pkFacture}` → Download PDF (API)
- `/depannage/{pkDepannage}` → Report PDF (API)
- `/guide/{file}` → Guide PDF (API)

---

## 📝 Notes Importantes

### 1. Gestion de la Locale

Les routes Symfony ont un préfixe `/{_locale}`, mais Next.js gère la locale via `next-intl` :
- Les routes Next.js n'incluent pas le préfixe locale
- La locale est gérée automatiquement par `next-intl`
- Exemple : `/fr/immeuble` → `/immeuble` (locale gérée par next-intl)

### 2. Routes Groupées (Route Groups)

Next.js utilise des route groups `(group-name)` pour organiser les routes sans affecter l'URL :
- `(full-width-pages)` : Pages pleine largeur (auth, legal, etc.)
- `(admin)` : Pages nécessitant authentification admin/gestionnaire

### 3. Routes Dynamiques

Les paramètres de route Symfony `{param}` deviennent `[param]` dans Next.js :
- `/immeuble/{pkImmeuble}` → `/immeuble/[pkImmeuble]`
- `/logement/{pkLogement}/interventions/{pkIntervention}` → `/logement/[pkLogement]/interventions/[pkIntervention]`

### 4. Routes avec Conditions

Certaines routes Symfony ont des conditions (`gestion: true`) :
- `/gestionParc` et `/immeuble` partagent la même logique mais avec un flag différent
- Dans Next.js, on peut utiliser des query params ou des layouts différents

### 5. Redirections

- `/` → Redirige vers `/signin`, `/dashboard` ou `/occupant` selon l'état d'authentification
- `/parc` → Alias de `/dashboard` (peut être géré par middleware)

---

## ✅ Checklist de Création

### Pages à Créer (3)

- [ ] `app/page.tsx` - Page d'accueil avec redirection
- [ ] `app/(full-width-pages)/(auth)/signin/[param]/page.tsx` - Connexion via paramètre
- [ ] `app/(admin)/gestionParc/[pkImmeuble]/page.tsx` - Logements Gestion Parc par Immeuble

### Pages Déjà Créées (~40)

Toutes les autres pages sont déjà créées ✅

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Liste complète - ~95% des pages créées

