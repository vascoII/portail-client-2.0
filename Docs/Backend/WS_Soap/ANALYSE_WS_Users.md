# Analyse — WS_Users.cs

**Fichier :** `WS_Users.cs`  
**Namespace :** `Techem.Webservices.WS_EspaceClient`  
**Type :** `static public partial class WS_Common`  
**Rôle :** Partie de `WS_Common` dédiée à la gestion des **utilisateurs** (droits, CRUD, session, mots de passe, création gestionnaires/occupants/directeurs, seuils de consommation).

---

## Vue d’ensemble

`WS_Users.cs` ne définit **pas** de WebMethod : toutes les méthodes sont des implémentations appelées par `Main.asmx.cs` via `WS_Common.*`. Le fichier regroupe :

- **Credentials super-admin** (lus depuis la base LER)
- **Droits sur les immeubles** (SetImmeubles, web_user_right)
- **Lecture / écriture des utilisateurs** (GetUser, GetUserByPk, GetUsers, Create*, Update*, DeleteUser)
- **Authentification / session** (vérification `session.checkSession`, lien parent/enfant `IsChildUser`)
- **Mots de passe** (UpdatePassword, Reset*, SendEmailToUser avec lien de réinitialisation)
- **Seuils d’alarme de consommation** (SetSeuilConso)
- **Création en masse d’occupants** (CreateOccupants pour un immeuble)

Deux variantes de schéma base sont gérées via **`#if WS2`** : schéma avec tables `web_*` (web_client, web_immeuble, web_occupant, etc.) vs schéma legacy (client, immeuble, occupant).

---

## Dépendances

- **Tools** (extension `QuotedStr()`, `ToInt32OrDefault()`, `ToBooleanOrDefault()`, etc.)
- **WS_DBUtils** (utils_LER)
- **session** (checkSession, Login, GeneratePasswordResetTokenID)
- **Utils_Mail** (sendMailSmtp)
- **Properties.Settings** : `LER_AUTH_SchemaName`, `baseTest`
- **Paramètres LER** (GetParam) : `PARAM_GEN_LER` → `ESPACECLIENT_WS_SUPERLOGINID`, `ESPACECLIENT_WS_SUPERPASSWORD`, `ESPACECLIENT_WS_SUPERSESSIONID`, `ESPACECLIENT_RESETPASSWORDURL`

---

## Constantes et configuration

| Élément | Source | Description |
|--------|--------|-------------|
| `_SuperLoginID` | LER GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERLOGINID") | Login super-admin |
| `_SuperPassword` | LER GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERPASSWORD") | Mot de passe super-admin |
| `_SuperSessionId` | LER GetParam("PARAM_GEN_LER", "ESPACECLIENT_WS_SUPERSESSIONID") | Session super-admin |
| `tchUserPrefix` | Code | `"tch-"` — préfixe identifiant un login Techem |

---

## Types d’utilisateurs (UserType)

| Code | Rôle | FK / lien |
|-----|------|-----------|
| **C** | Client (directeur) | FKCLIENT → client |
| **G** | Gestionnaire | FKPARENTUSER → directeur (C) |
| **O** | Occupant | FK → occupant |
| **S** / **A** / **M** | Directeur (Syndic / Agence / Maison mère) | FKCLIENT (création via CreateDirecteur) |

---

## Méthodes publiques (exposées via Main.asmx → WS_Common)

### Droits immeubles

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **SetImmeubles** | SessionID, PkUser, PkUserChild, ListImmeubles | retour | Affecte les droits (liste d’immeubles `\|`) à PkUserChild. Vérifie session et IsChildUser. Supprime les anciens droits puis insère (uniquement les immeubles du parent). |

**Méthodes privées associées :**  
`IsChildUser(PkUser, PkUserChild)` — vrai si même user ou (C et G du même FKClient).  
`DeleteUser_Right`, `InsertUser_Right`, `AddUser_Right` — écriture dans `web_user_right` (TYPER='I', FK = pkimmeuble).

---

### Liste et détail utilisateurs

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **GetChildUsers** | SessionID, PkUser, type | users | Liste des users « enfants » du directeur (type = ALL, G ou O). Jointure web_user / web_user_right / immeuble (ou web_immeuble si WS2), filtre client actif et immeubles autorisés. |
| **GetUsers** | SuperLoginID, SuperPassword, ParamsFiltres | users | Liste tous les users de type G et C. Filtre optionnel **PKCLIENT**. Accès : _SuperLoginID/_SuperPassword ou login **TECHNILOG** (session.Login). |
| **GetUser** | SessionID, PkUser, PkUserChild | user | Vérifie session + IsChildUser puis retourne GetUserByPk(PkUserChild). |
| **GetUserByPk** | PkUser | user | Charge web_user + selon UserType : client (showImmeublesArc, showFactures, showChantiers, showChgtOccupant), seuils conso (EF, EC, REPART, CET, actif, email), expiration, CGU. Pour O sans email, complète depuis occupant. |
| **GetUserByEmail** | SuperLoginID, SuperPassword, email | user | Super-admin : recherche par email dans web_user puis, si absent, dans occupant (O, datedepart > sysdate). |
| **GetUserByLogin** | SuperLoginID, SuperPassword, LoginID | user | Super-admin : recherche par LOGINID, retourne GetUserByPk. |
| **GetUserByPKOccupant** | SuperLoginID, SuperPassword, pkOccupant | user | Super-admin : user de type O avec FK = pkOccupant. |

---

### Suppression et mises à jour profil

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **DeleteUser** | SessionID, PkUser, PkUserChild | retour | Session + IsChildUser puis suppression web_user_right et web_user. |
| **UpdateUser** | SessionID, PkUser, PkUserChild, UserName, FirstName, PhoneNumber, Email, UserRole | retour | Session + IsChildUser puis UpdateUser2. |
| **UpdateUser2** | SuperLoginID, SuperPassword, PkUser, UserName, FirstName, PhoneNumber, Email, UserRole | retour | Vérifie unicité email (hors PkUser). UPDATE web_user ; pour C/G met aussi loginid = Email. Si email modifié, envoi SendEmailToUser. |
| **UpdateUser3** | SuperLoginID, SuperPassword, PkUser, LoginID, UserName, FirstName, fk, type, PhoneNumber, Email, UserRole | retour | Mise à jour complète (fk, type, loginid). type C → champ FKCLIENT, sinon FK. Même règle email + SendEmailToUser. |

---

### Mots de passe et expiration

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **UpdatePassword** | SessionID, PkUser, PkUserChild, Password | retour | Session + IsChildUser puis UPDATE PASSWORD_ENCRYPTED (Oracle DBMS_CRYPTO.hash). |
| **ResetPasswordFromEmail** | SessionID, PkUser, Email | user | Session puis délégation à la version Super. |
| **ResetPasswordFromEmail** | SuperLoginID, SuperPassword, Email | user | GetUserByEmail puis SendEmailToUser (envoi lien réinit). |
| **ResetPasswordFromPKUser** | SuperLoginID, SuperPassword, PkUser | user | Génère un nouveau mot de passe, UPDATE PASSWORD_ENCRYPTED, pas d’envoi d’email dans cette méthode. |
| **UpdateExpirationDateFromPKUser** | SuperLoginID, SuperPassword, PkUser, date | user | Met à jour EXPIRATIONDATE (NULL si date >= 2999-12-31). |
| **UpdateCGUFromPKUser** | SuperLoginID, SuperPassword, PkUser, CGU | user | UPDATE champ CGU. |
| **UpdateEmailFromPKUser** | SuperLoginID, SuperPassword, PkUser, Email | user | Vérifie unicité email puis UPDATE email. |

---

### Envoi email et helpers

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **SendEmailToUser** | SuperLoginID, SuperPassword, PKUser | retour | Génère mot de passe + token réinit (GeneratePasswordResetTokenID), met à jour password_encrypted et lastdateemail, envoie email HTML (lien [URL] depuis param ESPACECLIENT_RESETPASSWORDURL). Pièce jointe « Fiche administrateur Espace Client.pdf » si user admin (non O et non G). |
| **GetTchWeekPwd** | SuperLoginID, SuperPassword, Date | string | Délègue à GetTchWeekPassword(Date) si super-admin. |
| **IsLoginTechem** | LoginID | bool | LoginID.StartsWith(tchUserPrefix). |
| **IsUserDemo** | user u | bool | LoginID en minuscules commence par "demo" et ne contient pas "@". |

---

### Création d’utilisateurs

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **CreateGestionnaire** | SessionID, PkUser, LoginID, UserName, FirstName, PhoneNumber, Email, UserRole | bool | Session, pas de UserExists(LoginID), InsertUser type G (parent = PkUser, fkClient = admin.FKClient), puis SendEmailToUser. |
| **CreateOccupants** | SessionID, PkUser, fkimmeuble | users | Session + checkImmeuble. Pour chaque occupant de l’immeuble : si pas UserExists(pkOccupant), ArchivePreviousUser puis InsertUser type O ; sinon GetUserByPKOccupant. Retourne la liste des users créés ou existants. |
| **CreateDirecteur** | SuperLoginID, SuperPassword, LoginID, UserName, FirstName, fk, type, PhoneNumber, Email, UserRole | bool | Super-admin, pas UserExists(LoginID). type = S/A/M, InsertUser avec fk client, SendEmailToUser. |
| **CreateOccupant** | SuperLoginID, SuperPassword, LoginID, UserName, FirstName, fk, PhoneNumber, Email | bool | Super-admin, InsertUser type O (fk = pkOccupant). |

---

### Export et seuils

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **GetExportParams** | SuperLoginID, SuperPassword, clientID | userExportParams | Récupère EXPORT_ONLYNEW, EXPORT_COLUMNHEADERS depuis WEB_USER (USERTYPE=C, FK=pkClient). |
| **SetSeuilConso** | SessionID, PkUser, ParamsFiltres | retour | Session puis UPDATE web_user avec ParamsString : SEUIL_CONSO_EF, SEUIL_CONSO_EC, SEUIL_CONSO_REPART, SEUIL_CONSO_CET, SEUIL_CONSO_ACTIF, SEUIL_CONSO_EMAIL. |

---

## Méthodes privées (internes)

| Méthode | Rôle |
|---------|------|
| **IsChildUser** | Vérifie que PkUserChild est géré par PkUser (même user ou C+G même FKClient). |
| **DeleteUser_Right** | DELETE web_user_right WHERE fkweb_user = PkUserChild. |
| **InsertUser_Right** | Reconstruit les droits à partir de ListImmeubles (séparateur \|), en ne gardant que les immeubles du parent. |
| **AddUser_Right** | INSERT web_user_right (FK=pkImmeuble, TYPER='I'). |
| **GeneratePwd** | Guid.NewGuid().ToString("N").Substring(0, 6). |
| **InsertUser** | Insert WEB_USER (LOGINID, USERNAME, FIRSTNAME, PASSWORD, PASSWORD_ENCRYPTED, USERTYPE, FKPARENTUSER, FK, FKCLIENT, EMAIL, PHONENUMBER, USERROLE). Refuse certains noms (VIDE, VIDE ORDRES, POUBELLE, KEBAB, FEMME DE MENAGE). Hash Oracle DBMS_CRYPTO. |
| **UserExists(string LoginID)** | Compte web_user où (EXPIRATIONDATE < sysdate OR NULL) et UPPER(LOGINID) = valeur. |
| **UserExists(int pkOccupant)** | Compte web_user USERTYPE='O' et FK = pkOccupant. |
| **ArchivePreviousUser** | Pour le logement de l’occupant, met EXPIRATIONDATE des O (datedepart &lt;= sysdate) à leur datedepart. |
| **GetPKClient** | SELECT pkclient FROM client WHERE id = clientID. |
| **GetOccupantsByImmeuble** | (Appelée depuis CreateOccupants ; peut être dans un autre partial.) |
| **checkImmeuble** | (Idem, autre partial.) |

---

## Tables et schéma LER

- **Schéma auth :** `Properties.Settings.Default.LER_AUTH_SchemaName` (ex. schéma des web_user).
- **Tables :**
  - `web_user` : PKWEB_USER, LOGINID, USERNAME, FIRSTNAME, PASSWORD, PASSWORD_ENCRYPTED, USERTYPE, FKPARENTUSER, FK, FKCLIENT, EMAIL, PHONENUMBER, USERROLE, EXPIRATIONDATE, CGU, PASSWORD_EXP_DATE, SEUIL_CONSO_*, LASTDATEEMAIL, etc.
  - `web_user_right` : PKWEB_USER_RIGHT, FK (pkimmeuble), TYPER ('I'), FKWEB_USER.
  - Selon `#if WS2` : **web_client**, **web_immeuble**, **web_occupant** vs **client**, **immeuble**, **occupant**.

---

## Sécurité et règles métier

1. **Session :** la plupart des méthodes « portail » vérifient `session.checkSession(SessionID, PkUser)`.
2. **Super-admin :** comparaison `(SuperLoginID == _SuperLoginID && SuperPassword == _SuperPassword)` ou login TECHNILOG.
3. **Hiérarchie :** un directeur (C) ne peut agir que sur ses gestionnaires (G) ou lui-même ; IsChildUser impose même FKClient pour C/G.
4. **Email :** unicité contrôlée avant UPDATE/Création ; en cas de changement, envoi d’email (SendEmailToUser).
5. **Mot de passe :** stockage hash Oracle (DBMS_CRYPTO.hash, type 4). Réinitialisation via token/salt dans l’URL (param LER ESPACECLIENT_RESETPASSWORDURL).

---

## Email envoyé (SendEmailToUser)

- **De :** espaceclient@techem.fr  
- **Sujet :** « Accès à l'espace client Techem »  
- **Contenu :** lien client.techem.fr, identifiant [LOGINID], bouton « Réinitialiser le mot de passe » [URL] (token + salt).  
- **Pièce jointe :** « Fiche administrateur Espace Client.pdf » (DataDirectory) si user admin (pas O ni G).

---

## Liens avec Main.asmx.cs

Les WebMethods suivants appellent directement les méthodes documentées ici :

- SetImmeubles, GetChildUsers, GetUser, DeleteUser, UpdateUser, UpdatePassword, CreateGestionnaire  
- GetUsers, GetUserByLogin, UpdateUser2, UpdateUser3, SendEmailToUser, UpdateExpirationDateFromPKUser, GetTchWeekPwd  
- ResetPasswordFromEmail, ResetPasswordFromPKUser, UpdateCGUFromPKUser, UpdateEmailFromPKUser  
- CreateOccupants, CreateDirecteur, CreateOccupant  
- GetExportParams (non utilisé côté WS), SetSeuilConso  

---

*Document généré à partir de l’analyse de `WS_Users.cs`. À croiser avec `Main.asmx.cs`, `WS_Common` (autres parties), `WS_DBUtils` et `WS_Utils` pour la wiki.*
