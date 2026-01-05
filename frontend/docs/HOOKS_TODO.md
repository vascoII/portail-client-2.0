# 📋 Todo Liste - Création des Hooks React par Contrôleur API

## 🎯 Objectif

Créer un hook React personnalisé par contrôleur API et implémenter tous les appels pour chaque endpoint de l'API.

---

## 📊 Vue d'ensemble

**Total de contrôleurs** : 12 contrôleurs  
**Total d'endpoints estimés** : ~80+ endpoints  
**Structure** : 1 hook par contrôleur dans `src/lib/hooks/use*.ts`

---

## ✅ Étape 1 : Hook Security (useSecurity.ts)

**Fichier** : `src/lib/hooks/useSecurity.ts`  
**Base URL** : `/api/security`

### Endpoints à implémenter :

- [ ] `login(credentials)` - POST `/api/security/login`
  - Paramètres : `{ username: string, password: string }`
  - Retourne : `LoginResponse`
  - Mutation React Query

- [ ] `loginFromParam(param)` - GET `/api/security/login/{param}`
  - Paramètres : `param: string`
  - Retourne : `LoginResponse`
  - Mutation React Query

- [ ] `logout()` - POST `/api/security/logout`
  - Retourne : `void`
  - Mutation React Query

- [ ] `resetPassword(email)` - POST `/api/security/reset-password`
  - Paramètres : `{ email: string }`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `updatePassword(password)` - PUT `/api/security/update-password`
  - Paramètres : `{ password: string | { first: string, second: string } }`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `getMe()` - GET `/api/security/me`
  - Retourne : `{ user: User, roles: UserRole[] }`
  - Query React Query

- [ ] `checkAuth()` - GET `/api/security/check`
  - Retourne : `AuthCheckResponse`
  - Query React Query

**Note** : Le hook `useAuth` existe déjà et utilise certains de ces endpoints. À adapter ou fusionner.

---

## ✅ Étape 2 : Hook Front (useFront.ts)

**Fichier** : `src/lib/hooks/useFront.ts`  
**Base URL** : `/api`

### Endpoints à implémenter :

- [ ] `getMe()` - GET `/api/me`
  - Retourne : `UserInfo`
  - Query React Query

- [ ] `getLegalNotices()` - GET `/api/legal-notices`
  - Retourne : `{ legalNotices: LegalNotices }`
  - Query React Query

- [ ] `getPersonalDatas()` - GET `/api/personal-datas`
  - Retourne : `PersonalDataResponse`
  - Query React Query

- [ ] `getCGUStatus()` - GET `/api/cgu/status`
  - Retourne : `CGUStatusResponse`
  - Query React Query

- [ ] `acceptCGU(data)` - POST `/api/cgu/accept`
  - Paramètres : `CGUValidationRequest`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `getDashboard()` - GET `/api/dashboard`
  - Retourne : `DashboardResponse`
  - Query React Query

---

## ✅ Étape 3 : Hook Dashboard (useDashboard.ts)

**Fichier** : `src/lib/hooks/useDashboard.ts`  
**Base URL** : `/api/dashboard`

### Endpoints à implémenter :

- [ ] `getDashboard()` - GET `/api/dashboard`
  - Retourne : `DashboardResponse`
  - Query React Query

- [ ] `getInterventionReport(params)` - GET `/api/dashboard/intervention`
  - Paramètres : `{ docType: string, dateBegin: string, dateEnd: string }`
  - Retourne : `Blob` (PDF ou Excel)
  - Query React Query avec `responseType: 'blob'`

---

## ✅ Étape 4 : Hook Immeubles (useImmeubles.ts)

**Fichier** : `src/lib/hooks/useImmeubles.ts`  
**Base URL** : `/api/immeubles`

### Endpoints à implémenter :

- [ ] `getImmeubles()` - GET `/api/immeubles`
  - Retourne : `BuildingListResponse`
  - Query React Query

- [ ] `filterImmeubles(params)` - GET/POST `/api/immeubles/filtre`
  - Paramètres : `FilterParams`
  - Retourne : `BuildingListResponse`
  - Query/Mutation React Query

- [ ] `getImmeuble(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `BuildingDetailsResponse`
  - Query React Query

- [ ] `getIntervention(pkImmeuble, pkIntervention)` - GET `/api/immeubles/{pkImmeuble}/interventions/{pkIntervention}`
  - Paramètres : `{ pkImmeuble: string | number, pkIntervention: string | number }`
  - Retourne : `{ immeuble: Building, depannage: InterventionDetails }`
  - Query React Query

- [ ] `getInterventions(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/interventions`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `{ immeuble: Building, depannages: Intervention[], filters: FilterValues }`
  - Query React Query

- [ ] `getFuites(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/fuites`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `LeakListResponse`
  - Query React Query

- [ ] `getAnomalies(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/anomalies`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `AnomalyListResponse`
  - Query React Query

- [ ] `getDysfonctionnements(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/dysfonctionnements`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `DysfunctionListResponse`
  - Query React Query

- [ ] `getReport(pkImmeuble, type, energie, date?)` - GET/POST `/api/immeubles/{pkImmeuble}/releve/{type}/{energie}`
  - Paramètres : `{ pkImmeuble: string | number, type: string, energie: string, date?: string }`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportAnomalies(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/anomalies/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportFuites(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/fuites/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportInterventions(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/interventions/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportDysfonctionnements(pkImmeuble)` - GET `/api/immeubles/{pkImmeuble}/dysfonctionnements/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getInterventionReport(pkImmeuble, params)` - GET `/api/immeubles/{pkImmeuble}/intervention`
  - Paramètres : `{ pkImmeuble: string | number, docType: string, dateBegin: string, dateEnd: string }`
  - Retourne : `Blob` (PDF ou Excel)
  - Query React Query avec `responseType: 'blob'`

---

## ✅ Étape 5 : Hook Logements (useLogements.ts)

**Fichier** : `src/lib/hooks/useLogements.ts`  
**Base URL** : `/api/logements`

### Endpoints à implémenter :

- [ ] `getLogementsByImmeuble(pkImmeuble)` - GET `/api/logements/immeuble/{pkImmeuble}`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `{ immeuble: Building }`
  - Query React Query

- [ ] `createTicket(pkLogement, data)` - POST `/api/logements/{pkLogement}/tickets`
  - Paramètres : `{ pkLogement: string | number, data: CreateTicketRequest }`
  - Retourne : `CreateTicketResponse`
  - Mutation React Query

- [ ] `getTicketOwner(pkLogement)` - GET/POST `/api/logements/{pkLogement}/ticket-owner`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `TicketOwner`
  - Query React Query

- [ ] `searchLogements()` - GET `/api/logements/search`
  - Retourne : `DashboardData`
  - Query React Query

- [ ] `getInfosAppareils(pkLogement, type)` - GET `/api/logements/{pkLogement}/appareils/{type}`
  - Paramètres : `{ pkLogement: string | number, type: 'eau' | 'chauffage' }`
  - Retourne : `{ pkLogement: string, type: string, appareils: AppareilInfo[] }`
  - Query React Query

- [ ] `getLogement(pkLogement)` - GET `/api/logements/{pkLogement}`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `HousingDetailsResponse`
  - Query React Query

- [ ] `updateOccupant(pkLogement, data)` - PUT/PATCH `/api/logements/{pkLogement}/occupant`
  - Paramètres : `{ pkLogement: string | number, data: OccupantData }`
  - Retourne : `{ success: boolean }`
  - Mutation React Query

- [ ] `getRepartReleve(pkLogement)` - GET/POST `/api/logements/{pkLogement}/releve-repart`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getIntervention(pkLogement, pkIntervention)` - GET `/api/logements/{pkLogement}/interventions/{pkIntervention}`
  - Paramètres : `{ pkLogement: string | number, pkIntervention: string | number }`
  - Retourne : `{ logement: Housing, depannage: InterventionDetails }`
  - Query React Query

- [ ] `getInterventions(pkLogement)` - GET `/api/logements/{pkLogement}/interventions`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `{ logement: Housing, depannages: Intervention[], filters: FilterValues }`
  - Query React Query

- [ ] `filterLogements(params)` - GET/POST `/api/logements/filter`
  - Paramètres : `FilterParams & { pkImmeuble?: number, gestion?: boolean }`
  - Retourne : `{ logements: Housing[], filters: FilterValues, immeuble?: Building, board?: DashboardData }`
  - Query/Mutation React Query

- [ ] `getFuites(pkLogement, appareil?)` - GET `/api/logements/{pkLogement}/fuites`
  - Paramètres : `{ pkLogement: string | number, appareil?: string }`
  - Retourne : `LeakListResponse`
  - Query React Query

- [ ] `getDysfonctionnements(pkLogement)` - GET `/api/logements/{pkLogement}/dysfonctionnements`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `DysfunctionListResponse`
  - Query React Query

- [ ] `getAnomalies(pkLogement, appareil?)` - GET `/api/logements/{pkLogement}/anomalies`
  - Paramètres : `{ pkLogement: string | number, appareil?: string }`
  - Retourne : `AnomalyListResponse`
  - Query React Query

- [ ] `exportLogements(pkImmeuble)` - GET `/api/logements/immeuble/{pkImmeuble}/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportAnomalies(pkLogement)` - GET `/api/logements/{pkLogement}/anomalies/export`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportFuites(pkLogement)` - GET `/api/logements/{pkLogement}/fuites/export`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportInterventions(pkLogement)` - GET `/api/logements/{pkLogement}/interventions/export`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportDysfonctionnements(pkLogement)` - GET `/api/logements/{pkLogement}/dysfonctionnements/export`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getGuide()` - GET `/api/logements/guide`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `createTicketFromImmeuble(pkImmeuble, data)` - POST `/api/logements/immeuble/{pkImmeuble}/tickets`
  - Paramètres : `{ pkImmeuble: string | number, data: CreateTicketRequest }`
  - Retourne : `CreateTicketResponse`
  - Mutation React Query

---

## ✅ Étape 6 : Hook Occupant (useOccupant.ts)

**Fichier** : `src/lib/hooks/useOccupant.ts`  
**Base URL** : `/api/occupant`

### Endpoints à implémenter :

- [ ] `getOccupant()` - GET `/api/occupant`
  - Retourne : `{ logement: Housing, consoTabs: ConsumptionTab[], soustraitants: Subcontractor[] }`
  - Query React Query

- [ ] `getSimulateur()` - GET `/api/occupant/simulateur`
  - Retourne : `{ logement: Housing, consoTabs: ConsumptionTab[] }`
  - Query React Query

- [ ] `getIntervention(pkIntervention)` - GET `/api/occupant/interventions/{pkIntervention}`
  - Paramètres : `pkIntervention: string | number`
  - Retourne : `{ logement: Housing, depannage: InterventionDetails }`
  - Query React Query

- [ ] `getInterventions()` - GET `/api/occupant/interventions`
  - Retourne : `{ logement: Housing, depannages: Intervention[], filters: FilterValues }`
  - Query React Query

- [ ] `getFuites(appareil?)` - GET `/api/occupant/fuites`
  - Paramètres : `{ appareil?: string }`
  - Retourne : `LeakListResponse`
  - Query React Query

- [ ] `getDysfonctionnements()` - GET `/api/occupant/dysfonctionnements`
  - Retourne : `DysfunctionListResponse`
  - Query React Query

- [ ] `getAnomalies(appareil?)` - GET `/api/occupant/anomalies`
  - Paramètres : `{ appareil?: string }`
  - Retourne : `AnomalyListResponse`
  - Query React Query

- [ ] `exportAnomalies()` - GET `/api/occupant/anomalies/export`
  - Retourne : `Blob` (CSV)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportFuites()` - GET `/api/occupant/fuites/export`
  - Retourne : `Blob` (CSV)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportInterventions()` - GET `/api/occupant/interventions/export`
  - Retourne : `Blob` (CSV)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportDysfonctionnements()` - GET `/api/occupant/dysfonctionnements/export`
  - Retourne : `Blob` (CSV)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getEauReleve(pkOccupant)` - GET `/api/occupant/{pkOccupant}/releve-eau`
  - Paramètres : `pkOccupant: string | number`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getRepartReleve(pkOccupant, pkImmeuble)` - GET `/api/occupant/{pkOccupant}/releve-repart/{pkImmeuble}`
  - Paramètres : `{ pkOccupant: string | number, pkImmeuble: string | number }`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getNoteReleve(pkOccupant, pkImmeuble, energie)` - GET `/api/occupant/{pkOccupant}/releve-note/{pkImmeuble}/{energie}`
  - Paramètres : `{ pkOccupant: string | number, pkImmeuble: string | number, energie: 'CHAUFFAGE' | 'EAU' }`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getMyAccount()` - GET `/api/occupant/my-account`
  - Retourne : `{ logement: Housing, consoTabs: ConsumptionTab[], rgpdcheckboxvalue: string }`
  - Query React Query

- [ ] `getAlertes()` - GET `/api/occupant/alertes`
  - Retourne : `{ logement: Housing, consoTabs: ConsumptionTab[], user: User }`
  - Query React Query

- [ ] `updateAlertes(data)` - POST `/api/occupant/alertes`
  - Paramètres : `{ SEUIL_CONSO_ACTIF?: boolean, ... }`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

---

## ✅ Étape 7 : Hook Operators (useOperators.ts)

**Fichier** : `src/lib/hooks/useOperators.ts`  
**Base URL** : `/api/operators`

### Endpoints à implémenter :

- [ ] `getOperators()` - GET `/api/operators`
  - Retourne : `OperatorListResponse`
  - Query React Query

- [ ] `createOperator(data)` - POST `/api/operators`
  - Paramètres : `CreateOperatorRequest`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `getStatistics()` - GET `/api/operators/statistiques`
  - Retourne : `{ stats: OccupantStatistics }`
  - Query React Query

- [ ] `getOperator(id)` - GET `/api/operators/{id}`
  - Paramètres : `id: string | number`
  - Retourne : `{ user: Operator, immeubles: Building[], diffImmeubles: Building[] }`
  - Query React Query

- [ ] `updateOperator(id, data)` - PUT/PATCH `/api/operators/{id}`
  - Paramètres : `{ id: string | number, data: UpdateOperatorRequest }`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `updatePassword(id, password)` - PUT/PATCH `/api/operators/{id}/password`
  - Paramètres : `{ id: string | number, password: string | { first: string, second: string } }`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `addBuildings(id, data)` - POST `/api/operators/{id}/immeubles`
  - Paramètres : `{ id: string | number, data: { immeubles?: string[], all?: boolean } }`
  - Retourne : `{ immeubles: Building[] }`
  - Mutation React Query

- [ ] `removeBuildings(id, data)` - DELETE `/api/operators/{id}/immeubles`
  - Paramètres : `{ id: string | number, data: { immeubles?: string[], all?: boolean } }`
  - Retourne : `{ immeubles: Building[], diffImmeubles: Building[] }`
  - Mutation React Query

- [ ] `deleteOperator(id)` - DELETE `/api/operators/{id}`
  - Paramètres : `id: string | number`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

---

## ✅ Étape 8 : Hook Ticketing (useTickets.ts)

**Fichier** : `src/lib/hooks/useTickets.ts`  
**Base URL** : `/api/tickets`

### Endpoints à implémenter :

- [ ] `getTickets(showAll?)` - GET `/api/tickets`
  - Paramètres : `{ showAll?: boolean }`
  - Retourne : `TicketListResponse`
  - Query React Query

- [ ] `getTicketMenu()` - GET `/api/tickets/menu`
  - Retourne : `{ isTicketInterEnabled: boolean, nbTicketsInterUser: number }`
  - Query React Query

- [ ] `closeTicket(pkTicket)` - POST/PUT `/api/tickets/{pkTicket}/close`
  - Paramètres : `pkTicket: string`
  - Retourne : `{ success: boolean, message: string }`
  - Mutation React Query

- [ ] `getTicketAttachment(pkTicket)` - GET `/api/tickets/{pkTicket}/attachment`
  - Paramètres : `pkTicket: string`
  - Retourne : `{ attachmentName: string, attachmentContent: string }`
  - Query React Query

- [ ] `getCreateTicketInfo(pkLogement)` - GET `/api/tickets/create/{pkLogement}`
  - Paramètres : `pkLogement: string | number`
  - Retourne : `{ ticketOwner: TicketOwner, formData: CreateTicketRequest }`
  - Query React Query

---

## ✅ Étape 9 : Hook Factures (useFactures.ts)

**Fichier** : `src/lib/hooks/useFactures.ts`  
**Base URL** : `/api/factures`

### Endpoints à implémenter :

- [ ] `getFactures()` - GET `/api/factures`
  - Retourne : `InvoiceListResponse`
  - Query React Query

- [ ] `getFacture(pkFacture)` - GET `/api/factures/{pkFacture}`
  - Paramètres : `pkFacture: string | number`
  - Retourne : `Invoice`
  - Query React Query

- [ ] `downloadFacture(pkFacture)` - GET `/api/factures/{pkFacture}/download`
  - Paramètres : `pkFacture: string | number`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

---

## ✅ Étape 10 : Hook Search (useSearch.ts)

**Fichier** : `src/lib/hooks/useSearch.ts`  
**Base URL** : `/api/search`

### Endpoints à implémenter :

- [ ] `search(params)` - GET `/api/search`
  - Paramètres : `SearchParams`
  - Retourne : `SearchResponse`
  - Query React Query

---

## ✅ Étape 11 : Hook Gestion Parc (useGestionParc.ts)

**Fichier** : `src/lib/hooks/useGestionParc.ts`  
**Base URL** : `/api/gestion-parc`

### Endpoints à implémenter :

- [ ] `getGestionParc()` - GET `/api/gestion-parc`
  - Retourne : `BuildingListResponse`
  - Query React Query

- [ ] `filterGestionParc(params)` - GET/POST `/api/gestion-parc/filtre`
  - Paramètres : `FilterParams`
  - Retourne : `BuildingListResponse`
  - Query/Mutation React Query

- [ ] `getImmeuble(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `BuildingDetailsResponse`
  - Query React Query

- [ ] `getIntervention(pkImmeuble, pkIntervention)` - GET `/api/gestion-parc/{pkImmeuble}/interventions/{pkIntervention}`
  - Paramètres : `{ pkImmeuble: string | number, pkIntervention: string | number }`
  - Retourne : `{ immeuble: Building, depannage: InterventionDetails }`
  - Query React Query

- [ ] `getInterventions(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/interventions`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `{ immeuble: Building, depannages: Intervention[], filters: FilterValues }`
  - Query React Query

- [ ] `getFuites(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/fuites`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `LeakListResponse`
  - Query React Query

- [ ] `getAnomalies(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/anomalies`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `AnomalyListResponse`
  - Query React Query

- [ ] `getDysfonctionnements(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/dysfonctionnements`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `DysfunctionListResponse`
  - Query React Query

- [ ] `getReport(pkImmeuble, type, energie, date?)` - GET/POST `/api/gestion-parc/{pkImmeuble}/releve/{type}/{energie}`
  - Paramètres : `{ pkImmeuble: string | number, type: string, energie: string, date?: string }`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportAnomalies(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/anomalies/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportFuites(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/fuites/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportInterventions(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/interventions/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `exportDysfonctionnements(pkImmeuble)` - GET `/api/gestion-parc/{pkImmeuble}/dysfonctionnements/export`
  - Paramètres : `pkImmeuble: string | number`
  - Retourne : `Blob` (Excel)
  - Query React Query avec `responseType: 'blob'`

- [ ] `getInterventionReport(pkImmeuble, params)` - GET `/api/gestion-parc/{pkImmeuble}/intervention`
  - Paramètres : `{ pkImmeuble: string | number, docType: string, dateBegin: string, dateEnd: string }`
  - Retourne : `Blob` (PDF ou Excel)
  - Query React Query avec `responseType: 'blob'`

---

## ✅ Étape 12 : Hook Interventions (useInterventions.ts)

**Fichier** : `src/lib/hooks/useInterventions.ts`  
**Base URL** : `/api/interventions`

### Endpoints à implémenter :

- [ ] `getInterventionReport(pkDepannage)` - GET `/api/interventions/{pkDepannage}/report`
  - Paramètres : `pkDepannage: string | number`
  - Retourne : `Blob` (PDF)
  - Query React Query avec `responseType: 'blob'`

---

## 📊 Statistiques

### Par contrôleur :

1. **SecurityApiController** : 7 endpoints
2. **FrontApiController** : 6 endpoints
3. **TableauBordClientApiController** : 2 endpoints
4. **ImmeubleApiController** : 15 endpoints
5. **LogementApiController** : 20 endpoints
6. **OccupantApiController** : 16 endpoints
7. **OperatorApiController** : 9 endpoints
8. **TicketingApiController** : 5 endpoints
9. **FactureApiController** : 3 endpoints
10. **SearchApiController** : 1 endpoint
11. **GestionParcApiController** : 15 endpoints
12. **InterventionApiController** : 1 endpoint

**Total** : **~100 endpoints** à implémenter

---

## 🗂️ Structure des fichiers à créer

```
frontend/src/lib/hooks/
├── useSecurity.ts          # Hook Security (7 endpoints)
├── useFront.ts             # Hook Front (6 endpoints)
├── useDashboard.ts         # Hook Dashboard (2 endpoints)
├── useImmeubles.ts         # Hook Immeubles (15 endpoints)
├── useLogements.ts         # Hook Logements (20 endpoints)
├── useOccupant.ts          # Hook Occupant (16 endpoints)
├── useOperators.ts         # Hook Operators (9 endpoints)
├── useTickets.ts           # Hook Ticketing (5 endpoints)
├── useFactures.ts          # Hook Factures (3 endpoints)
├── useSearch.ts            # Hook Search (1 endpoint)
├── useGestionParc.ts       # Hook Gestion Parc (15 endpoints)
└── useInterventions.ts     # Hook Interventions (1 endpoint)
```

---

## 🔧 Fonctionnalités communes à implémenter

### Pour chaque hook :

1. **Utilisation de React Query** :
   - `useQuery` pour les GET requests
   - `useMutation` pour les POST/PUT/PATCH/DELETE requests
   - Gestion des erreurs avec `onError`
   - Invalidation des caches avec `queryClient.invalidateQueries`

2. **Gestion des fichiers (Blob)** :
   - Utiliser `responseType: 'blob'` pour les PDF/Excel/CSV
   - Créer des helpers pour télécharger les fichiers
   - Gestion des erreurs pour les fichiers

3. **Types TypeScript** :
   - Utiliser les types définis dans `src/lib/types/api.ts`
   - Ajouter des types spécifiques si nécessaire

4. **Gestion des paramètres** :
   - Support des paramètres optionnels
   - Validation des paramètres requis
   - Gestion des query parameters

5. **Cache et invalidation** :
   - Configuration des `staleTime` et `gcTime`
   - Invalidation intelligente des caches
   - Optimistic updates pour les mutations

---

## 📝 Notes importantes

### 1. Hook useAuth existant

Le hook `useAuth` existe déjà et utilise certains endpoints de Security. À décider :
- Fusionner avec `useSecurity`
- Garder séparé et utiliser `useSecurity` pour les autres endpoints
- Réutiliser les fonctions de `useSecurity` dans `useAuth`

### 2. Endpoints de fichiers (Blob)

Pour les endpoints qui retournent des PDF/Excel/CSV :
- Utiliser `responseType: 'blob'` dans Axios
- Créer un helper pour télécharger les fichiers
- Gérer les erreurs spécifiques aux fichiers

### 3. Endpoints similaires

Certains endpoints sont similaires entre contrôleurs (ex: `getInterventions` dans Immeubles et Logements). Créer des fonctions réutilisables si possible.

### 4. Gestion des erreurs

- Utiliser `handleApiError` du client API
- Afficher des messages d'erreur utilisateur-friendly
- Logger les erreurs pour le debugging

### 5. Optimisations

- Utiliser `enabled` dans `useQuery` pour les requêtes conditionnelles
- Utiliser `refetchOnWindowFocus: false` pour certaines queries
- Implémenter des optimistic updates pour les mutations

---

## 🎯 Ordre de priorité recommandé

1. **Phase 1** : Hooks essentiels (Security, Front, Dashboard)
2. **Phase 2** : Hooks principaux (Immeubles, Logements, Occupant)
3. **Phase 3** : Hooks secondaires (Operators, Ticketing, Factures)
4. **Phase 4** : Hooks complémentaires (Search, Gestion Parc, Interventions)

---

**Dernière mise à jour** : 2025-01-XX  
**Statut** : 📋 Todo liste créée - Prêt pour l'implémentation

