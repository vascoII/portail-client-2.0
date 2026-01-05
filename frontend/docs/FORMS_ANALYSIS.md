# 📊 Analyse des Formulaires - État Actuel vs Nécessaire

**Date d'analyse** : 2025-01-XX  
**Objectif** : Comparer les formulaires nécessaires selon la stratégie de migration avec les composants existants dans le frontend.

---

## 📋 Résumé Exécutif

### Statistiques Globales

| Catégorie | Nombre | Statut |
|-----------|--------|--------|
| **Formulaires nécessaires** | 17 | Selon FORMS_MIGRATION_STRATEGY.md |
| **Formulaires déjà migrés** | 1 | ✅ SignInForm |
| **Formulaires à migrer** | 16 | ❌ À faire |
| **Composants de base existants** | 10+ | ✅ Disponibles |
| **Composants à adapter pour RHF** | 7 | ⚠️ Nécessitent adaptation |

---

## 🎯 Formulaires Nécessaires (selon FORMS_MIGRATION_STRATEGY.md)

### ✅ Formulaires Déjà Migrés

| # | Formulaire | Composant | Statut | Notes |
|---|------------|-----------|--------|-------|
| 1 | **Connexion (Login)** | `SignInForm.tsx` | ✅ **Migré** | Utilise React Hook Form + Zod |

### 🔴 Priorité Haute - À Migrer

| # | Formulaire | Template Twig | Hook API | Composant à Créer | Statut |
|---|------------|---------------|----------|-------------------|--------|
| 2 | **Réinitialisation MDP** | `Security/reset-password.html.twig` | `useSecurity().resetPassword()` | `ResetPasswordForm.tsx` | ❌ À créer |
| 3 | **Mise à jour MDP** | `update-password.html.twig` | `useSecurity().updatePassword()` | `UpdatePasswordForm.tsx` | ❌ À créer |
| 4 | **Création Ticket** | `Ticketing/create-ticket.html.twig` | `useLogements().createTicket()` | `CreateTicketModal.tsx` | ❌ À créer |

### 🟡 Priorité Moyenne - À Migrer

| # | Formulaire | Template Twig | Hook API | Composant à Créer | Statut |
|---|------------|---------------|----------|-------------------|--------|
| 5 | **Création Opérateur** | `Operator/create.html.twig` | `useOperators().createOperator()` | `CreateOperatorForm.tsx` | ❌ À créer |
| 6 | **Édition Opérateur** | `Operator/edit.html.twig` | `useOperators().updateOperator()` | `EditOperatorForm.tsx` | ❌ À créer |
| 7 | **MDP Opérateur** | `Operator/editPassword.html.twig` | `useOperators().updatePassword()` | `ChangeOperatorPasswordForm.tsx` | ❌ À créer |
| 8 | **Déclaration Occupant** | `Logement/newOccupant.html.twig` | `useLogements().updateOccupant()` | `DeclareOccupantForm.tsx` | ❌ À créer |
| 9 | **Édition Occupant** | `Logement/edit.html.twig` | `useLogements().updateOccupant()` | `EditOccupantForm.tsx` | ❌ À créer |
| 10 | **Validation CGU** | `Front/cgu_page.html.twig` | `useFront().acceptCGU()` | `CGUValidationForm.tsx` | ❌ À créer |
| 11 | **Filtrage Logements** | `Logement/_list_logements.html.twig` | `useLogements().filterLogements()` | `FilterLogementsForm.tsx` | ❌ À créer |
| 12 | **Filtrage Immeubles** | `Immeuble/index.html.twig` | `useImmeubles().filterImmeubles()` | `FilterImmeublesForm.tsx` | ❌ À créer |
| 13 | **Recherche Unifiée** | `Search/index.html.twig` | `useSearch().search()` | `SearchForm.tsx` | ❌ À créer |

### 🟢 Priorité Basse - À Migrer

| # | Formulaire | Template Twig | Hook API | Composant à Créer | Statut |
|---|------------|---------------|----------|-------------------|--------|
| 14 | **Paramètres Alerte** | `Occupant/alertes.html.twig` | `useOccupant().updateAlertes()` | `AlertsSettingsForm.tsx` | ❌ À créer |
| 15 | **RGPD Consent** | `Occupant/myAccount.html.twig` | À vérifier | `RGPDConsentForm.tsx` | ❌ À créer |
| 16 | **Simulateur** | `Occupant/simulateur.html.twig` | Aucun (client) | `ConsumptionSimulatorForm.tsx` | ❌ À créer |
| 17 | **Filtrage Dates** | `_panel_*.html.twig` | Aucun (client) | `DateRangeFilter.tsx` | ❌ À créer |

---

## 🧩 Composants de Formulaire Existants

### ✅ Composants de Base Disponibles

#### 1. **InputField.tsx** ✅
- **Emplacement** : `frontend/src/components/form/input/InputField.tsx`
- **Fonctionnalités** :
  - Supporte tous les types d'input (text, email, password, date, etc.)
  - Gestion des états (error, success, disabled)
  - Support du hint text
  - **⚠️ Problème** : N'est pas encore compatible avec React Hook Form (pas de `{...register()}`)
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 2. **TextArea.tsx** ✅
- **Emplacement** : `frontend/src/components/form/input/TextArea.tsx`
- **Fonctionnalités** :
  - Gestion des états (error, disabled)
  - Support du hint text
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 3. **Checkbox.tsx** ✅
- **Emplacement** : `frontend/src/components/form/input/Checkbox.tsx`
- **Fonctionnalités** :
  - Gestion des états (checked, disabled)
  - Label intégré
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 4. **FileInput.tsx** ✅
- **Emplacement** : `frontend/src/components/form/input/FileInput.tsx`
- **Fonctionnalités** :
  - Upload de fichiers
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 5. **Select.tsx** ✅
- **Emplacement** : `frontend/src/components/form/Select.tsx`
- **Fonctionnalités** :
  - Gestion des options
  - Placeholder
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 6. **MultiSelect.tsx** ✅
- **Emplacement** : `frontend/src/components/form/MultiSelect.tsx`
- **Fonctionnalités** :
  - Sélection multiple
  - Gestion des tags sélectionnés
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 7. **DatePicker.tsx** ✅
- **Emplacement** : `frontend/src/components/form/date-picker.tsx`
- **Fonctionnalités** :
  - Utilise flatpickr
  - Support de différents modes (single, range, multiple)
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 8. **Switch.tsx** ✅
- **Emplacement** : `frontend/src/components/form/switch/Switch.tsx`
- **Fonctionnalités** :
  - Toggle switch
  - Gestion des états (checked, disabled)
  - **⚠️ Problème** : Utilise `onChange` callback au lieu de `{...register()}`
- **Compatibilité RHF** : ⚠️ **Nécessite adaptation** pour accepter `{...register()}`

#### 9. **Label.tsx** ✅
- **Emplacement** : `frontend/src/components/form/Label.tsx`
- **Fonctionnalités** :
  - Label stylisé
  - Support de `htmlFor`
  - **✅ Compatible** : Aucune adaptation nécessaire

#### 10. **Form.tsx** ⚠️
- **Emplacement** : `frontend/src/components/form/Form.tsx`
- **Fonctionnalités** :
  - Wrapper de formulaire basique
  - **⚠️ Problème** : N'utilise pas React Hook Form
- **Compatibilité RHF** : ⚠️ **Non utilisé** - Les formulaires utilisent directement `<form>` avec `handleSubmit()`

#### 11. **PhoneInput.tsx** ✅
- **Emplacement** : `frontend/src/components/form/group-input/PhoneInput.tsx`
- **Fonctionnalités** : (À vérifier)
- **Compatibilité RHF** : ⚠️ **À vérifier**

---

## 🔍 Analyse de Compatibilité React Hook Form

### Composants Compatibles (Utilisés dans SignInForm)

| Composant | Utilisation dans SignInForm | Notes |
|-----------|----------------------------|-------|
| `InputField` | ✅ Utilisé avec `{...register()}` | Fonctionne mais nécessite vérification |
| `Label` | ✅ Utilisé normalement | Compatible |
| `Checkbox` | ⚠️ Utilisé avec `onChange` manuel | Non compatible avec `{...register()}` |

### Composants Nécessitant Adaptation

| Composant | Problème Actuel | Solution Requise |
|-----------|-----------------|------------------|
| `TextArea` | Utilise `onChange` callback | Adapter pour accepter `{...register()}` |
| `Checkbox` | Utilise `onChange` callback | Adapter pour accepter `{...register()}` ou utiliser `Controller` |
| `FileInput` | Utilise `onChange` callback | Adapter pour accepter `{...register()}` ou utiliser `Controller` |
| `Select` | Utilise `onChange` callback | Adapter pour accepter `{...register()}` |
| `MultiSelect` | Utilise `onChange` callback | Utiliser `Controller` de RHF |
| `DatePicker` | Utilise `onChange` callback | Utiliser `Controller` de RHF |
| `Switch` | Utilise `onChange` callback | Utiliser `Controller` de RHF |

---

## 📦 Schémas Zod Nécessaires

### Schémas à Créer dans `lib/schemas/`

| Fichier | Schémas | Formulaires Associés |
|---------|---------|---------------------|
| `auth.schemas.ts` | `resetPasswordSchema`, `updatePasswordSchema` | Réinitialisation MDP, Mise à jour MDP |
| `operator.schemas.ts` | `createOperatorSchema`, `updateOperatorSchema`, `changePasswordSchema` | Création/Édition Opérateur, MDP Opérateur |
| `ticket.schemas.ts` | `createTicketSchema` | Création Ticket |
| `occupant.schemas.ts` | `declareOccupantSchema`, `updateOccupantSchema` | Déclaration/Édition Occupant |
| `cgu.schemas.ts` | `cguValidationSchema` | Validation CGU |
| `filter.schemas.ts` | `filterLogementsSchema`, `filterImmeublesSchema`, `searchSchema` | Filtrage/Recherche |
| `alert.schemas.ts` | `alertsSchema` | Paramètres Alerte |
| `rgpd.schemas.ts` | `rgpdSchema` | RGPD Consent |
| `simulator.schemas.ts` | `simulatorSchema` | Simulateur |

---

## 🎨 Composants UI Nécessaires

### Composants UI Existants (Vérifiés)

| Composant | Emplacement | Utilisation |
|-----------|-------------|-------------|
| `Button` | `components/ui/button/Button` | ✅ Utilisé dans SignInForm |
| `Alert` | `components/ui/alert/Alert` | ✅ Utilisé dans SignInForm |
| `Modal` | `components/ui/modal` | ✅ Disponible (utilisé dans FormInModal.tsx) |

### Composants UI à Vérifier/Créer

| Composant | Besoin | Priorité |
|-----------|--------|----------|
| `Modal` pour CreateTicketModal | ✅ Existe | - |
| `DateRangePicker` | ⚠️ À créer ou adapter DatePicker | Moyenne |
| `FileUpload` avec preview | ⚠️ À créer | Haute (pour tickets) |

---

## 📝 Plan d'Action Recommandé

### Phase 0 : Préparation (Avant Migration)

#### Étape 0.1 : Adapter les Composants de Base pour RHF
- [ ] Adapter `TextArea.tsx` pour accepter `{...register()}`
- [ ] Adapter `Checkbox.tsx` pour accepter `{...register()}` ou documenter l'utilisation de `Controller`
- [ ] Adapter `FileInput.tsx` pour accepter `{...register()}` ou documenter l'utilisation de `Controller`
- [ ] Adapter `Select.tsx` pour accepter `{...register()}`
- [ ] Documenter l'utilisation de `Controller` pour `MultiSelect`, `DatePicker`, `Switch`

#### Étape 0.2 : Créer les Schémas Zod
- [ ] Créer `lib/schemas/auth.schemas.ts`
- [ ] Créer `lib/schemas/operator.schemas.ts`
- [ ] Créer `lib/schemas/ticket.schemas.ts`
- [ ] Créer `lib/schemas/occupant.schemas.ts`
- [ ] Créer `lib/schemas/cgu.schemas.ts`
- [ ] Créer `lib/schemas/filter.schemas.ts`
- [ ] Créer `lib/schemas/alert.schemas.ts`
- [ ] Créer `lib/schemas/rgpd.schemas.ts`
- [ ] Créer `lib/schemas/simulator.schemas.ts`

#### Étape 0.3 : Créer les Composants UI Manquants
- [ ] Créer `DateRangeFilter.tsx` (ou adapter DatePicker)
- [ ] Créer `FileUpload.tsx` avec preview (pour tickets)

### Phase 1 : Migration Priorité Haute 🔴

1. **ResetPasswordForm.tsx**
   - Schéma : `resetPasswordSchema` (auth.schemas.ts)
   - Composants : InputField, Label, Button, Alert
   - Hook : `useSecurity().resetPassword()`

2. **UpdatePasswordForm.tsx**
   - Schéma : `updatePasswordSchema` (auth.schemas.ts)
   - Composants : InputField (password x2), Label, Button, Alert
   - Hook : `useSecurity().updatePassword()`

3. **CreateTicketModal.tsx**
   - Schéma : `createTicketSchema` (ticket.schemas.ts)
   - Composants : InputField, TextArea, FileInput, Label, Button, Alert, Modal
   - Hook : `useLogements().createTicket()`

### Phase 2 : Migration Priorité Moyenne 🟡

4. **CreateOperatorForm.tsx**
5. **EditOperatorForm.tsx**
6. **ChangeOperatorPasswordForm.tsx**
7. **DeclareOccupantForm.tsx**
8. **EditOccupantForm.tsx**
9. **CGUValidationForm.tsx**
10. **FilterLogementsForm.tsx**
11. **FilterImmeublesForm.tsx**
12. **SearchForm.tsx**

### Phase 3 : Migration Priorité Basse 🟢

13. **AlertsSettingsForm.tsx**
14. **RGPDConsentForm.tsx**
15. **ConsumptionSimulatorForm.tsx**
16. **DateRangeFilter.tsx**

---

## ⚠️ Points d'Attention

### 1. Compatibilité React Hook Form

**Problème** : La plupart des composants utilisent des callbacks `onChange` au lieu de supporter `{...register()}` de React Hook Form.

**Solutions** :
- **Option A** : Adapter chaque composant pour accepter `{...register()}`
- **Option B** : Utiliser `Controller` de React Hook Form pour les composants complexes
- **Option C** : Créer des wrappers RHF pour chaque composant

**Recommandation** : **Option B** pour les composants complexes (DatePicker, MultiSelect, Switch), **Option A** pour les composants simples (TextArea, Select).

### 2. Gestion des Fichiers

**Problème** : `FileInput.tsx` actuel ne gère pas la preview ni la validation de type/taille.

**Solution** : Créer un composant `FileUpload.tsx` plus complet avec :
- Preview d'image
- Validation de type (docx, xlsx, pdf, png, jpg, gif)
- Validation de taille (max 2 MB)
- Intégration avec React Hook Form via `Controller`

### 3. Validation des Mots de Passe

**Règles Symfony** :
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre

**Implémentation Zod** :
```typescript
z.string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre")
```

### 4. Formulaires avec Champs Conditionnels

**Formulaires concernés** :
- Simulateur (champs conditionnels selon les appareils)
- Filtrage (champs conditionnels selon les sélections)

**Solution** : Utiliser `watch()` de React Hook Form pour surveiller les valeurs et afficher/masquer les champs dynamiquement.

### 5. Formulaires de Filtrage

**Problème** : Les formulaires de filtrage ne soumettent pas de formulaire classique, ils déclenchent des recherches via les hooks API.

**Solution** : Utiliser des états React pour gérer les filtres et déclencher les recherches via les hooks API. Pas besoin de React Hook Form pour ces cas.

---

## ✅ Checklist de Vérification

### Avant de Commencer la Migration

- [ ] Tous les hooks API sont créés et testés
- [ ] Les composants de base sont adaptés pour RHF
- [ ] Les schémas Zod sont créés
- [ ] Les composants UI manquants sont créés
- [ ] La documentation d'utilisation est créée

### Pour Chaque Formulaire Migré

- [ ] Le schéma Zod est créé et testé
- [ ] Le composant utilise React Hook Form
- [ ] La validation fonctionne (client + serveur)
- [ ] Les erreurs sont gérées et affichées
- [ ] Les états de chargement sont gérés
- [ ] Le formulaire est testé avec l'API réelle
- [ ] L'UX est au moins équivalente au formulaire Twig
- [ ] Le formulaire est responsive
- [ ] L'accessibilité est respectée (labels, ARIA)

---

## 📊 Estimation des Efforts

### Phase 0 : Préparation
- Adaptation des composants : **4-6 heures**
- Création des schémas Zod : **3-4 heures**
- Création des composants UI manquants : **2-3 heures**
- **Total Phase 0** : **9-13 heures**

### Phase 1 : Priorité Haute (3 formulaires)
- ResetPasswordForm : **2-3 heures**
- UpdatePasswordForm : **3-4 heures**
- CreateTicketModal : **4-5 heures**
- **Total Phase 1** : **9-12 heures**

### Phase 2 : Priorité Moyenne (9 formulaires)
- **Total Phase 2** : **24-33 heures**

### Phase 3 : Priorité Basse (4 formulaires)
- **Total Phase 3** : **11-16 heures**

**Total Estimé** : **53-74 heures** (~7-9 jours de travail)

---

## 🚀 Prochaines Étapes

1. **Révision de cette analyse** par l'équipe
2. **Validation du plan d'action**
3. **GO pour la Phase 0** (Préparation)
4. **Migration progressive** par phase

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Analyse complète - En attente de validation et GO

