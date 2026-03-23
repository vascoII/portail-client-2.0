# Analyse — WS_Common.cs

**Fichier :** `WS_Common.cs` (~14 000 lignes)  
**Namespace :** `Techem.Webservices.WS_EspaceClient`  
**Type :** `static public partial class WS_Common`  
**Rôle :** Cœur métier des Web Services. Contient l’implémentation de la quasi-totalité des opérations appelées par `Main.asmx.cs` (immeubles, logements, relevés, dépannages, fuites, anomalies, tickets, factures, rapports, occupants, etc.).

---

## Vue d’ensemble

- **Partiel :** `WS_Common` est complété par les classes partielles **WS_Users.cs** et **WS_Utils.cs**.
- **Pas de WebMethod** : toutes les méthodes sont invoquées depuis `Main.asmx.cs` ou en interne.
- **Double schéma base :** comme ailleurs, des blocs **`#if WS2`** alternent entre tables **web_*** (web_immeuble, web_client, web_compteur, web_releve, etc.) et tables legacy (immeuble, client, compteur, releve, etc.).
- **Sources de données :** LER (Oracle via `WS_DBUtils.utils_LER`), MongoDB (`utils_Mongo`), Salesforce (`utils_SF`), plus LER_PrintPlugin pour les rapports.

Ce document décrit la **structure par régions** et la **liste des méthodes publiques** par bloc. Le détail de chaque méthode peut être complété ensuite (par extraits ciblés ou par région).

---

## Dépendances (principales)

- **Techem.DBUtils** (LER, Mongo, SF), **Techem.LER.LER_PrintPlugin**
- **DevExpress** (XtraReports, rapports, Excel)
- **MongoDB.Driver**, **MongoDB.Bson**
- **Oracle.ManagedDataAccess**, **OfficeOpenXml**
- **Tools**, **Utils_Mail**, **Utils_Releve** (namespace Techem.Webservices.WS_EspaceClient.Tools)

---

## Structure par régions (ordre dans le fichier)

| Lignes (approx.) | Region | Contenu principal |
|------------------|--------|-------------------|
| 41-52 | **Objets internes** | Classe `nbAppareils` (nb compteurs EC, EF, Repart, CET, Capteur) |
| 53-1013 | *(sans region nommée)* | **Immeubles** : requêtes et infos immeubles par user/conteneur |
| 1014-2129 | **alarmes** | Fuites, dysfonctionnements (alarmes), requêtes Mongo/LER associées |
| 3175-3489 | **Relevés** | Dernier date index, télérélevé, tableaux de bord immeuble/client |
| 4157-5936 | **Impressions** | Rapports PDF, Excel, jobs d’impression, Note d’info, paramètres de rapports |
| 5939-7367 | **Consos** | Top consos, séries de consommations, index mois, graphiques |
| 7369-8141 | **Depannages** | Liste dépannages, détails work order, infos par immeuble |
| 8143-11261 | **Logements** | Infos logements, tableau de bord logement, appareils, relevés, anomalies ; sous-régions **Tickets d’intervention** |
| 11263-11517 | **Anomalies de consommation** | GetInfosAnomaliesByImmeuble |
| 11519-11585 | **Recherche** | Helpers recherche texte (ClearAccents, GetFtxtFilter) |
| 11587-11630 | **Divers** | GetUsersBigData, GetFile |
| 11632-12151 | **Répartition** | Répartitions immeuble (GetLastsPkRepartImmeuble, infosRepartImm, etc.) |
| 12153-12571 | **Capteurs** | Index recap capteur, séries par immeuble/logement (température, humidité) |
| 12573-12997 | **Ticket Inter** | Tickets d’intervention (nombre, init, création, statut, liste, e-ticketing activé) |
| 12999-13113 | **Client** | GetClientByRow, GetClientByPkClient, GetClientByPkUser, GetPKClientTop |
| 13115-13255 | **factures** | getFactures |
| 13279 | *(isolé)* | **getCase** (Salesforce) |
| 13384-13927 | **Changements d'occupant** | getOccupants4Chgt, setOccupants4Chgt, getOccupants4Chgt4LER, setOccupants4Chgt4LER |
| 13956-14588 | *(suite)* | setReleveOccupant, GetSousTraitants, GetStatOccupants, GetStatOccupantsGraph, GetStatClient, ResetPassword, GetResetTokenIDValidation, UpdateExpirationDateOccupants, InsertAPICall, InsertReportToken, GetReportByToken, InsertTrace, InsertPrintJobs (surcharge) |

---

## 1. Objets internes (l. 41-52)

- **nbAppareils** : champs NbCompteursEC, NbCompteursEF, NbCompteursRepart, NbCompteursCET, NbCompteursCapteur (valeurs par défaut -1).

---

## 2. Immeubles (l. 53-1013)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetRowsImmeublesByPKUser | DataRowCollection | Liste des immeubles pour un user (super-admin). Utilise GetQueryImmeubles. |
| GetQueryImmeubles | string | Construit la requête SQL des immeubles selon TypeConteneur (U, M, A, S, I, L) et PkConteneur. |
| GetInfosImmeubles | infosImmeubles | Appelée par Main : immeubles du user/enfant avec filtres (FUITES, DEPANNAGES, etc.) et infos optionnelles (NBAPPAREILS, NBLOGEMENTS, …). |
| getNbImmeubles | int | Nombre d’immeubles pour un conteneur (type + pk). |

---

## 3. alarmes (l. 1014-2129)

Fuite et dysfonctionnements (alarmes techniques), avec requêtes LER + Mongo (DATEINDEX, agrégations).

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetNbDysfonctionnements | int (private) | Nombre de dysfonctionnements (ParamsFiltres, Fluides, Date). |
| GetInfosFuitesByImmeuble | infosFuites | Fuites par immeuble (session, PkUser, PkImmeuble, Date, ParamsFiltres). |
| GetInfosDysfonctionnementsByImmeuble | infosDysfonctionnements | Dysfonctionnements par immeuble (idem). |
| GetRowFirstDayFlag | DataRow | Première date de flag pour un compteur (pkCompteur, DateFlag, flagField). |
| GetNbDepannages | int | Nombre de dépannages (TypeConteneur, PkConteneur, SeulementEnCours). |
| GetDepannages | DataTable | Liste des dépannages (même signature). |

---

## 4. Relevés (l. 3175-3489)

| Méthode | Retour | Description |
|---------|--------|-------------|
| getLastDateIndex | DateTime | Dernière date d’index en base (Mongo VARIABLES). |
| GetNbCompteursTeleOKByImmeuble | int | Nombre de compteurs télérélevé OK pour un immeuble à une date. |
| GetNbCompteursTeleTotalByImmeuble | int | Nombre total de compteurs télérélevé. |
| HasImmeubleTelereleve | bool | L’immeuble a-t-il du télérélevé. |
| GetTableauBordImmeuble | tableauDeBordImmeuble | Tableau de bord d’un immeuble (session, PkUser, PkImmeuble). |
| GetTableauBordClient | tableauDeBordClient | Tableau de bord client (session, PkUser). |

---

## 5. Impressions (l. 4157-5936)

Rapports PDF (DevExpress), Excel, Note d’info, jobs d’impression, tokens de téléchargement.

| Méthode | Retour | Description |
|---------|--------|-------------|
| checkReport | bool | Vérifie si un rapport est autorisé (SessionID, PkUser, ReportType, ParamsFiltres). |
| GetReport | Byte[] | Génère et retourne le rapport PDF (SessionID, PkUser, ReportType, ParamsFiltres). |
| GetExcel | Byte[] | Génère et retourne un fichier Excel (même principe). |
| GetNoteInfo | Byte[] | Note d’info mensuelle (SuperLoginID, SuperPassword, Params) ; délègue à GetReport. |
| GetReportByToken | byte[] | Récupère un rapport par token (SessionID, tokenid) ; incrémente number_of_dl puis appelle GetReport. |
| ReplaceParametersInReport | void | Remplace les paramètres dans un XtraReport. |
| GetParametersInText | List\<string\> | Extrait les paramètres dans un texte. |
| ReplaceParametersInLabel | void | Remplace les paramètres dans un XRLabel. |
| CombineTwoReports | XtraReport | Fusionne deux rapports. |
| InsertPrintJobs (SessionID, PkUser, ReportType, ParamsFiltres) | int | Insère un job d’impression (version appelée par Main). |

---

## 6. Consos (l. 5939-7367)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetTopConsosByImmeuble | topConsos | Top des consommations d’un immeuble (type appareil, NbTop). |
| GetSerieConsosAppareil | serie | Série de consommations pour un appareil (période). |
| GetPrecIndexMois | indexMois | Index mois précédent dans une liste. |
| GetSerieConsosRelevesMois2Ans | multiSeries | Séries de consos sur relevés (2 ans, par mois). |

---

## 7. Depannages (l. 7369-8141)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetInfosDepannagesByImmeuble | infosDepannages | Liste des dépannages par immeuble (2 surcharges, dont une avec AutreOccCET). |
| GetDetailsDepannage | detailsDepannage | Détail d’un dépannage par numéro de work order. |

---

## 8. Logements (l. 8143-11261)

Contient aussi les sous-régions **Tickets d’intervention** (liste / détail des tickets par logement ou user).

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetInfosLogements | infosLogements | Infos logements (tous immeubles ou par PkImmeuble), filtres et ParamsInfos. |
| GetTableauBordLogement | tableauDeBordLogement | Données du tableau de bord d’un logement (PkLogement, PkOccupant). |
| GetDegresVAR | int | Calcul degrés VAR (ConsoAncien, ConsoNouveau). |
| GetQueryAppareilsByPkLogement | string | Requête SQL des appareils d’un logement. |
| GetAppareilsByPkLogement | List\<appareil\> | Liste des appareils d’un logement (TypeAppareil). |
| GetPkAppareilsByPkLogement | List\<int\> | Liste des PK appareils d’un logement. |
| GetPkAppareilsByPkImmeuble | List\<int\> | Liste des PK appareils d’un immeuble. |
| GetAppareilByPk | appareil | Appareil par PK compteur. |
| GetAppareilByRow | appareil | Appareil à partir d’un DataRow. |
| GetAppareilByPk4Mongo | appareil | Appareil à partir d’un DataRow Mongo. |
| GetConsoMemeTypeLogement | decimal | Consommation même type de logement (PkReleve, TypeLogement, Fluides). |
| GetLastRelevesImmeuble | List\<releve\> | Derniers relevés d’un immeuble. |
| GetInfosAppareilsByLogementEAU | infosAppareilsEAU | Appareils eau (EC/EF) par logement (période, ParamsInfos). |
| GetInfosAppareilsByLogementRepart | infosAppareilsRepart | Appareils répartition par logement. |
| GetInfosAppareilsByLogementCET | infosAppareilsCET | Appareils CET par logement. |
| GetLastReleves | List\<Releve\> | Derniers relevés (pkImmeuble, nbReleve, date, TypeAppareil). |
| GetLastReleve | releve | Dernier relevé (PkImmeuble, DateDebut, DateFin, TypeAppareil). |
| GetLibCriteria | string | Libellé critère. |
| GetIncidents | string | Incidents (codes, type relevé, date, pkCompteur). |

---

## 9. Anomalies de consommation (l. 11263-11517)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetInfosAnomaliesByImmeuble | infosAnomalies | Anomalies d’un immeuble (logement, occupant, appareil, détail). Filtres : PKOCCUPANT, PKLOGEMENT, PKAPPAREIL. |

---

## 10. Recherche (l. 11519-11585)

Helpers internes (pas exposés en WS) :

- **ClearAccents** : suppression des accents (é→e, à→a, etc.).
- **GetFtxtFilter** : construction d’un filtre SQL pour recherche texte (champs + termes).

---

## 11. Divers (l. 11587-11630)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetUsersBigData | usersBigData | Liste des utilisateurs BigData (super-admin). |
| GetFile | Byte[] | Téléchargement d’un fichier du DataDirectory (SuperLoginID, SuperPassword, FileName). |

---

## 12. Répartition (l. 11632-12151)

- **Classes internes :** infosRepartImm, infosRepartLog.
- **GetLastsPkRepartImmeuble** : dernières répartitions (dates) pour un immeuble.
- Méthodes privées : GetLastPkRepartImmeuble, GetInfosRepartImmByPkRepart, etc.

---

## 13. Capteurs (l. 12153-12571)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetIndexRecapCapteur | indexRecapDate | Index récap capteur (TypeConteneur, PkConteneur, Unite Temperature/Humidite, date). |
| GetSerieCapteurByImmeuble | serie | Série capteur par immeuble (FkUnite, date). |
| GetSerieCapteurByLogement | serie | Série capteur par logement (période). |

---

## 14. Ticket Inter (l. 12573-12997)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetNbTicketsInterByLogement | int | Nombre de tickets par logement (ParamsFiltres = STATUT). |
| GetTicketInterInit | ticketInterInit | Données pour pré-remplir le formulaire de création de ticket. |
| SetTicketStatut | bool | Clôture / changement de statut client (CaseId, StatutClient). |
| CreateTicketInter | int | Création d’un ticket (avec pièce jointe). |
| CreateTicketInter4SalesForce | string | Création ticket côté Salesforce (sans pièce jointe). |
| GetNbTicketsIntersUser | int | Nombre de tickets ouverts pour un user. |
| GetTicketsIntersUser | ticketsInter | Liste des tickets de l’utilisateur (ParamsFiltres). |
| CheckTicketsInterEnabled | bool | E-ticketing activé pour le client ? |

---

## 15. Client (l. 12999-13113)

| Méthode | Retour | Description |
|---------|--------|-------------|
| GetClientByRow | client | client à partir d’un DataRow. |
| GetClientByPkClient | client | client par PK (web_client / client selon WS2). |
| GetClientByPkUser | client | client de l’utilisateur. |
| GetPKClientTop | int | PK du client parent (hiérarchie fkclient). |

---

## 16. factures (l. 13115-13255)

| Méthode | Retour | Description |
|---------|--------|-------------|
| getFactures | factures | Liste des factures pour un user (session, PkUser). |

---

## 17. getCase (Salesforce)

| Méthode | Retour | Description |
|---------|--------|-------------|
| getCase | caseSF | Récupération d’un Case Salesforce (SuperLoginID, SuperPassword, Id, Email). Type Intervention, statuts définis. |

---

## 18. Changements d’occupant et fin de fichier (l. 13384-14588)

| Méthode | Retour | Description |
|---------|--------|-------------|
| getOccupants4Chgt | List\<occupant4Chgt\> | Liste des occupants pour changement (portail). |
| setOccupants4Chgt | List\<occupant4Chgt\> | Enregistrement des changements d’occupants. |
| getOccupants4Chgt4LER | List\<occupant4Chgt\> | Liste des changements à traiter par LER (showArchive). |
| setOccupants4Chgt4LER | void | Archive / tag des changements (LER). |
| setReleveOccupant | void | Envoi demande de traitement des relevés (portail public) ; envoi email vers WEB_RELEVE. |
| GetSousTraitants | List\<sousTraitant\> | Liste des sous-traitants (super-admin). |
| GetStatOccupants | List\<userLog\> | Logs / stats occupants (idClient, startDate, endDate). |
| GetStatOccupantsGraph | List\<GraphPoint\> | Données graphique stats occupants. |
| GetStatClient | List\<userLog\> | Logs / stats clients. |
| IsValidPassword | bool | Validation du mot de passe. |
| ResetPassword | retour | Réinitialisation MDP (TokenID, Salt, Password). |
| GetResetTokenIDValidation | retour | Validation token/salt réinit. |
| UpdateExpirationDateOccupants | void | Mise à jour des dates d’expiration des occupants. |
| InsertAPICall | void | Trace des appels API (nom méthode ou MethodBase, action START/END). |
| AnonymizeContactName | string | Anonymisation d’un nom. |
| GetGuid | string | Génération d’un GUID. |
| InsertReportToken | string | Création d’un token pour rapport (reportType, param). |
| GetReportByToken | byte[] | Rapport par token (incrémente number_of_dl, appelle GetReport). |
| InsertTrace | void | Insertion d’une trace d’erreur (web_error). |
| InsertPrintJobs (jobType, reportType, pk, param, …) | int | Surcharge : insertion job d’impression (web_printjobs) avec data1/data2 optionnels. |

---

## Correspondance Main.asmx ↔ WS_Common

Les WebMethods de **Main.asmx.cs** appellent les méthodes **static** de **WS_Common** (et donc celles de ce fichier + WS_Users + WS_Utils). La liste détaillée est dans **ANALYSE_Main_asmx.md** ; chaque entrée y pointe vers la méthode WS_Common correspondante (même nom ou nom explicité dans les commentaires).

---

## Pistes pour compléter la doc

- **Par région :** ouvrir une région (ex. « Depannages ») et me demander un résumé méthode par méthode avec paramètres et flux.
- **Par WebMethod :** pour un nom de WebMethod donné (ex. `GetInfosLogements`), je peux décrire le flux dans WS_Common (et sous-appels).
- **Types de retour :** les types (infosImmeubles, tableauDeBordImmeuble, factures, ticketsInter, etc.) peuvent être documentés dans un fichier dédié ou une section « Types et DTO » de la wiki.

---

*Document généré par analyse structurelle de WS_Common.cs (régions + signatures publiques). Fichier trop volumineux pour un détail ligne à ligne ; compléments possibles par extraits ciblés.*
