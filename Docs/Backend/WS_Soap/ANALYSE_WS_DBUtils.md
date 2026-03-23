# Analyse — WS_DBUtils.cs

**Fichier :** `WS_DBUtils.cs`  
**Namespace :** `Techem.Webservices.WS_EspaceClient`  
**Rôle :** Classe utilitaire statique qui centralise les accès aux bases de données et services externes utilisés par les Web Services.

---

## Vue d’ensemble

`WS_DBUtils` ne contient **aucune méthode métier** : elle fournit trois instances de connexion / clients, utilisées par `WS_Common` et les autres modules du WS (ex. `LER_PrintPlugin` dans `Main.asmx.cs`).

| Instance        | Type             | Usage principal                          |
|-----------------|------------------|------------------------------------------|
| `utils_LER`     | `LER_DBUtils2`   | Base SQL Server LER (données métier)     |
| `utils_Mongo`   | `Mongo_DBUtils`  | Base MongoDB                             |
| `utils_SF`      | `SF_DBUtils`     | API Salesforce (Cases, etc.)            |

L’environnement (prod vs test) est piloté par le paramètre **`baseTest`** dans les settings du projet.

---

## Dépendances

- **Techem.DBUtils.LER** → `LER_DBUtils2`
- **Techem.DBUtils.Mongo** → `Mongo_DBUtils`
- **Techem.DBUtils.SF** → `SF_DBUtils`
- **Techem.Tools.EncryptionDecryption** → `AsymetricEncryptionManager`

---

## Clé de chiffrement

- **`privateKey`** (readonly static) : clé RSA utilisée pour déchiffrer les chaînes de connexion et secrets stockés chiffrés dans `Properties.Settings`.
- Les credentials (connection strings, Client_id, Client_secret, etc.) sont déchiffrés à la volée dans les méthodes `get*()`.

---

## Instances exposées

### 1. `utils_LER` — LER_DBUtils2

- **Initialisation :** `getLER_DBUtils2()`
- **Paramètre d’environnement :** `Properties.Settings.Default.baseTest`
- **Settings utilisés :**
  - **Prod** (`baseTest = false`) : `LERConnectionStringEncrypted`
  - **Test/UAT** (`baseTest = true`) : `LERTESTConnectionStringEncrypted`
- Les chaînes sont déchiffrées via `AsymetricEncryptionManager.Decrypt(..., privateKey)`.
- Utilisé pour toute la logique métier liée à la base LER (utilisateurs, immeubles, logements, sessions, etc.).

---

### 2. `utils_Mongo` — Mongo_DBUtils

- **Initialisation :** `getMongo_DBUtils()`
- **Paramètre d’environnement :** `Properties.Settings.Default.baseTest`
- **Settings utilisés :**
  - **Prod** : `MongoConnectionStringEncrypted`
  - **Test/UAT** : `MongoTESTConnectionStringEncrypted`
- Utilisé pour les données stockées dans MongoDB (à préciser selon le reste du code, ex. rapports, index…).

---

### 3. `utils_SF` — SF_DBUtils

- **Initialisation :** `getSF_DBUtils()`
- **Paramètre d’environnement :** `Properties.Settings.Default.baseTest`
- **Settings utilisés (tous déchiffrés avec `privateKey`) :**

| Environnement | Settings |
|---------------|----------|
| **Prod**      | `Client_idPROD`, `Client_secretPROD`, `UsernamePROD`, `PasswordPROD`, `TokenRequestEndpointURLPROD` |
| **UAT/Test**  | `Client_idUAT`, `Client_secretUAT`, `UsernameUAT`, `PasswordUAT`, `TokenRequestEndpointURLUAT` |

- Le constructeur de `SF_DBUtils` reçoit : `Client_id`, `Client_secret`, `Username`, `Password`, `TokenRequestEndpointURL`.
- Utilisé pour les appels Salesforce (ex. `getCase` dans `Main.asmx.cs`).

---

## Schéma de flux

```
Main.asmx / WS_Common
        │
        ├── WS_DBUtils.utils_LER   ──► Base LER (SQL Server)
        ├── WS_DBUtils.utils_Mongo ──► MongoDB
        └── WS_DBUtils.utils_SF   ──► API Salesforce (OAuth + TokenRequestEndpointURL)
```

---

## Points utiles pour la wiki

1. **Un seul point d’entrée** pour les 3 backends : toute la configuration (prod/test, chiffrement) est centralisée ici.
2. **Sécurité :** les chaînes sensibles sont stockées chiffrées dans les settings et déchiffrées avec une clé RSA (ne pas exposer `privateKey` ni les settings en clair).
3. **Référence dans le code :** dans `Main.asmx.cs`, `LER_PrintPlugin.Init(WS_DBUtils.utils_LER, WS_DBUtils.utils_SF, WS_DBUtils.utils_Mongo)` montre que les rapports s’appuient sur LER, SF et Mongo.

---

*Document généré à partir de l’analyse de `WS_DBUtils.cs`. À croiser avec `WS_Common.cs`, `WS_Users` et `WS_Utils` pour la vue d’ensemble des WS.*
