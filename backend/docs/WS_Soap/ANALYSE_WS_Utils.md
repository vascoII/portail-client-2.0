# Analyse — WS_Utils.cs

**Fichier :** `WS_Utils.cs`  
**Namespace :** `Techem.Webservices.WS_EspaceClient`  
**Type :** `static public partial class WS_Common`  
**Rôle :** Partie de `WS_Common` regroupant des **utilitaires** : chiffrement simple, mot de passe hebdo Techem, semaine ISO 8601, et helpers **métier** (fluides, types d’appareils, filtres SQL/Mongo).

---

## Vue d’ensemble

- Aucun **WebMethod** : toutes les méthodes sont utilisées en interne par le reste de `WS_Common` ou par d’autres partials.
- Deux régions : **tools** (chiffrement, mot de passe semaine, calendrier) et **METIER** (fluides, types d’appareils, filtres).
- Comme dans `WS_Users.cs`, une double branche **`#if WS2`** adapte les filtres SQL aux tables **web_compteur** vs **COMPTEUR** / **ARTICLE**.

---

## Dépendances

- **MongoDB.Bson** (BsonDocument, BsonArray)
- **Techem.DBUtils.Mongo** (Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE)
- **Tools** (extensions éventuelles)
- **System**, **System.Data**, **System.Collections**, **System.Globalization** (calendrier ISO)

---

## 1. Region « tools »

### Chiffrement / déchiffrement (custom)

| Méthode | Visibilité | Paramètres | Retour | Description |
|---------|------------|------------|--------|-------------|
| **Crypte** | private | string input | string | Encode chaque caractère : position paire → valeur hexadécimale + "J", position impaire → valeur octale + "J". Le résultat final est trimé des "J" en fin de chaîne. |
| **Decrypte** | public | string input | string | Décodage inverse : split sur "J", puis selon position paire (hex) ou impaire (octal) pour reconstruire la chaîne. En cas d’exception, retourne une chaîne (éventuellement partielle). |

**Usage :** Chiffrement léger interne (non cryptographique). Chaîne vide en entrée → chaîne vide en sortie.

---

### Mot de passe hebdo Techem

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **GetTchWeekPassword** | DateTime Date | string | Génère un mot de passe déterministe basé sur la **semaine ISO 8601** et l’**année**. Règle spéciale : si 1er janvier et jour &lt; 8, on utilise l’année précédente (éviter changement en cours de semaine 1). Construit une source `annee+sem` ou `sem+annee` selon parité de la semaine, puis convertit chaque chiffre en lettre (code ASCII 99 + (numSem % 4) + chiffre). Suffixe : `(numSem * 3) % 99` sur 2 chiffres. |
| **GetIso8601WeekOfYear** | DateTime time | int | Calendrier ISO 8601 : semaine commençant le **lundi**, semaine 1 = première semaine de l’année contenant un **jeudi**. Pour lun/mar/mer, on décale de +3 jours puis on utilise `Calendar.GetWeekOfYear` (FirstFourDayWeek, Monday). |

**Chaîne d’appel :** `Main.asmx` → `GetTchWeekPwd` (WS_Users) → **GetTchWeekPassword** (WS_Utils).

---

## 2. Region « METIER »

### Énumérations

| Enum | Valeurs | Usage |
|-----|---------|--------|
| **IndexTypeFk** | Default=0, Average=1, Min=2, Max=3 | Type d’index (fkindextype). |
| **UnitesFk** | Temperature=9, Humidite=10 | Unité (fkUnite). |

---

### Fluides (EC / EF)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **GetNomFluideByPk** | int PkCritere | string | 1 → "EC", 2 → "EF", sinon → "Autre fluide". |
| **GetFluidesFilter** | string Fluides | string | Construit une clause SQL pour filtrer par fluides. **Entrée :** chaîne contenant "EC" et/ou "EF" (normalisée en "+EC+" / "+EF+"). **WS2 :** `web_compteur.fluide in ('EC','EF')`. **Sinon :** `COMPTEUR.FKCRITERE in ('1','2')` (1=EC, 2=EF). Retourne chaîne vide si Fluides vide. |
| **GetFluidesFilter4Mongo** | string Fluides | FilterCriterias | Même logique pour **MongoDB** : retourne un `FilterCriterias` avec `key = Mongo_DBUtils.STRUCTURE.COMPTEUR_FKCRITERE` et `criteria` = 1 (EC), 2 (EF), ou `$in` [1,2]. Fluides vide → `FilterCriterias(string.Empty, null)`. |

---

### Type d’appareil (EC, EF, REPART, CET, CAPTEUR)

| Méthode | Paramètres | Retour | Description |
|---------|------------|--------|-------------|
| **GetTypeAppareilFilter** | string TypeAppareil | string | Retourne un fragment de clause SQL **AND** pour le type d’appareil. **WS2 :** `Web_compteur.FLUIDE = 'EC'|'EF'|'CET'|'CAPTEUR'`. **Sinon :** COMPTEUR.FKCRITERE=1|2 ou ARTICLE.FKSOUSFAMILLE=GetPkSousFamilleByTypeAppareil pour REPART/CET/CAPTEUR. |
| **GetTypeERCByTypeAppareil** | string TypeAppareil | string | EAU, EC, EF, EC+EF, EF+EC → "EAU" ; REPART → "REPARTITEUR" ; CET → "CET" ; sinon "inconnu". |
| **GetTypeAppareilByPkSF** | int pkSousFamille | string | 185 → "Repart", 86 → "CET", 241 → "CAPTEUR", sinon "inconnu". |
| **GetPkSousFamilleByTypeAppareil** | string TypeAppareil | int | REPART → 185, CET → 86, CAPTEUR → 241, sinon -1. |
| **GetUniteByTypeAppareil** | string TypeAppareil | string | EC/EF → "m3", REPART/CET → "U", CAPTEUR → "% ou C°", sinon "". |

---

### Structure FilterCriterias

```csharp
public struct FilterCriterias
{
    public string key;      // ex. COMPTEUR_FKCRITERE
    public object criteria; // ex. 1, 2, ou BsonDocument("$in", BsonArray(1,2))
}
```

Utilisée par **GetFluidesFilter4Mongo** pour construire des critères de requête MongoDB.

---

## Récapitulatif des constantes métier

| Élément | Valeurs |
|--------|---------|
| Fluides / critères | EC = 1 / FKCRITERE 1, EF = 2 / FKCRITERE 2 |
| Sous-familles (ARTICLE) | REPART = 185, CET = 86, CAPTEUR = 241 |
| Unités | m3 (eau), U (répartiteur/CET), % ou C° (capteur) |

---

## Liens avec le reste du projet

- **GetTchWeekPassword** : appelée par `WS_Users.GetTchWeekPwd` (elle-même exposée via `Main.asmx.GetTchWeekPwd`).
- **GetFluidesFilter** / **GetFluidesFilter4Mongo** : utilisables dans les requêtes LER (SQL) ou Mongo pour filtrer par type de fluide (EC/EF).
- **GetTypeAppareilFilter** : fragments SQL pour les requêtes par type d’appareil dans `WS_Common` (relevés, rapports, etc.).
- **GetNomFluideByPk**, **GetTypeERCByTypeAppareil**, **GetPkSousFamilleByTypeAppareil**, **GetUniteByTypeAppareil** : conversions pour affichage, paramétrage ou construction de requêtes.

---

## Note de sécurité

Le **chiffrement** `Crypte`/`Decrypte` est un encodage réversible simple (hex/octal + séparateur). Il ne constitue pas un chiffrement cryptographique robuste ; à réserver à un usage interne non sensible ou à remplacer par un mécanisme adapté si besoin (ex. AES, clés dédiées).

---

*Document généré à partir de l’analyse de `WS_Utils.cs`. À croiser avec `Main.asmx.cs`, `WS_Common` (autres parties), `WS_Users`, `WS_DBUtils` pour la wiki.*
