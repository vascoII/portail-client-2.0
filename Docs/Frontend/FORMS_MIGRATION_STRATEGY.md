# 📋 Stratégie de Migration des Formulaires - Twig vers React

## 📊 Vue d'ensemble

Ce document présente une stratégie complète pour migrer tous les formulaires Twig/Symfony vers React avec React Hook Form et Zod.

### Statistiques

- **15+ formulaires identifiés** dans les templates Twig
- **4 types de formulaires Symfony** (`AccountType`, `PasswordType`, `ResetPasswordType`, `InterventionType`)
- **Technologies cibles** : React Hook Form + Zod + TypeScript
- **Hooks API disponibles** : Tous les hooks nécessaires sont déjà créés

### Tableau Récapitulatif

| # | Formulaire | Template | Priorité | Hook API | Statut | Temps Estimé |
|---|------------|----------|----------|----------|--------|--------------|
| 1 | Connexion (Login) | `Security/login.html.twig` | 🔴 | `useAuth().login()` | ✅ **Migré** | - |
| 2 | Réinitialisation MDP | `Security/reset-password.html.twig` | 🔴 | `useSecurity().resetPassword()` | ❌ À faire | 2-3h |
| 3 | Mise à jour MDP | `update-password.html.twig` | 🔴 | `useSecurity().updatePassword()` | ❌ À faire | 3-4h |
| 4 | Création Ticket | `Ticketing/create-ticket.html.twig` | 🔴 | `useLogements().createTicket()` | ❌ À faire | 4-5h |
| 5 | Création Opérateur | `Operator/create.html.twig` | 🟡 | `useOperators().createOperator()` | ❌ À faire | 3-4h |
| 6 | Édition Opérateur | `Operator/edit.html.twig` | 🟡 | `useOperators().updateOperator()` | ❌ À faire | 3-4h |
| 7 | MDP Opérateur | `Operator/editPassword.html.twig` | 🟡 | `useOperators().updatePassword()` | ❌ À faire | 2-3h |
| 8 | Déclaration Occupant | `Logement/newOccupant.html.twig` | 🟡 | `useLogements().updateOccupant()` | ❌ À faire | 3-4h |
| 9 | Édition Occupant | `Logement/edit.html.twig` | 🟡 | `useLogements().updateOccupant()` | ❌ À faire | 3-4h |
| 10 | Validation CGU | `Front/cgu_page.html.twig` | 🟡 | `useFront().acceptCGU()` | ❌ À faire | 2-3h |
| 11 | Filtrage Logements | `Logement/_list_logements.html.twig` | 🟡 | `useLogements().filterLogements()` | ❌ À faire | 2-3h |
| 12 | Filtrage Immeubles | `Immeuble/index.html.twig` | 🟡 | `useImmeubles().filterImmeubles()` | ❌ À faire | 2-3h |
| 13 | Recherche Unifiée | `Search/index.html.twig` | 🟡 | `useSearch().search()` | ❌ À faire | 2-3h |
| 14 | Paramètres Alerte | `Occupant/alertes.html.twig` | 🟢 | `useOccupant().updateAlertes()` | ❌ À faire | 2-3h |
| 15 | RGPD Consent | `Occupant/myAccount.html.twig` | 🟢 | À vérifier | ❌ À faire | 1-2h |
| 16 | Simulateur | `Occupant/simulateur.html.twig` | 🟢 | Aucun (client) | ❌ À faire | 6-8h |
| 17 | Filtrage Dates | `_panel_*.html.twig` | 🟢 | Aucun (client) | ❌ À faire | 2-3h |

**Total** : 1 migré ✅ | 16 à migrer ❌ | **46-64 heures** estimées

---

## 📝 Inventaire des Formulaires

### 🔐 1. Formulaires d'Authentification & Sécurité

#### 1.1. Formulaire de Connexion (Login)
- **Template** : `templates/Security/login.html.twig`, `templates/login/login.html.twig`
- **Type Symfony** : Aucun (formulaire HTML simple)
- **Champs** :
  - `_username` (text) - Email ou Login
  - `_password` (password) - Mot de passe
  - `_remember_me` (checkbox) - Optionnel (commenté)
- **Action** : `POST /api/security/login`
- **Hook API** : `useAuth().login()` ✅
- **Statut** : ✅ **Déjà migré** (`SignInForm.tsx`)

#### 1.2. Formulaire de Réinitialisation de Mot de Passe
- **Template** : `templates/Security/reset-password.html.twig`
- **Type Symfony** : `ResetPasswordType`
- **Champs** :
  - `email` (email) - Email pour réinitialisation
- **Action** : `POST /api/security/reset-password`
- **Hook API** : `useSecurity().resetPassword()` ✅
- **Page React** : `frontend/src/app/(full-width-pages)/(auth)/reset-password/page.tsx` (à compléter)
- **Priorité** : 🔴 **Haute**

#### 1.3. Formulaire de Mise à Jour de Mot de Passe
- **Template** : `templates/update-password.html.twig`, `templates/Occupant/updatePassword.html.twig`
- **Type Symfony** : `PasswordType`
- **Champs** :
  - `password.first` (password) - Nouveau mot de passe
  - `password.second` (password) - Confirmation
- **Validation** :
  - Minimum 8 caractères
  - Au moins une majuscule, une minuscule et un chiffre
  - Les deux champs doivent correspondre
- **Action** : `PUT /api/security/update-password`
- **Hook API** : `useSecurity().updatePassword()` ✅
- **Page React** : `frontend/src/app/(full-width-pages)/(auth)/update-password/page.tsx` (à compléter)
- **Priorité** : 🔴 **Haute**

---

### 👤 2. Formulaires de Gestion des Opérateurs (Gestionnaires)

#### 2.1. Formulaire de Création d'Opérateur
- **Template** : `templates/Operator/create.html.twig`
- **Type Symfony** : `AccountType`
- **Champs** :
  - `job` (text) - Fonction (requis)
  - `lastname` (text) - Nom (requis)
  - `firstname` (text) - Prénom (requis)
  - `phone` (text) - Téléphone (requis)
  - `email.first` (email) - Email (requis)
  - `email.second` (email) - Confirmation Email (requis)
- **Action** : `POST /api/operators`
- **Hook API** : `useOperators().createOperator()` ✅
- **Page React** : `frontend/src/app/(admin)/gestionnaire/nouveau/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

#### 2.2. Formulaire d'Édition d'Opérateur
- **Template** : `templates/Operator/edit.html.twig`
- **Type Symfony** : `AccountType`
- **Champs** : Identiques à la création
- **Action** : `PUT /api/operators/{id}`
- **Hook API** : `useOperators().updateOperator()` ✅
- **Page React** : `frontend/src/app/(admin)/gestionnaire/[id]/edit/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

#### 2.3. Formulaire de Changement de Mot de Passe d'Opérateur
- **Template** : `templates/Operator/editPassword.html.twig`
- **Type Symfony** : `PasswordType`
- **Champs** : Identiques au formulaire de mise à jour de mot de passe
- **Action** : `PUT /api/operators/{id}/password`
- **Hook API** : `useOperators().updatePassword()` ✅
- **Page React** : `frontend/src/app/(admin)/gestionnaire/[id]/password/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

---

### 🎫 3. Formulaires de Tickets d'Intervention

#### 3.1. Formulaire de Création de Ticket (Modal)
- **Template** : `templates/Ticketing/create-ticket.html.twig`, `templates/Ticketing/form-ticket-attachment.html.twig`
- **Type Symfony** : `InterventionType`
- **Champs** :
  - `pkLogement` (hidden) - ID du logement
  - `name` (text) - Nom (requis)
  - `email` (email) - Email (requis)
  - `phone` (text) - Téléphone fixe (optionnel)
  - `mobile` (text) - Téléphone mobile (optionnel)
  - `objet` (text) - Objet (requis)
  - `message` (textarea) - Message/Demande (requis)
  - `attachment` (file) - Pièce jointe (optionnel)
- **Validation** : Au moins un des deux champs téléphone doit être rempli
- **Action** : `POST /api/logements/{pkLogement}/tickets` ou `POST /api/logements/immeuble/{pkImmeuble}/tickets`
- **Hook API** : `useLogements().createTicket()` ✅
- **Composant React** : À créer (Modal/Form)
- **Priorité** : 🔴 **Haute**

---

### 🏠 4. Formulaires de Gestion des Occupants

#### 4.1. Formulaire de Déclaration d'Occupant (Gestion Parc)
- **Template** : `templates/Logement/newOccupant.html.twig`
- **Type Symfony** : Aucun (formulaire HTML avec soumission AJAX)
- **Champs** :
  - `nameOccupant` (text) - Nom de l'occupant (requis)
  - `email` (email) - Email
  - `phone` (tel) - Téléphone (requis, pattern: 10 chiffres)
  - `CodeLogeGestio` (text) - Numéro de logement unique
  - `numBail` (text) - Numéro de bail
  - `dateArrivee` (date) - Date d'arrivée
- **Action** : `PUT /api/logements/{pkLogement}/occupant` (JSON)
- **Hook API** : `useLogements().updateOccupant()` ✅
- **Page React** : `frontend/src/app/(admin)/gestionParc/[pkLogement]/declareOccupant/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

#### 4.2. Formulaire d'Édition d'Occupant (Gestion Parc)
- **Template** : `templates/Logement/edit.html.twig` (même structure que newOccupant)
- **Type Symfony** : Aucun (formulaire HTML avec soumission AJAX)
- **Champs** : Identiques à la déclaration
- **Action** : `PUT /api/logements/{pkLogement}/occupant` (JSON)
- **Hook API** : `useLogements().updateOccupant()` ✅
- **Page React** : `frontend/src/app/(admin)/gestionParc/[pkLogement]/edit/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

---

### 👥 5. Formulaires Occupant (Espace Occupant)

#### 5.1. Formulaire de Paramètres d'Alerte
- **Template** : `templates/Occupant/alertes.html.twig`
- **Type Symfony** : Aucun (formulaire HTML simple)
- **Champs** :
  - `SEUIL_CONSO_ACTIF` (checkbox) - Activer l'alerte
  - `SEUIL_CONSO_EMAIL` (email) - Email de réception
  - `SEUIL_CONSO_EF` (text) - Seuil d'alerte Eau Froide (m³)
  - `SEUIL_CONSO_EC` (text) - Seuil d'alerte Eau Chaude (m³)
- **Action** : `POST /api/occupant/alertes`
- **Hook API** : `useOccupant().updateAlertes()` ✅
- **Page React** : `frontend/src/app/occupant/alertes/page.tsx` (à compléter)
- **Priorité** : 🟢 **Basse**

#### 5.2. Formulaire RGPD (Mon Compte)
- **Template** : `templates/Occupant/myAccount.html.twig`
- **Type Symfony** : Aucun (formulaire HTML simple)
- **Champs** :
  - `rgpd_checkbox` (checkbox) - Autoriser l'accès aux données de consommation
- **Action** : `POST /api/occupant/my-account` (avec body vide ou checkbox)
- **Hook API** : À vérifier/créer si nécessaire
- **Page React** : `frontend/src/app/occupant/myAccount/page.tsx` (à compléter)
- **Priorité** : 🟢 **Basse**

#### 5.3. Formulaire Simulateur de Consommation
- **Template** : `templates/Occupant/simulateur.html.twig`
- **Type Symfony** : Aucun (formulaire complexe avec logique JavaScript)
- **Champs** :
  - `occupants` (number) - Nombre d'occupants
  - `dishwasher` (radio) - Lave-vaisselle (Oui/Non)
  - `dishwasherPerf` (select) - Performance (si Oui)
  - `dishwasherCycles` (number) - Cycles par semaine (si Oui)
  - `washingMachine` (radio) - Lave-linge (Oui/Non)
  - `washingMachinePerf` (select) - Performance (si Oui)
  - `washingMachineCycles` (number) - Cycles par semaine (si Oui)
  - ... (autres appareils)
- **Action** : Aucune (calcul côté client uniquement)
- **Hook API** : Aucun (logique frontend uniquement)
- **Page React** : `frontend/src/app/occupant/simulateur/page.tsx` (à compléter)
- **Priorité** : 🟢 **Basse**

---

### 📄 6. Formulaires Front/Général

#### 6.1. Formulaire de Validation CGU
- **Template** : `templates/Front/cgu_page.html.twig`
- **Type Symfony** : Aucun (formulaire HTML simple)
- **Champs** :
  - `_email` (email) - Email (requis)
  - `_email_confirm` (email) - Confirmation Email (requis)
  - `valid_cgu` (checkbox) - Accepter les CGU (requis)
- **Validation** :
  - Les deux emails doivent correspondre
  - La checkbox doit être cochée
- **Action** : `POST /api/cgu/accept`
- **Hook API** : `useFront().acceptCGU()` ✅
- **Page React** : `frontend/src/app/(full-width-pages)/cgu/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

---

### 🔍 7. Formulaires de Filtrage/Recherche

#### 7.1. Formulaire de Filtrage de Logements
- **Template** : `templates/Logement/_list_logements.html.twig`
- **Type Symfony** : Aucun (formulaire de filtrage)
- **Champs** :
  - `EnergieSelect` (select) - Type d'énergie
  - `fuites` (checkbox) - Filtrer par fuites
  - `anomalies` (checkbox) - Filtrer par anomalies
  - `dysfonctionnements` (checkbox) - Filtrer par dysfonctionnements
  - `depannages` (checkbox) - Filtrer par dépannages
  - `reference` (text) - Référence/Numéro
  - `location` (text) - Code postal/Ville
  - Filtres dynamiques (batiment, escalier, étage, etc.)
- **Action** : `GET /api/logements/filter` (query params)
- **Hook API** : `useLogements().filterLogements()` ✅
- **Composant React** : À créer (composant de filtrage réutilisable)
- **Priorité** : 🟡 **Moyenne**

#### 7.2. Formulaire de Filtrage d'Immeubles
- **Template** : `templates/Immeuble/index.html.twig`, `templates/Immeuble/_list_immeubles.html.twig`
- **Type Symfony** : Aucun (formulaire de filtrage)
- **Champs** : Similaires au filtrage de logements
- **Action** : `GET /api/immeubles/filtre` (query params)
- **Hook API** : `useImmeubles().filterImmeubles()` ✅
- **Composant React** : À créer (composant de filtrage réutilisable)
- **Priorité** : 🟡 **Moyenne**

#### 7.3. Formulaire de Recherche Unifiée
- **Template** : `templates/Search/index.html.twig`
- **Type Symfony** : Aucun (formulaire de recherche)
- **Champs** :
  - `type` (select/radio) - Type de recherche (immeuble/occupant)
  - `ref` (text) - Référence
  - `ref_numero` (text) - Numéro de référence
  - `nom` (text) - Nom
  - `tout` (text) - Recherche globale
  - `adresse` (text) - Adresse
- **Action** : `GET /api/search` (query params)
- **Hook API** : `useSearch().search()` ✅
- **Page React** : `frontend/src/app/(full-width-pages)/recherche/page.tsx` (à compléter)
- **Priorité** : 🟡 **Moyenne**

---

### 📊 8. Formulaires de Filtrage de Graphiques (Panels)

#### 8.1. Formulaire de Filtrage Température
- **Template** : `templates/Occupant/_panel_temp.html.twig`, `templates/Logement/_panel_temp.html.twig`
- **Type Symfony** : Aucun (formulaire de filtrage de dates)
- **Champs** :
  - `date_from-temp` (date) - Date de début
  - `date_to-temp` (date) - Date de fin
- **Action** : Filtrage côté client (pas d'API)
- **Hook API** : Aucun
- **Composant React** : À créer (composant de filtrage de dates)
- **Priorité** : 🟢 **Basse**

#### 8.2. Formulaires de Filtrage Autres Panels
- **Templates** : `_panel_eau.html.twig`, `_panel_repart.html.twig`, `_panel_cet.html.twig`, etc.
- **Type** : Similaires au filtrage température
- **Priorité** : 🟢 **Basse**

---

## 🎯 Stratégie de Migration par Étapes

### Phase 1 : Formulaires Critiques d'Authentification (Priorité 🔴)

**Objectif** : Permettre aux utilisateurs de se connecter, réinitialiser et mettre à jour leur mot de passe.

#### Étape 1.1 : Formulaire de Réinitialisation de Mot de Passe
- **Fichier** : `frontend/src/app/(full-width-pages)/(auth)/reset-password/page.tsx`
- **Composant** : `ResetPasswordForm.tsx`
- **Schéma Zod** :
  ```typescript
  const resetPasswordSchema = z.object({
    email: z.string().email("Email invalide"),
  });
  ```
- **Hook** : `useSecurity().resetPassword()`
- **Validation** : Email valide
- **Temps estimé** : 2-3 heures

#### Étape 1.2 : Formulaire de Mise à Jour de Mot de Passe
- **Fichier** : `frontend/src/app/(full-width-pages)/(auth)/update-password/page.tsx`
- **Composant** : `UpdatePasswordForm.tsx`
- **Schéma Zod** :
  ```typescript
  const updatePasswordSchema = z.object({
    password: z.object({
      first: z.string()
        .min(8, "Minimum 8 caractères")
        .regex(/[A-Z]/, "Au moins une majuscule")
        .regex(/[a-z]/, "Au moins une minuscule")
        .regex(/[0-9]/, "Au moins un chiffre"),
      second: z.string(),
    }).refine((data) => data.first === data.second, {
      message: "Les mots de passe ne correspondent pas",
      path: ["second"],
    }),
  });
  ```
- **Hook** : `useSecurity().updatePassword()`
- **Validation** : Règles de mot de passe + correspondance
- **Temps estimé** : 3-4 heures

---

### Phase 2 : Formulaires de Tickets (Priorité 🔴)

**Objectif** : Permettre la création de tickets d'intervention depuis les pages logement/immeuble.

#### Étape 2.1 : Composant Modal de Création de Ticket
- **Fichier** : `frontend/src/components/tickets/CreateTicketModal.tsx`
- **Schéma Zod** :
  ```typescript
  const createTicketSchema = z.object({
    pkLogement: z.string().or(z.number()),
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    objet: z.string().min(1, "Objet requis"),
    message: z.string().min(1, "Message requis"),
    attachment: z.instanceof(File).optional(),
  }).refine((data) => data.phone || data.mobile, {
    message: "Au moins un numéro de téléphone requis",
    path: ["phone"],
  });
  ```
- **Hook** : `useLogements().createTicket()`
- **Fonctionnalités** :
  - Modal avec overlay
  - Upload de fichier (optionnel)
  - Validation en temps réel
  - Gestion d'erreurs
  - Message de succès
- **Temps estimé** : 4-5 heures

---

### Phase 3 : Formulaires de Gestion des Opérateurs (Priorité 🟡)

**Objectif** : Permettre la création et l'édition d'opérateurs (gestionnaires).

#### Étape 3.1 : Formulaire de Création d'Opérateur
- **Fichier** : `frontend/src/app/(admin)/gestionnaire/nouveau/page.tsx`
- **Composant** : `CreateOperatorForm.tsx`
- **Schéma Zod** :
  ```typescript
  const createOperatorSchema = z.object({
    job: z.string().min(1, "Fonction requise"),
    lastname: z.string().min(1, "Nom requis"),
    firstname: z.string().min(1, "Prénom requis"),
    phone: z.string().min(1, "Téléphone requis"),
    email: z.object({
      first: z.string().email("Email invalide"),
      second: z.string().email("Email invalide"),
    }).refine((data) => data.first === data.second, {
      message: "Les emails ne correspondent pas",
      path: ["second"],
    }),
  });
  ```
- **Hook** : `useOperators().createOperator()`
- **Temps estimé** : 3-4 heures

#### Étape 3.2 : Formulaire d'Édition d'Opérateur
- **Fichier** : `frontend/src/app/(admin)/gestionnaire/[id]/edit/page.tsx`
- **Composant** : `EditOperatorForm.tsx`
- **Schéma Zod** : Identique à la création
- **Hook** : `useOperators().updateOperator()`
- **Temps estimé** : 3-4 heures

#### Étape 3.3 : Formulaire de Changement de Mot de Passe d'Opérateur
- **Fichier** : `frontend/src/app/(admin)/gestionnaire/[id]/password/page.tsx`
- **Composant** : `ChangeOperatorPasswordForm.tsx`
- **Schéma Zod** : Identique au formulaire de mise à jour de mot de passe
- **Hook** : `useOperators().updatePassword()`
- **Temps estimé** : 2-3 heures

---

### Phase 4 : Formulaires de Gestion des Occupants (Priorité 🟡)

**Objectif** : Permettre la déclaration et l'édition d'occupants dans le mode gestion parc.

#### Étape 4.1 : Formulaire de Déclaration d'Occupant
- **Fichier** : `frontend/src/app/(admin)/gestionParc/[pkLogement]/declareOccupant/page.tsx`
- **Composant** : `DeclareOccupantForm.tsx`
- **Schéma Zod** :
  ```typescript
  const declareOccupantSchema = z.object({
    nameOccupant: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().regex(/^[0-9]{10}$/, "10 chiffres requis"),
    CodeLogeGestio: z.string().optional(),
    numBail: z.string().optional(),
    dateArrivee: z.string().date().optional(),
  });
  ```
- **Hook** : `useLogements().updateOccupant()`
- **Temps estimé** : 3-4 heures

#### Étape 4.2 : Formulaire d'Édition d'Occupant
- **Fichier** : `frontend/src/app/(admin)/gestionParc/[pkLogement]/edit/page.tsx`
- **Composant** : `EditOccupantForm.tsx`
- **Schéma Zod** : Identique à la déclaration
- **Hook** : `useLogements().updateOccupant()`
- **Temps estimé** : 3-4 heures

---

### Phase 5 : Formulaires Front/Général (Priorité 🟡)

#### Étape 5.1 : Formulaire de Validation CGU
- **Fichier** : `frontend/src/app/(full-width-pages)/cgu/page.tsx`
- **Composant** : `CGUValidationForm.tsx`
- **Schéma Zod** :
  ```typescript
  const cguValidationSchema = z.object({
    email: z.string().email("Email invalide"),
    email_confirm: z.string().email("Email invalide"),
    valid_cgu: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les CGU",
    }),
  }).refine((data) => data.email === data.email_confirm, {
    message: "Les emails ne correspondent pas",
    path: ["email_confirm"],
  });
  ```
- **Hook** : `useFront().acceptCGU()`
- **Temps estimé** : 2-3 heures

---

### Phase 6 : Formulaires de Filtrage/Recherche (Priorité 🟡)

#### Étape 6.1 : Composant de Filtrage Réutilisable
- **Fichier** : `frontend/src/components/filters/FilterForm.tsx`
- **Fonctionnalités** :
  - Filtres génériques (select, checkbox, text)
  - Gestion d'état des filtres
  - Déclenchement de recherche
  - Reset des filtres
- **Temps estimé** : 4-5 heures

#### Étape 6.2 : Intégration dans les Pages
- **Pages** :
  - Liste des logements
  - Liste des immeubles
  - Recherche unifiée
- **Temps estimé** : 2-3 heures par page

---

### Phase 7 : Formulaires Occupant (Priorité 🟢)

#### Étape 7.1 : Formulaire de Paramètres d'Alerte
- **Fichier** : `frontend/src/app/occupant/alertes/page.tsx`
- **Composant** : `AlertsSettingsForm.tsx`
- **Schéma Zod** :
  ```typescript
  const alertsSchema = z.object({
    SEUIL_CONSO_ACTIF: z.boolean(),
    SEUIL_CONSO_EMAIL: z.string().email("Email invalide").optional(),
    SEUIL_CONSO_EF: z.string().optional(),
    SEUIL_CONSO_EC: z.string().optional(),
  });
  ```
- **Hook** : `useOccupant().updateAlertes()`
- **Temps estimé** : 2-3 heures

#### Étape 7.2 : Formulaire RGPD
- **Fichier** : `frontend/src/app/occupant/myAccount/page.tsx`
- **Composant** : `RGPDConsentForm.tsx`
- **Schéma Zod** :
  ```typescript
  const rgpdSchema = z.object({
    rgpd_checkbox: z.boolean(),
  });
  ```
- **Hook** : À vérifier/créer
- **Temps estimé** : 1-2 heures

#### Étape 7.3 : Formulaire Simulateur
- **Fichier** : `frontend/src/app/occupant/simulateur/page.tsx`
- **Composant** : `ConsumptionSimulatorForm.tsx`
- **Schéma Zod** : Complexe (nombreux champs conditionnels)
- **Fonctionnalités** :
  - Logique de calcul côté client
  - Affichage de graphiques
  - Gestion d'état complexe
- **Temps estimé** : 6-8 heures

---

### Phase 8 : Formulaires de Filtrage de Graphiques (Priorité 🟢)

#### Étape 8.1 : Composant de Filtrage de Dates
- **Fichier** : `frontend/src/components/charts/DateRangeFilter.tsx`
- **Fonctionnalités** :
  - Sélection de plage de dates
  - Intégration avec date-fns
  - Format français (DD/MM/YYYY)
- **Temps estimé** : 2-3 heures

#### Étape 8.2 : Intégration dans les Panels
- **Panels** : Température, Eau, Répartiteur, CET, etc.
- **Temps estimé** : 1-2 heures par panel

---

## 🛠️ Architecture Technique

### Stack Technologique

- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation des schémas
- **@hookform/resolvers** : Intégration Zod + React Hook Form
- **TypeScript** : Typage statique
- **React Query** : Gestion des appels API (déjà en place)
- **Tailwind CSS** : Styling (déjà en place)

### Structure des Composants

```
frontend/src/
├── components/
│   ├── forms/
│   │   ├── ResetPasswordForm.tsx
│   │   ├── UpdatePasswordForm.tsx
│   │   ├── CreateOperatorForm.tsx
│   │   ├── EditOperatorForm.tsx
│   │   ├── CreateTicketModal.tsx
│   │   ├── DeclareOccupantForm.tsx
│   │   ├── EditOccupantForm.tsx
│   │   ├── CGUValidationForm.tsx
│   │   ├── AlertsSettingsForm.tsx
│   │   ├── RGPDConsentForm.tsx
│   │   └── ConsumptionSimulatorForm.tsx
│   ├── filters/
│   │   ├── FilterForm.tsx
│   │   └── DateRangeFilter.tsx
│   └── tickets/
│       └── CreateTicketModal.tsx
├── lib/
│   ├── schemas/
│   │   ├── auth.schemas.ts
│   │   ├── operator.schemas.ts
│   │   ├── ticket.schemas.ts
│   │   ├── occupant.schemas.ts
│   │   └── cgu.schemas.ts
│   └── hooks/ (déjà créés ✅)
```

### Schémas Zod Centralisés

Créer un dossier `lib/schemas/` pour centraliser tous les schémas de validation :

```typescript
// lib/schemas/auth.schemas.ts
export const resetPasswordSchema = z.object({...});
export const updatePasswordSchema = z.object({...});

// lib/schemas/operator.schemas.ts
export const createOperatorSchema = z.object({...});
export const updateOperatorSchema = z.object({...});
```

---

## 📋 Checklist de Migration par Formulaire

### ✅ Formulaires Déjà Migrés

- [x] **Formulaire de Connexion** - `SignInForm.tsx` ✅

### 🔴 Priorité Haute (À faire en premier)

- [ ] **Formulaire de Réinitialisation de Mot de Passe**
  - [ ] Créer le schéma Zod
  - [ ] Créer le composant `ResetPasswordForm.tsx`
  - [ ] Intégrer dans la page
  - [ ] Tester avec l'API
  - [ ] Gérer les erreurs et messages de succès

- [ ] **Formulaire de Mise à Jour de Mot de Passe**
  - [ ] Créer le schéma Zod avec validation complexe
  - [ ] Créer le composant `UpdatePasswordForm.tsx`
  - [ ] Intégrer dans la page
  - [ ] Tester avec l'API
  - [ ] Gérer les erreurs et messages de succès

- [ ] **Modal de Création de Ticket**
  - [ ] Créer le schéma Zod
  - [ ] Créer le composant `CreateTicketModal.tsx`
  - [ ] Gérer l'upload de fichier
  - [ ] Intégrer dans les pages logement/immeuble
  - [ ] Tester avec l'API
  - [ ] Gérer les erreurs et messages de succès

### 🟡 Priorité Moyenne

- [ ] **Formulaire de Création d'Opérateur**
- [ ] **Formulaire d'Édition d'Opérateur**
- [ ] **Formulaire de Changement de Mot de Passe d'Opérateur**
- [ ] **Formulaire de Déclaration d'Occupant**
- [ ] **Formulaire d'Édition d'Occupant**
- [ ] **Formulaire de Validation CGU**
- [ ] **Composant de Filtrage Réutilisable**
- [ ] **Intégration Filtrage dans les Pages**

### 🟢 Priorité Basse

- [ ] **Formulaire de Paramètres d'Alerte**
- [ ] **Formulaire RGPD**
- [ ] **Formulaire Simulateur de Consommation**
- [ ] **Composant de Filtrage de Dates**
- [ ] **Intégration Filtrage dans les Panels**

---

## 🎨 Bonnes Pratiques

### 1. Structure d'un Composant de Formulaire

```typescript
// components/forms/ExampleForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useExampleHook } from "@/lib/hooks/useExample";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";

const exampleSchema = z.object({
  // ... schéma
});

type ExampleFormData = z.infer<typeof exampleSchema>;

export default function ExampleForm() {
  const { mutate, isPending, error } = useExampleHook();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
  });

  const onSubmit = async (data: ExampleFormData) => {
    try {
      await mutate(data);
      // Gérer le succès
    } catch (err) {
      // Erreur gérée par le hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Champs du formulaire */}
      {error && <Alert variant="error" message={error} />}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  );
}
```

### 2. Gestion des Erreurs

- Utiliser `Alert` pour les erreurs globales
- Utiliser `hint` et `error` props sur les `Input` pour les erreurs de champ
- Afficher les erreurs serveur de manière user-friendly

### 3. États de Chargement

- Désactiver le bouton submit pendant la soumission
- Afficher un indicateur de chargement
- Utiliser `isPending` des hooks React Query

### 4. Validation en Temps Réel

- React Hook Form valide par défaut à `onChange`
- Afficher les erreurs immédiatement après la première soumission
- Utiliser `mode: "onBlur"` pour une validation moins agressive si nécessaire

### 5. Gestion des Fichiers

- Utiliser `File` type dans Zod
- Utiliser `FormData` pour l'upload
- Valider la taille et le type de fichier côté client

---

## 📊 Estimation Totale

### Temps par Phase

- **Phase 1** (Authentification) : 5-7 heures
- **Phase 2** (Tickets) : 4-5 heures
- **Phase 3** (Opérateurs) : 8-11 heures
- **Phase 4** (Occupants) : 6-8 heures
- **Phase 5** (Front/Général) : 2-3 heures
- **Phase 6** (Filtrage/Recherche) : 8-11 heures
- **Phase 7** (Occupant) : 9-13 heures
- **Phase 8** (Filtrage Graphiques) : 4-6 heures

**Total estimé** : **46-64 heures** (~6-8 jours de travail)

---

## 🚀 Ordre d'Exécution Recommandé

### Sprint 1 : Authentification (1-2 jours)
1. Réinitialisation de mot de passe
2. Mise à jour de mot de passe

### Sprint 2 : Tickets (1 jour)
1. Modal de création de ticket

### Sprint 3 : Opérateurs (1-2 jours)
1. Création d'opérateur
2. Édition d'opérateur
3. Changement de mot de passe

### Sprint 4 : Occupants & CGU (1-2 jours)
1. Déclaration d'occupant
2. Édition d'occupant
3. Validation CGU

### Sprint 5 : Filtrage & Recherche (1-2 jours)
1. Composant de filtrage réutilisable
2. Intégration dans les pages

### Sprint 6 : Formulaires Occupant (1-2 jours)
1. Paramètres d'alerte
2. RGPD
3. Simulateur (si nécessaire)

---

## 📝 Notes Importantes

### 1. Validation des Mots de Passe

La validation du mot de passe doit respecter les règles Symfony :
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre

### 2. Gestion des Emails en Confirmation

Les formulaires avec confirmation d'email doivent :
- Valider que les deux emails correspondent
- Afficher une erreur sur le champ de confirmation

### 3. Upload de Fichiers

Pour les tickets avec pièces jointes :
- Valider le type de fichier (docx, xlsx, pdf, png, jpg, gif)
- Valider la taille (max 2 MB)
- Utiliser `FormData` pour l'envoi

### 4. Formulaires avec Champs Conditionnels

Le simulateur et certains formulaires ont des champs conditionnels :
- Utiliser `watch()` de React Hook Form pour surveiller les valeurs
- Afficher/masquer les champs conditionnels dynamiquement

### 5. Filtrage et Recherche

Les formulaires de filtrage ne soumettent pas de formulaire classique :
- Utiliser des états React pour gérer les filtres
- Déclencher les recherches via les hooks API
- Gérer l'URL avec les query params si nécessaire

---

## ✅ Critères de Succès

Un formulaire est considéré comme migré avec succès si :

1. ✅ **Fonctionnalité** : Toutes les fonctionnalités du formulaire Twig sont reproduites
2. ✅ **Validation** : Toutes les validations sont implémentées (client + serveur)
3. ✅ **UX** : L'expérience utilisateur est au moins équivalente (idéalement meilleure)
4. ✅ **Erreurs** : Gestion d'erreurs complète et user-friendly
5. ✅ **Tests** : Testé avec l'API réelle
6. ✅ **Accessibilité** : Labels, ARIA, navigation clavier
7. ✅ **Responsive** : Fonctionne sur mobile et desktop

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Stratégie complète - Prêt pour migration

