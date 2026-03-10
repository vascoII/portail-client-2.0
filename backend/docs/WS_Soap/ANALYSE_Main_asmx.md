# Analyse des Web Services — Main.asmx.cs

**Fichier :** `Main.asmx.cs`  
**Namespace :** `Techem.Webservices.WS_EspaceClient`  
**Type :** Service Web ASP.NET ASMX (SOAP), binding WSI Basic Profile 1.1  
**Namespace SOAP :** `http://tempuri.org/`

---

## Vue d’ensemble

Le service expose des **WebMethods** regroupés par consommateur :

| Région | Consommateur | Description |
|--------|--------------|-------------|
| **UTILISE PAR LE WS** | Portail client (app) | Authentification, immeubles, logements, tableaux de bord, tickets, factures, occupants, exports… |
| **UTILISE DANS LER** | LER | Gestion utilisateurs/immeubles, occupants, tokens, rapports, réinitialisation MDP, expiration… |
| **PAS UTILISE** | — | Méthodes conservées mais non appelées |
| **UTILISE DANS PORTAIL PUBLIC** | Portail public | Saisie de relevés occupants |
| **UTILISE par SF** | Salesforce | Récupération d’un Case SF (intervention) |

---

## 1. UTILISE PAR LE WS (Portail client)

Méthodes utilisées par l’application portail client. Auth par **SessionID + PkUser** sauf indication.

### 1.1 Test / Santé

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetHello` | — | `string` | Test basique ; retourne `"Hello !"`. |

---

### 1.2 Authentification & session

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `Login` | `LoginID`, `Password` | `session` | Connexion ; retourne l’objet session. |
| `LoginFromParam` | `SuperLoginID`, `SuperPassword`, `Param` | `session` | Connexion via paramètre (ex. token/lien). |
| `Logout` | `SessionID`, `PkUser` | `bool` | Déconnexion. |

---

### 1.3 Immeubles & droits

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetInfosImmeubles` | `SessionID`, `PkUser`, `PkUserChild`, `ParamsFiltres`, `ParamsInfos` | `infosImmeubles` | Liste des immeubles (user ou enfant). **Filtres** : FUITES, DEPANNAGES, DYSFONCTIONNEMENTS, ANOMALIES (séparateur `\|`). **Infos** : NBAPPAREILS, NBLOGEMENTS, NBFUITES, NBDEPANNAGES, NBDYSFONCTIONNEMENTS, NBANOMALIES. |
| `SetImmeubles` | `SessionID`, `PkUser`, `PkUserChild`, `ListImmeubles` | `retour` | Affecte les droits (liste d’immeubles) à un utilisateur enfant. `ListImmeubles` = IDs séparés par `\|`. |

---

### 1.4 Utilisateurs (gestionnaires / enfants)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `CreateGestionnaire` | `SessionID`, `PkUser`, `LoginID`, `UserName`, `FirstName`, `PhoneNumber`, `Email`, `UserRole` | `bool` | Création d’un gestionnaire par un admin. |
| `GetChildUsers` | `SessionID`, `PkUser`, `type` | `users` | Liste des users enfants. `type` : ALL, G (gestionnaire), O (occupant). |
| `GetUser` | `SessionID`, `PkUser`, `PkUserChild` | `user` | Détail d’un utilisateur enfant. |
| `UpdateUser` | `SessionID`, `PkUser`, `PkUserChild`, `UserName`, `FirstName`, `PhoneNumber`, `Email`, `UserRole` | `retour` | Mise à jour des infos d’un user. |
| `UpdatePassword` | `SessionID`, `PkUser`, `PkUserChild`, `Password` | `retour` | Changement de mot de passe. |
| `DeleteUser` | `SessionID`, `PkUser`, `PkUserChild` | `retour` | Suppression d’un utilisateur enfant. |
| `ResetPasswordFromEmail` | `SessionID`, `PkUser`, `Email` | `user` | Réinit MDP à partir de l’email (côté portail). |
| `ResetPasswordFromPKUser` | `SuperLoginID`, `SuperPassword`, `PKUser` | `user` | Réinit MDP par PK user (super admin). |
| `UpdateCGUFromPKUser` | `SuperLoginID`, `SuperPassword`, `PKUser`, `CGU` | `user` | Mise à jour CGU par PK user. |
| `UpdateEmailFromPKUser` | `SuperLoginID`, `SuperPassword`, `PKUser`, `Email` | `user` | Mise à jour email par PK user. |

---

### 1.5 Statistiques & Big Data

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetStatOccupantsGraph` | `SessionID`, `PkUser`, `typeGraph`, `startDate`, `endDate` | `List<GraphPoint>` | Données pour graphique stats occupants. |
| `GetSousTraitants` | `SuperLoginID`, `SuperPassword` | `List<sousTraitant>` | Liste des sous-traitants. |
| `GetStatOccupants` | `SuperLoginID`, `SuperPassword`, `idClient` | `List<userLog>` | Logs / stats des occupants pour un client. **Note :** pas d’attribut `[WebMethod]` dans le code actuel. |
| `GetUsersBigData` | `SuperLoginID`, `SuperPassword` | `usersBigData` | Liste des utilisateurs BigData. |

---

### 1.6 Factures & occupants (changement)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `getFactures` | `SessionID`, `PkUser` | `factures` | Liste des factures du client. |
| `getOccupants4Chgt` | `SessionID`, `PkUser`, `PkImmeuble`, `PkOccupant` (opt. -1), `isNew` (opt. false) | `List<occupant4Chgt>` | Liste des occupants pour changement (patrimoine). |
| `setOccupants4Chgt` | `SessionID`, `PkUser`, `occupants`, `isNew` | `List<occupant4Chgt>` | Enregistrement des changements d’occupants. |

---

### 1.7 Tableaux de bord

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetTableauBordImmeuble` | `SessionID`, `PkUser`, `PkImmeuble` | `tableauDeBordImmeuble` | Tableau de bord d’un immeuble. |
| `GetTableauBordClient` | `SessionID`, `PkUser` | `tableauDeBordClient` | Tableau de bord client. |
| `GetTableauBordLogement` | `SessionID`, `PkUser`, `PkLogement`, `PkOccupant` | `tableauDeBordLogement` | Données pour le tableau de bord d’un logement. |

---

### 1.8 Exports & fichiers

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetReport` | `SessionID`, `PkUser`, `ReportType`, `ParamsFiltres` | `Byte[]` | Téléchargement d’un rapport (PDF). |
| `GetExcel` | `SessionID`, `PkUser`, `ReportType`, `ParamsFiltres` | `Byte[]` | Téléchargement d’un fichier Excel. |
| `GetFile` | `SuperLoginID`, `SuperPassword`, `FileName` | `Byte[]` | Téléchargement d’un fichier du DataDirectory. |
| `GetNbTransfertFichiersClient` | `SessionID`, `PkUser` | `int` | Nombre de transferts de fichiers pour le client. |
| `GetNbTransfertFichiersImmeuble` | `SessionID`, `PkUser`, `PkImmeuble` | `int` | Nombre de transferts pour un immeuble. |
| `InsertPrintJobs` | `SessionID`, `PkUser`, `ReportType`, `ParamsFiltres` | `int` | Insertion d’un job d’impression de rapport. |

---

### 1.9 Logements

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetInfosLogements` | `SessionID`, `PkUser`, `ParamsFiltres`, `ParamsInfos` | `infosLogements` | Infos logements tous immeubles. Filtres : FUITES, DEPANNAGES, DYSFONCTIONNEMENTS, ANOMALIES, TICKETSINTER, FIELD_* (REFOCCUPANT, ALLFIELDS, etc.). Infos : NBAPPAREILS, NBLOGEMENTS, NBFUITES, IMMEUBLE, NBDEPANNAGES, NBDYSFONCTIONNEMENTS, NBTICKETSINTER, NBANOMALIES. |
| `GetInfosLogementsByImmeuble` | `SessionID`, `PkUser`, `PkImmeuble`, `ParamsFiltres`, `ParamsInfos` | `infosLogements` | Même chose limité à un immeuble. |

---

### 1.10 Dépannages, dysfonctionnements, fuites, anomalies

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetDetailsDepannage` | `SessionID`, `PkUser`, `WorkOrderNumber` | `detailsDepannage` | Détail dépannage d’un work order. |
| `GetInfosDepannagesByImmeuble` | `SessionID`, `PkUser`, `PkImmeuble`, `ParamsFiltres` | `infosDepannages` | Dépannages d’un immeuble (filtre ex. PKOCCUPANT). |
| `GetInfosDysfonctionnementsByImmeuble` | `SessionID`, `PkUser`, `PkImmeuble`, `ParamsFiltres` | `infosDysfonctionnements` | Dysfonctionnements (alertes) d’un immeuble. |
| `GetInfosFuitesByImmeuble` | `SessionID`, `PkUser`, `PkImmeuble`, `ParamsFiltres` | `infosFuites` | Fuites d’un immeuble. |
| `GetInfosAnomaliesByImmeuble` | `SessionID`, `PkUser`, `PkImmeuble`, `ParamsFiltres` | `infosAnomalies` | Anomalies (logement, occupant, appareil). Filtres : PKOCCUPANT, PKLOGEMENT, PKAPPAREIL. |

---

### 1.11 Tickets d’intervention (E-ticketing)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `CheckTicketsInterEnabled` | `SessionID`, `PkUser` | `bool` | Vérifie si le client peut utiliser l’e-ticketing. |
| `GetNbTicketsInterByLogement` | `SessionID`, `PkUser`, `PkLogement`, `ParamsFiltres` | `int` | Nombre de tickets par logement (ParamsFiltres = STATUT). |
| `GetTicketInterInit` | `SessionID`, `PkUser`, `PkLogement` | `ticketInterInit` | Données pour pré-remplir le formulaire de création de ticket. |
| `CreateTicketInter` | `SessionID`, `PkUser`, `PkLogement`, `Objet`, `Nom`, `Email`, `TelFixe`, `TelMobile`, `MotifLibre`, `AttachmentName`, `AttachmentContent` | `int` | Création d’un ticket (-1 si erreur). |
| `SetTicketStatus` | `SessionID`, `PkUser`, `CaseId`, `statut` | `bool` | Clôture / changement de statut (StatuClient). |
| `GetTicketsIntersUser` | `SessionID`, `PkUser`, `ParamsFiltres` | `ticketsInter` | Liste des tickets de l’utilisateur. |
| `GetNbTicketsIntersUser` | `SessionID`, `PkUser` | `int` | Nombre de tickets ouverts. |

---

### 1.12 Seuils & rapports

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `SetSeuilConso` | `SessionID`, `PkUser`, `ParamsFiltres` | `retour` | Affectation des seuils d’alarme de consommation. |

---

## 2. UTILISE DANS LER

Auth par **SuperLoginID + SuperPassword** (sauf quand `SessionID` est indiqué).

### 2.1 Immeubles & utilisateurs

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetImmeublesByPKUser` | `SuperLoginID`, `SuperPassword`, `PkUser` | `immeubles` | Liste des immeubles d’un utilisateur. |
| `GetLoginToken` | `SuperLoginID`, `SuperPassword`, `PkUser` | `string` | Obtention d’un token de connexion. |
| `CreateOccupants` | `SessionID`, `PkUser`, `fk`, `type` | `users` | Création des occupants d’un immeuble (`type` = "I"). |
| `CreateDirecteur` | `SuperLoginID`, `SuperPassword`, `LoginID`, `UserName`, `FirstName`, `fk`, `type`, `PhoneNumber`, `Email`, `UserRole` | `bool` | Création d’un administrateur. `type` : Syndic→S, Agence→A, Maison mère→M. |
| `CreateOccupant` | `SuperLoginID`, `SuperPassword`, `LoginID`, `UserName`, `FirstName`, `fk`, `PhoneNumber`, `Email` | `bool` | Création d’un occupant. |
| `GetUsers` | `SuperLoginID`, `SuperPassword`, `ParamsFiltres` | `users` | Liste des utilisateurs. |
| `GetUserByLogin` | `SuperLoginID`, `SuperPassword`, `LoginID` | `user` | Utilisateur par login. |
| `UpdateUser3` | `SuperLoginID`, `SuperPassword`, `PkUser`, `LoginID`, `UserName`, `FirstName`, `fk`, `type`, `PhoneNumber`, `Email`, `UserRole` | `retour` | Mise à jour utilisateur (version complète). |
| `SendEmailToUser` | `SuperLoginID`, `SuperPassword`, `PKUser` | `retour` | Envoi d’un email à l’utilisateur. |
| `UpdateExpirationDateFromPKUser` | `SuperLoginID`, `SuperPassword`, `PKUser`, `date` | `user` | Mise à jour date d’expiration des accès. |
| `GetTchWeekPwd` | `SuperLoginID`, `SuperPassword`, `Date` | `string` | Mot de passe hebdo TCH. |

---

### 2.2 Rapports, tokens, réinitialisation MDP

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetNoteInfo` | `SuperLoginID`, `SuperPassword`, `Params` | `Byte[]` | Note d’info mensuelle (PDF). |
| `InsertReportToken` | `SessionID`, `reportType`, `param` | `string` | Création d’un token pour rapport (LER/MAIL). |
| `GetReportByToken` | `SessionID`, `tokenid` | `byte[]` | Récupération d’un rapport par token. |
| `ResetPassword` | `SuperLoginID`, `SuperPassword`, `TokenID`, `Salt`, `Password` | `retour` | Réinit MDP via token reçu par email (LER/MAIL). |
| `UpdateExpirationDateOccupants` | `SuperLoginID`, `SuperPassword` | `void` | Met à jour les dates d’expiration des occupants (départs). |

---

### 2.3 Changements d’occupants (LER)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `getOccupants4Chgt4LER` | `SuperLoginID`, `SuperPassword`, `showArchive` | `List<occupant4Chgt>` | Liste des changements d’occupants à traiter par LER. |
| `setOccupants4Chgt4LER` | `SuperLoginID`, `SuperPassword`, `occupants` | `void` | Archive / tag des changements d’occupants. |

---

### 2.4 Statistiques

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `GetStatOccupants2` | `SuperLoginID`, `SuperPassword`, `idClient`, `startDate`, `endDate` | `List<userLog>` | Stats occupants avec plage de dates. |
| `GetStatClient` | `SuperLoginID`, `SuperPassword`, `idClient` | `List<userLog>` | Logs / stats des clients. |

---

## 3. PAS UTILISE

Méthodes exposées mais non utilisées par les apps connues.

| Méthode | Paramètres | Retour | Note |
|---------|------------|--------|------|
| `UpdateUser2` | SuperLoginID, SuperPassword, PkUser, UserName, FirstName, PhoneNumber, Email, UserRole | `retour` | Version simplifiée sans fk/type. |
| `GetResetTokenIDValidation` | SuperLoginID, SuperPassword, TokenID, Salt | `retour` | Validation d’un token de réinit. |
| `ResetPasswordFromEmail2` | SuperLoginID, SuperPassword, Email | `user` | Réinit MDP par email (version super admin). |
| `GetExportParams` | SuperLoginID, SuperPassword, clientName | `userExportParams` | Paramètres d’export. |
| `GetConsoImmeuble` | SessionID, PkUser, PkImmeuble, type, nbTop (def. 5) | `topConsos` | Top des consommations d’un immeuble. |
| `GetInfosAppareilsByLogementEC` | SessionID, PkUser, PkLogement, ParamsInfos | `infosAppareilsEAU` | Appareils eau chaude (EC), 5 ans. |
| `GetInfosAppareilsByLogementEF` | SessionID, PkUser, PkLogement, ParamsInfos | `infosAppareilsEAU` | Appareils eau froide (EF), 5 ans. |
| `GetInfosAppareilsByLogementRepart` | SessionID, PkUser, PkLogement, ParamsInfos | `infosAppareilsRepart` | Appareils répartition. |
| `GetInfosAppareilsByLogementCET` | SessionID, PkUser, PkLogement, ParamsInfos | `infosAppareilsCET` | Appareils CET. |

---

## 4. UTILISE DANS PORTAIL PUBLIC

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `setReleveOccupant` | SuperLoginID, SuperPassword, immeuble, batiment, escalier, etage, date_passage, prenom, nom, adresse, code_postal, ville, telephone, email, ef_cuisine, ef_salle_de_bains, ef_wc, ef_autre, ef_nomautre, ec_cuisine, ec_salle_de_bains, ec_wc, ec_autre, ec_nomautre | `void` | Envoi d’une demande de traitement des relevés (saisie occupant). EF = eau froide, EC = eau chaude. |

---

## 5. UTILISE par SF (Salesforce)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| `getCase` | `SuperLoginID`, `SuperPassword`, `Id`, `Email` | `caseSF` | Récupère un Case Salesforce (Type = Intervention), filtré par Id et SuppliedEmail. Statuts : Attribue, InterventionPlanifiee, interventionareprogrammer, EnCoursDeTraitement, EnAttenteRetourDemandeur, EnAttenteDePlanification, ou fermé (ClosedDate ≥ 6 mois). |

---

## Types de retour principaux (à documenter dans d’autres fichiers)

- **session**, **user**, **users**, **usersBigData**
- **retour** (succès/erreur)
- **infosImmeubles**, **immeubles**, **immeuble**
- **infosLogements**, **tableauDeBordImmeuble**, **tableauDeBordClient**, **tableauDeBordLogement**
- **factures**, **occupant4Chgt**
- **detailsDepannage**, **infosDepannages**, **infosDysfonctionnements**, **infosFuites**, **infosAnomalies**
- **ticketInterInit**, **ticketsInter**
- **caseSF**
- **GraphPoint**, **userLog**, **sousTraitant**
- **topConsos**, **infosAppareilsEAU**, **infosAppareilsRepart**, **infosAppareilsCET**, **userExportParams**

---

## Points d’attention

1. **GetStatOccupants** (l. 277) : pas d’attribut `[WebMethod]` → non exposé en SOAP actuellement.
2. **LogoutAll**, **GetReportByEmail**, **GetReportTokens** : présents en commentaire (non exposés).
3. **Filtres/Params** : les paramètres `ParamsFiltres` et `ParamsInfos` sont des chaînes avec paires `clef=valeur` ou codes (ex. `NBAPPAREILS=O`), séparateur `|`.
4. **Auth** : soit **SessionID + PkUser** (session portail), soit **SuperLoginID + SuperPassword** (admin / LER / SF / portail public).

---

*Document généré à partir de l’analyse de `Main.asmx.cs`. À compléter avec les autres fichiers C# (types, WS_Common, etc.) pour la wiki finale.*
