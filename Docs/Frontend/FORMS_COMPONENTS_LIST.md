# 📋 Liste des Composants de Formulaire à Créer

**Date** : 2025-01-XX  
**Structure** : `frontend/src/components/techem/{domain}/form/{component-name}.tsx`  
**Note** : Le domaine `search` n'utilise pas le sous-dossier `form/` car c'est un composant de recherche plutôt qu'un formulaire classique.

---

## 📊 Résumé

| Domaine | Nombre de Composants | Priorité Haute | Priorité Moyenne | Priorité Basse |
|---------|---------------------|----------------|------------------|----------------|
| **security** | 3 | 2 | 0 | 0 |
| **ticketing** | 1 | 1 | 0 | 0 |
| **operator** | 3 | 0 | 3 | 0 |
| **logement** | 3 | 0 | 2 | 0 |
| **front** | 1 | 0 | 1 | 0 |
| **immeuble** | 1 | 0 | 1 | 0 |
| **search** | 1 | 0 | 1 | 0 |
| **occupant** | 3 | 0 | 0 | 3 |
| **charts** | 1 | 0 | 0 | 1 |
| **TOTAL** | **17** | **3** | **8** | **4** |
| **STATUT** | **✅ 17/17 créés** | **✅ 3/3 créés** | **✅ 8/8 créés** | **✅ 4/4 créés** |

---

## 🔐 Domain: Security

### 1. Login
- **Template Source** : `templates/Security/login.html.twig`
- **Composant Cible** : `frontend/src/components/techem/security/form/login.tsx`
- **Hook API** : `useAuth().login()`
- **Priorité** : ✅ **Déjà migré**
- **Statut** : ✅ **Créé**

### 2. Reset Password
- **Template Source** : `templates/Security/reset-password.html.twig`
- **Composant Cible** : `frontend/src/components/techem/security/form/reset-password.tsx`
- **Hook API** : `useSecurity().resetPassword()`
- **Priorité** : 🔴 **Haute**
- **Statut** : ✅ **Créé**

### 3. Update Password
- **Template Source** : `templates/update-password.html.twig`, `templates/Occupant/updatePassword.html.twig`
- **Composant Cible** : `frontend/src/components/techem/security/form/update-password.tsx`
- **Hook API** : `useSecurity().updatePassword()`
- **Priorité** : 🔴 **Haute**
- **Statut** : ✅ **Créé**

---

## 🎫 Domain: Ticketing

### 4. Create Ticket (Modal)
- **Template Source** : `templates/Ticketing/create-ticket.html.twig`, `templates/Ticketing/form-ticket-attachment.html.twig`
- **Composant Cible** : `frontend/src/components/techem/ticketing/form/create-ticket.tsx`
- **Hook API** : `useLogements().createTicket()`
- **Priorité** : 🔴 **Haute**
- **Statut** : ✅ **Créé**
- **Note** : Composant Modal avec upload de fichier

---

## 👤 Domain: Operator

### 5. Create Operator
- **Template Source** : `templates/Operator/create.html.twig`
- **Composant Cible** : `frontend/src/components/techem/operator/form/create.tsx`
- **Hook API** : `useOperators().createOperator()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

### 6. Edit Operator
- **Template Source** : `templates/Operator/edit.html.twig`
- **Composant Cible** : `frontend/src/components/techem/operator/form/edit.tsx`
- **Hook API** : `useOperators().updateOperator()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

### 7. Edit Operator Password
- **Template Source** : `templates/Operator/editPassword.html.twig`
- **Composant Cible** : `frontend/src/components/techem/operator/form/edit-password.tsx`
- **Hook API** : `useOperators().updatePassword()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

---

## 🏠 Domain: Logement

### 8. New Occupant (Déclaration)
- **Template Source** : `templates/Logement/newOccupant.html.twig`
- **Composant Cible** : `frontend/src/components/techem/logement/form/new-occupant.tsx`
- **Hook API** : `useLogements().updateOccupant()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

### 9. Edit Occupant
- **Template Source** : `templates/Logement/edit.html.twig`
- **Composant Cible** : `frontend/src/components/techem/logement/form/edit-occupant.tsx`
- **Hook API** : `useLogements().updateOccupant()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

### 10. Filter Logements
- **Template Source** : `templates/Logement/_list_logements.html.twig`
- **Composant Cible** : `frontend/src/components/techem/logement/form/filter.tsx`
- **Hook API** : `useLogements().filterLogements()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**
- **Note** : Composant de filtrage (pas de soumission de formulaire classique)

---

## 📄 Domain: Front

### 11. CGU Validation
- **Template Source** : `templates/Front/cgu_page.html.twig`
- **Composant Cible** : `frontend/src/components/techem/front/form/cgu-validation.tsx`
- **Hook API** : `useFront().acceptCGU()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**

---

## 🏢 Domain: Immeuble

### 12. Filter Immeubles
- **Template Source** : `templates/Immeuble/index.html.twig`, `templates/Immeuble/_list_immeubles.html.twig`
- **Composant Cible** : `frontend/src/components/techem/immeuble/form/filter.tsx`
- **Hook API** : `useImmeubles().filterImmeubles()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**
- **Note** : Composant de filtrage (pas de soumission de formulaire classique)

---

## 🔍 Domain: Search

### 13. Search (Recherche Unifiée)
- **Template Source** : `templates/Search/index.html.twig`
- **Composant Cible** : `frontend/src/components/techem/search/search.tsx`
- **Hook API** : `useSearch().search()`
- **Priorité** : 🟡 **Moyenne**
- **Statut** : ✅ **Créé**
- **Note** : Composant de recherche (pas de soumission de formulaire classique)

---

## 👥 Domain: Occupant

### 14. Alerts Settings
- **Template Source** : `templates/Occupant/alertes.html.twig`
- **Composant Cible** : `frontend/src/components/techem/occupant/form/alerts.tsx`
- **Hook API** : `useOccupant().updateAlertes()`
- **Priorité** : 🟢 **Basse**
- **Statut** : ✅ **Créé**

### 15. RGPD Consent
- **Template Source** : `templates/Occupant/myAccount.html.twig`
- **Composant Cible** : `frontend/src/components/techem/occupant/form/rgpd-consent.tsx`
- **Hook API** : À vérifier/créer si nécessaire
- **Priorité** : 🟢 **Basse**
- **Statut** : ✅ **Créé**

### 16. Simulator (Simulateur de Consommation)
- **Template Source** : `templates/Occupant/simulateur.html.twig`
- **Composant Cible** : `frontend/src/components/techem/occupant/form/simulator.tsx`
- **Hook API** : Aucun (logique frontend uniquement)
- **Priorité** : 🟢 **Basse**
- **Statut** : ✅ **Créé**
- **Note** : Formulaire complexe avec logique de calcul côté client

---

## 📊 Domain: Charts

### 17. Date Range Filter
- **Template Source** : `templates/Occupant/_panel_temp.html.twig`, `templates/Logement/_panel_temp.html.twig`, `_panel_*.html.twig`
- **Composant Cible** : `frontend/src/components/techem/charts/form/date-range-filter.tsx`
- **Hook API** : Aucun (filtrage côté client)
- **Priorité** : 🟢 **Basse**
- **Statut** : ✅ **Créé**
- **Note** : Composant réutilisable pour tous les panels de graphiques

---

## 📁 Structure de Dossiers Complète

```
frontend/src/components/techem/
├── security/form/
│   ├── login.tsx                    ✅ Créé
│   ├── reset-password.tsx           ✅ Créé
│   └── update-password.tsx          ✅ Créé
├── ticketing/form/
│   └── create-ticket.tsx            ✅ Créé
├── operator/form/
│   ├── create.tsx                   ✅ Créé
│   ├── edit.tsx                     ✅ Créé
│   └── edit-password.tsx            ✅ Créé
├── logement/form/
│   ├── new-occupant.tsx             ✅ Créé
│   ├── edit-occupant.tsx            ✅ Créé
│   └── filter.tsx                   ✅ Créé
├── front/form/
│   └── cgu-validation.tsx           ✅ Créé
├── immeuble/form/
│   └── filter.tsx                   ✅ Créé
├── search/
│   └── search.tsx                   ✅ Créé
├── occupant/form/
│   ├── alerts.tsx                   ✅ Créé
│   ├── rgpd-consent.tsx             ✅ Créé
│   └── simulator.tsx                ✅ Créé
└── charts/form/
    └── date-range-filter.tsx        ✅ Créé
```

---

## 📋 Liste Complète par Priorité

### 🔴 Priorité Haute (3 composants)

| # | Composant | Chemin | Template Source |
|---|-----------|--------|-----------------|
| 1 | `reset-password.tsx` | `techem/security/form/reset-password.tsx` | `Security/reset-password.html.twig` |
| 2 | `update-password.tsx` | `techem/security/form/update-password.tsx` | `update-password.html.twig` |
| 3 | `create-ticket.tsx` | `techem/ticketing/form/create-ticket.tsx` | `Ticketing/create-ticket.html.twig` |

### 🟡 Priorité Moyenne (8 composants)

| # | Composant | Chemin | Template Source |
|---|-----------|--------|-----------------|
| 4 | `create.tsx` | `techem/operator/form/create.tsx` | `Operator/create.html.twig` |
| 5 | `edit.tsx` | `techem/operator/form/edit.tsx` | `Operator/edit.html.twig` |
| 6 | `edit-password.tsx` | `techem/operator/form/edit-password.tsx` | `Operator/editPassword.html.twig` |
| 7 | `new-occupant.tsx` | `techem/logement/form/new-occupant.tsx` | `Logement/newOccupant.html.twig` |
| 8 | `edit-occupant.tsx` | `techem/logement/form/edit-occupant.tsx` | `Logement/edit.html.twig` |
| 9 | `filter.tsx` | `techem/logement/form/filter.tsx` | `Logement/_list_logements.html.twig` |
| 10 | `cgu-validation.tsx` | `techem/front/form/cgu-validation.tsx` | `Front/cgu_page.html.twig` |
| 11 | `filter.tsx` | `techem/immeuble/form/filter.tsx` | `Immeuble/index.html.twig` |
| 12 | `search.tsx` | `techem/search/search.tsx` | `Search/index.html.twig` |

### 🟢 Priorité Basse (4 composants)

| # | Composant | Chemin | Template Source |
|---|-----------|--------|-----------------|
| 13 | `alerts.tsx` | `techem/occupant/form/alerts.tsx` | `Occupant/alertes.html.twig` |
| 14 | `rgpd-consent.tsx` | `techem/occupant/form/rgpd-consent.tsx` | `Occupant/myAccount.html.twig` |
| 15 | `simulator.tsx` | `techem/occupant/form/simulator.tsx` | `Occupant/simulateur.html.twig` |
| 16 | `date-range-filter.tsx` | `techem/charts/form/date-range-filter.tsx` | `_panel_*.html.twig` |

---

## 🎯 Ordre de Création Recommandé

### Phase 1 : Priorité Haute 🔴
1. `techem/security/form/reset-password.tsx`
2. `techem/security/form/update-password.tsx`
3. `techem/ticketing/form/create-ticket.tsx`

### Phase 2 : Priorité Moyenne 🟡
4. `techem/operator/form/create.tsx`
5. `techem/operator/form/edit.tsx`
6. `techem/operator/form/edit-password.tsx`
7. `techem/logement/form/new-occupant.tsx`
8. `techem/logement/form/edit-occupant.tsx`
9. `techem/front/form/cgu-validation.tsx`
10. `techem/logement/form/filter.tsx`
11. `techem/immeuble/form/filter.tsx`
12. `techem/search/search.tsx`

### Phase 3 : Priorité Basse 🟢
13. `techem/occupant/form/alerts.tsx`
14. `techem/occupant/form/rgpd-consent.tsx`
15. `techem/occupant/form/simulator.tsx`
16. `techem/charts/form/date-range-filter.tsx`

---

## 📝 Notes Importantes

### 1. Convention de Nommage
- **Format** : `kebab-case.tsx` (ex: `reset-password.tsx`, `create-ticket.tsx`)
- **Structure** : Un composant par fichier
- **Export** : Export par défaut du composant

### 2. Composants Spéciaux

#### Composants Modal
- `create-ticket.tsx` : Doit être un composant Modal réutilisable

#### Composants de Filtrage
- `logement/form/filter.tsx` : Pas de soumission de formulaire classique, utilise des états React
- `immeuble/form/filter.tsx` : Pas de soumission de formulaire classique, utilise des états React
- `search/search.tsx` : Pas de soumission de formulaire classique, utilise des états React (pas de sous-dossier `form/`)
- `charts/form/date-range-filter.tsx` : Composant réutilisable pour tous les panels

#### Composants Complexes
- `occupant/form/simulator.tsx` : Formulaire complexe avec logique de calcul côté client, nombreux champs conditionnels

### 3. Intégration avec les Pages

Les composants seront intégrés dans les pages React existantes :
- `security/form/reset-password.tsx` → `app/(full-width-pages)/(auth)/reset-password/page.tsx`
- `security/form/update-password.tsx` → `app/(full-width-pages)/(auth)/update-password/page.tsx`
- `ticketing/form/create-ticket.tsx` → Utilisé comme Modal dans les pages logement/immeuble
- `operator/form/create.tsx` → `app/(admin)/gestionnaire/nouveau/page.tsx`
- etc.

### 4. Schémas Zod

Chaque composant aura son schéma Zod correspondant dans `lib/schemas/` :
- `auth.schemas.ts` : resetPasswordSchema, updatePasswordSchema
- `operator.schemas.ts` : createOperatorSchema, updateOperatorSchema, changePasswordSchema
- `ticket.schemas.ts` : createTicketSchema
- `occupant.schemas.ts` : declareOccupantSchema, updateOccupantSchema, alertsSchema, rgpdSchema, simulatorSchema
- `cgu.schemas.ts` : cguValidationSchema
- `filter.schemas.ts` : filterLogementsSchema, filterImmeublesSchema, searchSchema

---

## ✅ Checklist de Création

Pour chaque composant, vérifier :
- [ ] Le fichier est créé au bon emplacement
- [ ] Le composant utilise React Hook Form (sauf pour les filtres)
- [ ] Le schéma Zod est créé et importé
- [ ] Le hook API est utilisé correctement
- [ ] La validation fonctionne (client + serveur)
- [ ] Les erreurs sont gérées et affichées
- [ ] Les états de chargement sont gérés
- [ ] Le composant est testé avec l'API réelle
- [ ] L'UX est au moins équivalente au formulaire Twig
- [ ] Le composant est responsive
- [ ] L'accessibilité est respectée

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : ✅ **TOUS LES COMPOSANTS ONT ÉTÉ CRÉÉS** - Migration complète terminée

