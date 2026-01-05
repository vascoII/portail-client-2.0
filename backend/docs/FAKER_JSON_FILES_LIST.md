# Liste des Fichiers JSON pour le Faker API

Ce document liste tous les fichiers JSON nécessaires pour le système de faker API, basés sur les endpoints GET identifiés dans les contrôleurs API. Ces fichiers doivent être placés dans le répertoire `public/data/api/`.

## Fichiers JSON à Créer

### `TableauBordClientApiController.php` (`/api/parc`)
- `api.parc.json` (pour `#[Route("", name: "index", methods: ["GET"])]`)
- `api.parc.intervention.json` (pour `#[Route("/intervention", name: "intervention", methods: ["GET"])]`)

### `FactureApiController.php` (`/api/factures`)
- `api.factures.json` (pour `#[Route("", name: "list", methods: ["GET"])]`)
- `api.factures.{pkFacture}.json` (pour `#[Route("/{pkFacture}", name: "show", methods: ["GET"])]`)
- `api.factures.{pkFacture}.download.json` (pour `#[Route("/{pkFacture}/download", name: "download", methods: ["GET"])]`)

### `SecurityApiController.php` (`/api/security`)
- `api.security.login.{param}.json` (pour `#[Route("/login/{param}", name: "login_from_param", methods: ["GET"])]`)
- `api.security.me.json` (pour `#[Route("/me", name: "me", methods: ["GET"])]`)

### `OccupantApiController.php` (`/api/occupant`)
- `api.occupant.json` (pour `#[Route("", name: "show", methods: ["GET"])]`)
- `api.occupant.simulateur.json` (pour `#[Route("/simulateur", name: "simulateur", methods: ["GET"])]`)
- `api.occupant.interventions.{pkIntervention}.json` (pour `#[Route("/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]`)
- `api.occupant.interventions.json` (pour `#[Route("/interventions", name: "list_interventions", methods: ["GET"])]`)
- `api.occupant.fuites.json` (pour `#[Route("/fuites", name: "list_leaks", methods: ["GET"])]`)
- `api.occupant.dysfonctionnements.json` (pour `#[Route("/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]`)
- `api.occupant.anomalies.json` (pour `#[Route("/anomalies", name: "list_anomalies", methods: ["GET"])]`)
- `api.occupant.anomalies.export.json` (pour `#[Route("/anomalies/export", name: "export_anomalies", methods: ["GET"])]`)
- `api.occupant.fuites.export.json` (pour `#[Route("/fuites/export", name: "export_leaks", methods: ["GET"])]`)
- `api.occupant.interventions.export.json` (pour `#[Route("/interventions/export", name: "export_interventions", methods: ["GET"])]`)
- `api.occupant.dysfonctionnements.export.json` (pour `#[Route("/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]`)
- `api.occupant.{pkOccupant}.releve-eau.json` (pour `#[Route("/{pkOccupant}/releve-eau", name: "releve_eau", methods: ["GET"])]`)
- `api.occupant.{pkOccupant}.releve-repart.{pkImmeuble}.json` (pour `#[Route("/{pkOccupant}/releve-repart/{pkImmeuble}", name: "releve_repart", methods: ["GET"])]`)
- `api.occupant.{pkOccupant}.releve-note.{pkImmeuble}.{energie}.json` (pour `#[Route("/{pkOccupant}/releve-note/{pkImmeuble}/{energie}", name: "releve_note", methods: ["GET"])]`)
- `api.occupant.my-account.json` (pour `#[Route("/my-account", name: "my_account", methods: ["GET", "POST"])]` - GET part)
- `api.occupant.alertes.json` (pour `#[Route("/alertes", name: "alertes", methods: ["GET", "POST"])]` - GET part)

### `InterventionApiController.php` (`/api/interventions`)
- `api.interventions.{pkDepannage}.report.json` (pour `#[Route("/{pkDepannage}/report", name: "report", methods: ["GET"])]`)

### `GestionParcApiController.php` (`/api/gestion-parc`)
- `api.gestion-parc.json` (pour `#[Route("", name: "index", methods: ["GET"])]`)
- `api.gestion-parc.filtre.json` (pour `#[Route("/filtre", name: "filter", methods: ["GET", "POST"])]` - GET part)
- `api.gestion-parc.{pkImmeuble}.json` (pour `#[Route("/{pkImmeuble}", name: "show", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.interventions.{pkIntervention}.json` (pour `#[Route("/{pkImmeuble}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.interventions.json` (pour `#[Route("/{pkImmeuble}/interventions", name: "list_interventions", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.fuites.json` (pour `#[Route("/{pkImmeuble}/fuites", name: "list_leaks", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.anomalies.json` (pour `#[Route("/{pkImmeuble}/anomalies", name: "list_anomalies", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.dysfonctionnements.json` (pour `#[Route("/{pkImmeuble}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.releve.{type}.{energie}.json` (pour `#[Route("/{pkImmeuble}/releve/{type}/{energie}", name: "report", methods: ["GET", "POST"])]` - GET part)
- `api.gestion-parc.{pkImmeuble}.anomalies.export.json` (pour `#[Route("/{pkImmeuble}/anomalies/export", name: "export_anomalies", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.fuites.export.json` (pour `#[Route("/{pkImmeuble}/fuites/export", name: "export_leaks", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.interventions.export.json` (pour `#[Route("/{pkImmeuble}/interventions/export", name: "export_interventions", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.dysfonctionnements.export.json` (pour `#[Route("/{pkImmeuble}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]`)
- `api.gestion-parc.{pkImmeuble}.intervention.json` (pour `#[Route("/{pkImmeuble}/intervention", name: "intervention_report", methods: ["GET"])]`)

### `FrontApiController.php` (`/api`)
- `api.me.json` (pour `#[Route("/me", name: "me", methods: ["GET"])]`)
- `api.legal-notices.json` (pour `#[Route("/legal-notices", name: "legal_notices", methods: ["GET"])]`)
- `api.personal-datas.json` (pour `#[Route("/personal-datas", name: "personal_datas", methods: ["GET"])]`)
- `api.cgu.status.json` (pour `#[Route("/cgu/status", name: "cgu_status", methods: ["GET"])]`)
- `api.dashboard.json` (pour `#[Route("/dashboard", name: "dashboard", methods: ["GET"])]`)

### `OperatorApiController.php` (`/api/operators`)
- `api.operators.json` (pour `#[Route("", name: "index", methods: ["GET"])]`)
- `api.operators.statistiques.json` (pour `#[Route("/statistiques", name: "stats_occupants", methods: ["GET"])]`)
- `api.operators.{id}.json` (pour `#[Route("/{id}", name: "view", methods: ["GET"])]`)

### `ImmeubleApiController.php` (`/api/immeubles`)
- `api.immeubles.json` (pour `#[Route("", name: "index", methods: ["GET"])]`)
- `api.immeubles.filtre.json` (pour `#[Route("/filtre", name: "filter", methods: ["GET", "POST"])]` - GET part)
- `api.immeubles.{pkImmeuble}.json` (pour `#[Route("/{pkImmeuble}", name: "show", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.interventions.{pkIntervention}.json` (pour `#[Route("/{pkImmeuble}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.interventions.json` (pour `#[Route("/{pkImmeuble}/interventions", name: "list_interventions", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.fuites.json` (pour `#[Route("/{pkImmeuble}/fuites", name: "list_leaks", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.anomalies.json` (pour `#[Route("/{pkImmeuble}/anomalies", name: "list_anomalies", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.dysfonctionnements.json` (pour `#[Route("/{pkImmeuble}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.releve.{type}.{energie}.json` (pour `#[Route("/{pkImmeuble}/releve/{type}/{energie}", name: "report", methods: ["GET", "POST"])]` - GET part)
- `api.immeubles.{pkImmeuble}.anomalies.export.json` (pour `#[Route("/{pkImmeuble}/anomalies/export", name: "export_anomalies", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.fuites.export.json` (pour `#[Route("/{pkImmeuble}/fuites/export", name: "export_leaks", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.interventions.export.json` (pour `#[Route("/{pkImmeuble}/interventions/export", name: "export_interventions", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.dysfonctionnements.export.json` (pour `#[Route("/{pkImmeuble}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]`)
- `api.immeubles.{pkImmeuble}.intervention.json` (pour `#[Route("/{pkImmeuble}/intervention", name: "intervention_report", methods: ["GET"])]`)

### `LogementApiController.php` (`/api/logements`)
- `api.logements.immeuble.{pkImmeuble}.json` (pour `#[Route("/immeuble/{pkImmeuble}", name: "index", methods: ["GET"])]`)
- `api.logements.{pkLogement}.ticket-owner.json` (pour `#[Route("/{pkLogement}/ticket-owner", name: "ticket_owner", methods: ["GET", "POST"])]` - GET part)
- `api.logements.search.json` (pour `#[Route("/search", name: "search", methods: ["GET"])]`)
- `api.logements.{pkLogement}.appareils.{type}.json` (pour `#[Route("/{pkLogement}/appareils/{type}", name: "infos_appareils", methods: ["GET"])]`)
- `api.logements.{pkLogement}.json` (pour `#[Route("/{pkLogement}", name: "show", methods: ["GET"])]`)
- `api.logements.{pkLogement}.releve-repart.json` (pour `#[Route("/{pkLogement}/releve-repart", name: "releve_repart", methods: ["GET", "POST"])]` - GET part)
- `api.logements.{pkLogement}.interventions.{pkIntervention}.json` (pour `#[Route("/{pkLogement}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]`)
- `api.logements.{pkLogement}.interventions.json` (pour `#[Route("/{pkLogement}/interventions", name: "list_interventions", methods: ["GET"])]`)
- `api.logements.filter.json` (pour `#[Route("/filter", name: "filter", methods: ["GET", "POST"])]` - GET part)
- `api.logements.{pkLogement}.fuites.json` (pour `#[Route("/{pkLogement}/fuites", name: "list_leaks", methods: ["GET"])]`)
- `api.logements.{pkLogement}.dysfonctionnements.json` (pour `#[Route("/{pkLogement}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]`)
- `api.logements.{pkLogement}.anomalies.json` (pour `#[Route("/{pkLogement}/anomalies", name: "list_anomalies", methods: ["GET"])]`)
- `api.logements.immeuble.{pkImmeuble}.export.json` (pour `#[Route("/immeuble/{pkImmeuble}/export", name: "export", methods: ["GET"])]`)
- `api.logements.{pkLogement}.anomalies.export.json` (pour `#[Route("/{pkLogement}/anomalies/export", name: "export_anomalies", methods: ["GET"])]`)
- `api.logements.{pkLogement}.fuites.export.json` (pour `#[Route("/{pkLogement}/fuites/export", name: "export_leaks", methods: ["GET"])]`)
- `api.logements.{pkLogement}.interventions.export.json` (pour `#[Route("/{pkLogement}/interventions/export", name: "export_interventions", methods: ["GET"])]`)
- `api.logements.{pkLogement}.dysfonctionnements.export.json` (pour `#[Route("/{pkLogement}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]`)
- `api.logements.guide.json` (pour `#[Route("/guide", name: "guide", methods: ["GET"])]`)
- `api.tickets.create.{pkLogement}.json` (pour `#[Route("/create/{pkLogement}", name: "create_info", methods: ["GET"])]` dans `TicketingApiController.php`)

### `TicketingApiController.php` (`/api/tickets`)
- `api.tickets.json` (pour `#[Route("", name: "list", methods: ["GET"])]`)
- `api.tickets.menu.json` (pour `#[Route("/menu", name: "menu", methods: ["GET"])]`)
- `api.tickets.{pkTicket}.attachment.json` (pour `#[Route("/{pkTicket}/attachment", name: "attachment", methods: ["GET"])]`)
- `api.tickets.create.{pkLogement}.json` (pour `#[Route("/create/{pkLogement}", name: "create_info", methods: ["GET"])]`)

### `SearchApiController.php` (`/api/search`)
- `api.search.json` (pour `#[Route("", name: "index", methods: ["GET"])]`)

## Notes Importantes

### Format des Noms de Fichiers

Les noms de fichiers suivent la convention suivante :
- Format : `{route_name}.json` où `{route_name}` est le nom de la route Symfony (ex: `api.parc`)
- Pour les routes avec paramètres dynamiques, utilisez la notation `{param}` dans le nom du fichier
- Le service `FakeDataService` remplacera automatiquement `{param}` par la valeur réelle lors de la recherche du fichier

### Exemples de Noms de Fichiers avec Paramètres

Pour un endpoint comme `/api/immeubles/12345`, le fichier devrait être nommé :
- `api.immeubles.{pkImmeuble}.json` (générique)
- OU `api.immeubles.12345.json` (spécifique à cette valeur)

Le service `FakeDataService` cherchera d'abord le fichier avec la valeur réelle (`api.immeubles.12345.json`), puis le fichier générique (`api.immeubles.{pkImmeuble}.json`) si le premier n'existe pas.

### Structure des Fichiers JSON

Les fichiers JSON doivent contenir les données dans le même format que les réponses API réelles. Par exemple, pour `api.parc.json` :

```json
{
  "success": true,
  "status": 200,
  "data": {
    "board": {
      "PcImmeublesTransfertFichiers": "85",
      "NbCompteursPoses": 100,
      "NbCompteursCommandes": 120,
      // ... autres propriétés
    },
    "chantier": {
      "installed": 100,
      "installed_percent": 83,
      "remaining": 20,
      "remaining_percent": 17,
      "total": 120
    }
  }
}
```

**Note** : Le service `FakeDataService` retourne directement les données du JSON (sans le wrapper `success/status/data`), car la méthode `sendFakeData()` dans `AbstractApiController` ajoute automatiquement ce wrapper.

### Endpoints Exclus

Les endpoints suivants ne nécessitent **PAS** de fichiers JSON car ils retournent des fichiers binaires (PDF, Excel) :
- `/api/factures/{pkFacture}/download` (retourne un PDF)
- `/api/interventions/{pkDepannage}/report` (retourne un PDF)

Ces endpoints ne peuvent pas utiliser le système de faker actuel car ils retournent des `Response` binaires, pas des `JsonResponse`.

## Total de Fichiers à Créer

**Total estimé** : ~100+ fichiers JSON (certains avec paramètres dynamiques nécessiteront plusieurs fichiers pour différentes valeurs)

## Prochaines Étapes

1. Créer le répertoire `public/data/api/` s'il n'existe pas
2. Créer les fichiers JSON pour les endpoints les plus utilisés en premier (dashboard, listes principales)
3. Tester le système avec `API_CALL_FAKER=true` dans le fichier `.env`
4. Ajouter progressivement les autres fichiers JSON selon les besoins de développement
