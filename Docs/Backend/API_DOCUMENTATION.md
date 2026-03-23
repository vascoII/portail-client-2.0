# Documentation API - Techem Portail Client

## Table des matières

1. [Introduction](#introduction)
2. [Authentification](#authentification)
3. [Format des réponses](#format-des-réponses)
4. [Codes de statut HTTP](#codes-de-statut-http)
5. [Endpoints par catégorie](#endpoints-par-catégorie)
   - [Sécurité](#sécurité)
   - [Front](#front)
   - [Tableau de bord](#tableau-de-bord)
   - [Immeubles](#immeubles)
   - [Gestion du parc](#gestion-du-parc)
   - [Logements](#logements)
   - [Occupants](#occupants)
   - [Factures](#factures)
   - [Interventions](#interventions)
   - [Tickets](#tickets)
   - [Opérateurs](#opérateurs)
   - [Recherche](#recherche)
6. [Exemples d'utilisation](#exemples-dutilisation)

---

## Introduction

Cette API REST permet d'accéder aux fonctionnalités du portail client Techem. Tous les endpoints sont préfixés par `/api` et retournent des réponses au format JSON.

**Base URL**: `https://votre-domaine.com/api`

---

## Authentification

L'API utilise l'authentification par session Symfony. Pour s'authentifier :

1. **Connexion standard** : Utilisez l'authenticator Symfony sur la route `app_login` (POST avec `_username` et `_password`)
2. **Connexion via paramètre** : Utilisez l'endpoint `/api/security/login/{param}` pour les liens de connexion spéciaux

Tous les endpoints (sauf `/api/security/login/{param}` et `/api/security/reset-password`) nécessitent une session valide.

---

## Format des réponses

### Réponse de succès

```json
{
  "success": true,
  "status": 200,
  "message": "Message optionnel",
  "data": {
    // Données de la réponse
  }
}
```

### Réponse d'erreur

```json
{
  "success": false,
  "status": 400,
  "message": "Message d'erreur",
  "errors": [
    // Tableau d'erreurs détaillées (optionnel)
  ]
}
```

---

## Codes de statut HTTP

- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès interdit
- `404` : Ressource non trouvée
- `500` : Erreur serveur

---

## Endpoints par catégorie

## Sécurité

### POST /api/security/logout
Déconnexion de l'utilisateur.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Logout successful"
}
```

### POST /api/security/reset-password
Réinitialiser le mot de passe via email.

**Body**:
```json
{
  "email": "user@example.com"
}
```

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Password reset email sent successfully"
}
```

### PUT /api/security/update-password
Mettre à jour le mot de passe de l'utilisateur connecté.

**Body**:
```json
{
  "password": {
    "first": "newpassword123",
    "second": "newpassword123"
  }
}
```

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Password updated successfully"
}
```

### GET /api/security/me
Obtenir les informations de l'utilisateur connecté.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "user": {
      "PKUser": "123",
      "UserName": "Dupont",
      "EMail": "user@example.com",
      ...
    },
    "roles": ["ROLE_USER", "ROLE_GESTIONNAIRE"]
  }
}
```

### GET /api/security/check
Vérifier le statut d'authentification.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "authenticated": true,
    "user": {...},
    "roles": [...]
  }
}
```

### GET /api/security/login/{param}
Connexion via paramètre (liens spéciaux).

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Login successful",
  "data": {
    "user": {...},
    "roles": [...],
    "session_id": "..."
  }
}
```

---

## Front

### GET /api/me
Obtenir les informations de l'utilisateur connecté (alias de `/api/security/me`).

### GET /api/legal-notices
Obtenir les mentions légales.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "content": "..."
  }
}
```

### GET /api/personal-datas
Obtenir les informations sur les données personnelles.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "sousTraitants": [...]
  }
}
```

### GET /api/cgu/status
Vérifier le statut d'acceptation des CGU.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "cguAccepted": true
  }
}
```

### POST /api/cgu/accept
Accepter les CGU.

**Body**:
```json
{
  "email": "user@example.com",
  "email_confirm": "user@example.com",
  "valid_cgu": true
}
```

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "CGU accepted successfully"
}
```

### GET /api/dashboard
Obtenir le tableau de bord (alias de `/api/dashboard`).

---

## Tableau de bord

### GET /api/dashboard
Obtenir les données du tableau de bord client.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "board": {
      "NbCompteursPoses": 100,
      "NbCompteursCommandes": 150,
      ...
    },
    "chantier": {
      "installed": 100,
      "installed_percent": 66,
      "remaining": 50,
      "remaining_percent": 33,
      "total": 150,
      "date": null
    }
  }
}
```

### GET /api/dashboard/intervention
Télécharger un rapport d'intervention (PDF ou Excel).

**Paramètres**:
- `doc-type` (requis) : `synthese-inte`, `detail-inte`, ou `detail-excel-inte`
- `date-begin` (requis) : Date de début au format `d/m/Y` (ex: `01/01/2024`)
- `date-end` (requis) : Date de fin au format `d/m/Y` (ex: `31/12/2024`)

**Exemple**:
```
GET /api/dashboard/intervention?doc-type=synthese-inte&date-begin=01/01/2024&date-end=31/12/2024
```

**Réponse**: Fichier PDF ou Excel binaire

---

## Immeubles

### GET /api/immeubles
Obtenir la liste des immeubles.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "board": {...},
    "filters": [],
    "gestion": false
  }
}
```

### GET /api/immeubles/filtre
Filtrer les immeubles.

**Paramètres**:
- `ref` : Référence
- `ref_numero` : Numéro de référence
- `nom` : Nom
- `tout` : Recherche globale
- `adresse` : Adresse (code postal + ville)
- `search` : Activer la recherche

**Exemple**:
```
GET /api/immeubles/filtre?nom=Paris&search=1
```

### GET /api/immeubles/{pkImmeuble}
Obtenir les détails d'un immeuble.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "immeuble": {...},
    "evolution_charts_js": {...},
    "comparative_chart_js": {...},
    "tabs_top_consos": [...],
    "tabs_evo_consos": [...],
    "chantier": {...}
  }
}
```

### GET /api/immeubles/{pkImmeuble}/interventions
Obtenir la liste des interventions d'un immeuble.

### GET /api/immeubles/{pkImmeuble}/interventions/{pkIntervention}
Obtenir les détails d'une intervention.

### GET /api/immeubles/{pkImmeuble}/fuites
Obtenir la liste des fuites d'un immeuble.

### GET /api/immeubles/{pkImmeuble}/anomalies
Obtenir la liste des anomalies d'un immeuble.

### GET /api/immeubles/{pkImmeuble}/dysfonctionnements
Obtenir la liste des dysfonctionnements d'un immeuble.

### GET /api/immeubles/{pkImmeuble}/releve/{type}/{energie}
Télécharger un relevé (PDF).

**Paramètres**:
- `type` : Type de relevé
- `energie` : Type d'énergie
- `date` (POST) : Date du relevé

### GET /api/immeubles/{pkImmeuble}/anomalies/export
Exporter les anomalies en Excel.

### GET /api/immeubles/{pkImmeuble}/fuites/export
Exporter les fuites en Excel.

### GET /api/immeubles/{pkImmeuble}/interventions/export
Exporter les interventions en Excel.

### GET /api/immeubles/{pkImmeuble}/dysfonctionnements/export
Exporter les dysfonctionnements en Excel.

### GET /api/immeubles/{pkImmeuble}/intervention
Télécharger un rapport d'intervention pour un immeuble.

**Paramètres**:
- `doc-type` : `synthese-inte`, `detail-inte`, ou `detail-excel-inte`
- `date-begin` : Date de début (format: `d/m/Y`)
- `date-end` : Date de fin (format: `d/m/Y`)

---

## Gestion du parc

### GET /api/gestion-parc
Obtenir la liste des immeubles du parc.

### GET /api/gestion-parc/filtre
Filtrer les immeubles du parc (même format que `/api/immeubles/filtre`).

### GET /api/gestion-parc/{pkImmeuble}
Obtenir les détails d'un immeuble du parc.

### GET /api/gestion-parc/{pkImmeuble}/interventions
Obtenir la liste des interventions.

### GET /api/gestion-parc/{pkImmeuble}/interventions/{pkIntervention}
Obtenir les détails d'une intervention.

### GET /api/gestion-parc/{pkImmeuble}/fuites
Obtenir la liste des fuites.

### GET /api/gestion-parc/{pkImmeuble}/anomalies
Obtenir la liste des anomalies.

### GET /api/gestion-parc/{pkImmeuble}/dysfonctionnements
Obtenir la liste des dysfonctionnements.

### GET /api/gestion-parc/{pkImmeuble}/releve/{type}/{energie}
Télécharger un relevé (PDF).

### GET /api/gestion-parc/{pkImmeuble}/anomalies/export
Exporter les anomalies en Excel.

### GET /api/gestion-parc/{pkImmeuble}/fuites/export
Exporter les fuites en Excel.

### GET /api/gestion-parc/{pkImmeuble}/interventions/export
Exporter les interventions en Excel.

### GET /api/gestion-parc/{pkImmeuble}/dysfonctionnements/export
Exporter les dysfonctionnements en Excel.

### GET /api/gestion-parc/{pkImmeuble}/intervention
Télécharger un rapport d'intervention.

---

## Logements

### GET /api/logements/immeuble/{pkImmeuble}
Obtenir la liste des logements d'un immeuble.

### GET /api/logements/{pkLogement}
Obtenir les détails d'un logement.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "logement": {...},
    "ticketOwner": {...},
    "nbTickets": 3,
    "consoTabs": [...],
    "changeinprogress": false,
    "occupant": {...}
  }
}
```

### POST /api/logements/{pkLogement}/tickets
Créer un ticket d'intervention pour un logement.

**Body** (multipart/form-data):
```
intervention[pkLogement]: 12345
intervention[name]: Jean Dupont
intervention[email]: jean@example.com
intervention[phone]: 0123456789
intervention[mobile]: 0612345678
intervention[message]: Message de la demande
intervention[attachment]: (fichier optionnel)
```

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Demande d'intervention envoyée",
  "data": {
    "nbTickets": 1,
    "pkLogement": "12345"
  }
}
```

### GET /api/logements/{pkLogement}/ticket-owner
Obtenir les informations du propriétaire du ticket.

### GET /api/logements/search
Rechercher des logements.

### GET /api/logements/{pkLogement}/appareils/{type}
Obtenir les informations des appareils d'un logement.

**Paramètres**:
- `type` : `eau` ou `chauffage`

### PUT /api/logements/{pkLogement}/occupant
Mettre à jour les informations de l'occupant.

**Body**:
```json
{
  "nom": "Dupont",
  "email": "dupont@example.com",
  "phone": "0123456789",
  "mobile": "0612345678"
}
```

### GET /api/logements/{pkLogement}/releve-repart
Télécharger le relevé de répartition (PDF).

### GET /api/logements/{pkLogement}/interventions
Obtenir la liste des interventions d'un logement.

### GET /api/logements/{pkLogement}/interventions/{pkIntervention}
Obtenir les détails d'une intervention.

### GET /api/logements/{pkLogement}/fuites
Obtenir la liste des fuites d'un logement.

**Paramètres**:
- `appareil` (optionnel) : Filtrer par appareil

### GET /api/logements/{pkLogement}/anomalies
Obtenir la liste des anomalies d'un logement.

**Paramètres**:
- `appareil` (optionnel) : Filtrer par appareil

### GET /api/logements/{pkLogement}/dysfonctionnements
Obtenir la liste des dysfonctionnements d'un logement.

### GET /api/logements/filter
Filtrer les logements.

**Paramètres**:
- `ref`, `ref_numero`, `nom`, `tout`, `adresse` : Filtres de recherche
- `pkImmeuble` : ID de l'immeuble (-1 pour tous)
- `search` : Activer la recherche
- `gestion` : Mode gestion

### GET /api/logements/immeuble/{pkImmeuble}/export
Exporter les logements d'un immeuble en Excel.

### GET /api/logements/{pkLogement}/anomalies/export
Exporter les anomalies d'un logement en Excel.

### GET /api/logements/{pkLogement}/fuites/export
Exporter les fuites d'un logement en Excel.

### GET /api/logements/{pkLogement}/interventions/export
Exporter les interventions d'un logement en Excel.

### GET /api/logements/{pkLogement}/dysfonctionnements/export
Exporter les dysfonctionnements d'un logement en Excel.

### GET /api/logements/guide
Télécharger le guide PDF.

### POST /api/logements/immeuble/{pkImmeuble}/tickets
Créer un ticket depuis un immeuble.

---

## Occupants

### GET /api/occupant
Obtenir les détails du logement de l'occupant connecté.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "logement": {...},
    "consoTabs": [...],
    "soustraitants": [...]
  }
}
```

### GET /api/occupant/simulateur
Obtenir les données du simulateur.

### GET /api/occupant/interventions
Obtenir la liste des interventions de l'occupant.

### GET /api/occupant/interventions/{pkIntervention}
Obtenir les détails d'une intervention.

### GET /api/occupant/fuites
Obtenir la liste des fuites.

**Paramètres**:
- `appareil` (optionnel) : Filtrer par appareil

### GET /api/occupant/anomalies
Obtenir la liste des anomalies.

**Paramètres**:
- `appareil` (optionnel) : Filtrer par appareil

### GET /api/occupant/dysfonctionnements
Obtenir la liste des dysfonctionnements.

### GET /api/occupant/anomalies/export
Exporter les anomalies en CSV.

### GET /api/occupant/fuites/export
Exporter les fuites en CSV.

### GET /api/occupant/interventions/export
Exporter les interventions en CSV.

### GET /api/occupant/dysfonctionnements/export
Exporter les dysfonctionnements en CSV.

### GET /api/occupant/{pkOccupant}/releve-eau
Télécharger le relevé eau (PDF).

### GET /api/occupant/{pkOccupant}/releve-repart/{pkImmeuble}
Télécharger le relevé de répartition (PDF).

### GET /api/occupant/{pkOccupant}/releve-note/{pkImmeuble}/{energie}
Télécharger la note de relevé (PDF).

**Paramètres**:
- `energie` : `CHAUFFAGE` ou `EAU`

### GET /api/occupant/my-account
Obtenir les informations du compte.

### GET /api/occupant/alertes
Obtenir la configuration des alertes.

### POST /api/occupant/alertes
Mettre à jour la configuration des alertes.

**Body**:
```json
{
  "SEUIL_CONSO_ACTIF": true,
  "SEUIL_CONSO_EF": 100,
  "SEUIL_CONSO_EC": 100,
  ...
}
```

---

## Factures

### GET /api/factures
Obtenir la liste des factures.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "factures": [...]
  }
}
```

### GET /api/factures/{pkFacture}
Obtenir les détails d'une facture.

### GET /api/factures/{pkFacture}/download
Télécharger une facture (PDF).

---

## Interventions

### GET /api/interventions/{pkDepannage}/report
Télécharger le rapport d'une intervention (PDF).

---

## Tickets

### GET /api/tickets
Obtenir la liste des tickets.

**Paramètres**:
- `showAll` (optionnel) : Afficher tous les tickets

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "board": {...},
    "tickets": [
      {
        "Nom": "M. Dupont",
        "Email": "dupont@example.com",
        "TicketDate": "2025-05-20T19:22:34",
        "Statut": "Nouveau",
        "FkLogement": "1165420",
        ...
      }
    ],
    "count": 5,
    "showAll": false
  }
}
```

### GET /api/tickets/menu
Obtenir les statistiques des tickets.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "isTicketInterEnabled": true,
    "nbTicketsInterUser": 5
  }
}
```

### GET /api/tickets/create/{pkLogement}
Obtenir les informations pour créer un ticket.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "ticketOwner": {...},
    "formData": {
      "pkLogement": 12345,
      "name": "Jean Dupont",
      "email": "jean@example.com",
      "phone": "0123456789",
      "mobile": "0612345678"
    }
  }
}
```

### POST /api/tickets/{pkTicket}/close
Fermer un ticket.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "message": "Ticket closed successfully"
}
```

### GET /api/tickets/{pkTicket}/attachment
Obtenir une pièce jointe d'un ticket.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "attachmentName": "photo.jpg",
    "attachmentContent": "base64_encoded_content..."
  }
}
```

---

## Opérateurs

### GET /api/operators
Obtenir la liste de tous les gestionnaires.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "users": [...]
  }
}
```

### POST /api/operators
Créer un nouveau gestionnaire.

**Body**:
```json
{
  "job": "Gestionnaire",
  "lastname": "Dupont",
  "firstname": "Jean",
  "phone": "0123456789",
  "email": {
    "first": "jean.dupont@example.com",
    "second": "jean.dupont@example.com"
  }
}
```

### GET /api/operators/statistiques
Obtenir les statistiques des occupants.

### GET /api/operators/{id}
Obtenir les détails d'un gestionnaire.

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "user": {...},
    "immeubles": [...],
    "diffImmeubles": [...]
  }
}
```

### PUT /api/operators/{id}
Modifier un gestionnaire.

**Body**:
```json
{
  "job": "Gestionnaire",
  "lastname": "Dupont",
  "firstname": "Jean",
  "phone": "0123456789",
  "email": "jean.dupont@example.com"
}
```

### PUT /api/operators/{id}/password
Modifier le mot de passe d'un gestionnaire.

**Body**:
```json
{
  "password": {
    "first": "newpassword123",
    "second": "newpassword123"
  }
}
```

### POST /api/operators/{id}/immeubles
Ajouter des immeubles à un gestionnaire.

**Body**:
```json
{
  "immeubles": [1, 2, 3],
  "all": false
}
```

### DELETE /api/operators/{id}/immeubles
Retirer des immeubles d'un gestionnaire.

**Body**:
```json
{
  "immeubles": [1, 2],
  "all": false
}
```

### DELETE /api/operators/{id}
Supprimer un gestionnaire.

---

## Recherche

### GET /api/search
Recherche unifiée pour immeubles ou occupants.

**Paramètres**:
- `type` (requis) : `immeuble` ou `occupant`
- `nom` : Nom (minimum 3 caractères)
- `tout` : Recherche globale (minimum 3 caractères)
- `adresse` : Adresse (minimum 3 caractères)
- `ref` : Référence (minimum 1 caractère)
- `ref_numero` : Numéro de référence (minimum 1 caractère)
- `pkImmeuble` : ID de l'immeuble (pour les occupants, optionnel)

**Exemples**:
```
GET /api/search?type=immeuble&nom=Paris
GET /api/search?type=occupant&ref=OCC001
GET /api/search?type=occupant&pkImmeuble=123&nom=Jean
```

**Réponse**:
```json
{
  "success": true,
  "status": 200,
  "data": {
    "type": "immeuble",
    "filters": {
      "nom": "Paris"
    },
    "results": [...],
    "count": 5
  }
}
```

---

## Exemples d'utilisation

### Exemple 1 : Authentification et récupération du profil

```bash
# 1. Connexion (via l'authenticator Symfony)
POST /app_login
Content-Type: application/x-www-form-urlencoded

_username=user@example.com&_password=password123

# 2. Vérifier l'authentification
GET /api/security/check

# 3. Obtenir les informations de l'utilisateur
GET /api/security/me
```

### Exemple 2 : Recherche d'immeubles

```bash
# Rechercher des immeubles par nom
GET /api/search?type=immeuble&nom=Paris

# Filtrer les immeubles
GET /api/immeubles/filtre?nom=Paris&search=1
```

### Exemple 3 : Créer un ticket d'intervention

```bash
POST /api/logements/12345/tickets
Content-Type: multipart/form-data

intervention[pkLogement]=12345
intervention[name]=Jean Dupont
intervention[email]=jean@example.com
intervention[phone]=0123456789
intervention[mobile]=0612345678
intervention[message]=Demande d'intervention pour vérification du compteur
intervention[attachment]=@photo.jpg
```

### Exemple 4 : Exporter des données

```bash
# Exporter les anomalies d'un logement
GET /api/logements/12345/anomalies/export

# Exporter les interventions d'un immeuble
GET /api/immeubles/67890/interventions/export
```

### Exemple 5 : Gestion des opérateurs

```bash
# Créer un gestionnaire
POST /api/operators
Content-Type: application/json

{
  "job": "Gestionnaire",
  "lastname": "Dupont",
  "firstname": "Jean",
  "phone": "0123456789",
  "email": {
    "first": "jean.dupont@example.com",
    "second": "jean.dupont@example.com"
  }
}

# Ajouter des immeubles à un gestionnaire
POST /api/operators/123/immeubles
Content-Type: application/json

{
  "immeubles": [1, 2, 3]
}
```

### Exemple 6 : Télécharger un rapport PDF

```bash
# Rapport d'intervention
GET /api/dashboard/intervention?doc-type=synthese-inte&date-begin=01/01/2024&date-end=31/12/2024

# Relevé de répartition
GET /api/logements/12345/releve-repart
```

---

## Notes importantes

1. **Authentification** : Tous les endpoints (sauf ceux de sécurité publique) nécessitent une session valide
2. **Format des dates** : Les dates doivent être au format `d/m/Y` (ex: `01/01/2024`)
3. **Upload de fichiers** : Utilisez `multipart/form-data` pour les uploads
4. **Exports** : Les exports Excel/CSV sont retournés directement en binaire
5. **PDF** : Les PDF sont retournés directement en binaire avec les headers appropriés
6. **Mode démo** : Certains endpoints retournent des données de démonstration si le fichier `demo.txt` existe
7. **Normalisation** : Toutes les réponses JSON sont normalisées (objets convertis en tableaux)

---

## Gestion des erreurs

Toutes les erreurs suivent le format standard :

```json
{
  "success": false,
  "status": 400,
  "message": "Message d'erreur",
  "errors": [
    "Erreur détaillée 1",
    "Erreur détaillée 2"
  ]
}
```

### Erreurs courantes

- **401 Unauthorized** : Session expirée ou invalide
- **403 Forbidden** : Accès interdit
- **404 Not Found** : Ressource non trouvée
- **400 Bad Request** : Données invalides ou paramètres manquants
- **500 Internal Server Error** : Erreur serveur

---

## Support

Pour toute question ou problème, contactez l'équipe de développement.

