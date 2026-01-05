# Liste des Fichiers JSON pour le Faker API (Format Simplifié)

**Date** : 2025-01-XX  
**Format** : Un seul fichier par endpoint (sans paramètres dynamiques)

## Fichiers JSON à Créer

### TableauBordClientApiController (`/api/parc`)
1. `api.parc.json`
2. `api.parc.intervention.json`

### FactureApiController (`/api/factures`)
3. `api.factures.json`
4. `api.factures.pkFacture.json`

### SecurityApiController (`/api/security`)
5. `api.security.login.param.json`
6. `api.security.me.json`

### OccupantApiController (`/api/occupant`)
7. `api.occupant.json`
8. `api.occupant.simulateur.json`
9. `api.occupant.interventions.pkIntervention.json`
10. `api.occupant.interventions.json`
11. `api.occupant.fuites.json`
12. `api.occupant.dysfonctionnements.json`
13. `api.occupant.anomalies.json`
14. `api.occupant.anomalies.export.json`
15. `api.occupant.fuites.export.json`
16. `api.occupant.interventions.export.json`
17. `api.occupant.dysfonctionnements.export.json`
18. `api.occupant.my-account.json`
19. `api.occupant.alertes.json`

### GestionParcApiController (`/api/gestion-parc`)
20. `api.gestion-parc.json`
21. `api.gestion-parc.filtre.json`
22. `api.gestion-parc.pkImmeuble.json`
23. `api.gestion-parc.pkImmeuble.interventions.pkIntervention.json`
24. `api.gestion-parc.pkImmeuble.interventions.json`
25. `api.gestion-parc.pkImmeuble.fuites.json`
26. `api.gestion-parc.pkImmeuble.anomalies.json`
27. `api.gestion-parc.pkImmeuble.dysfonctionnements.json`
28. `api.gestion-parc.pkImmeuble.anomalies.export.json`
29. `api.gestion-parc.pkImmeuble.fuites.export.json`
30. `api.gestion-parc.pkImmeuble.interventions.export.json`
31. `api.gestion-parc.pkImmeuble.dysfonctionnements.export.json`

### FrontApiController (`/api`)
32. `api.me.json`
33. `api.legal-notices.json`
34. `api.personal-datas.json`
35. `api.cgu.status.json`
36. `api.dashboard.json`

### OperatorApiController (`/api/operators`)
37. `api.operators.json`
38. `api.operators.statistiques.json`
39. `api.operators.id.json`

### ImmeubleApiController (`/api/immeubles`)
40. `api.immeubles.json`
41. `api.immeubles.filtre.json`
42. `api.immeubles.pkImmeuble.json`
43. `api.immeubles.pkImmeuble.interventions.pkIntervention.json`
44. `api.immeubles.pkImmeuble.interventions.json`
45. `api.immeubles.pkImmeuble.fuites.json`
46. `api.immeubles.pkImmeuble.anomalies.json`
47. `api.immeubles.pkImmeuble.dysfonctionnements.json`
48. `api.immeubles.pkImmeuble.anomalies.export.json`
49. `api.immeubles.pkImmeuble.fuites.export.json`
50. `api.immeubles.pkImmeuble.interventions.export.json`
51. `api.immeubles.pkImmeuble.dysfonctionnements.export.json`

### LogementApiController (`/api/logements`)
52. `api.logements.immeuble.pkImmeuble.json`
53. `api.logements.pkLogement.ticket-owner.json`
54. `api.logements.search.json`
55. `api.logements.pkLogement.appareils.type.json`
56. `api.logements.pkLogement.json`
57. `api.logements.pkLogement.releve-repart.json`
58. `api.logements.pkLogement.interventions.pkIntervention.json`
59. `api.logements.pkLogement.interventions.json`
60. `api.logements.filter.json`
61. `api.logements.pkLogement.fuites.json`
62. `api.logements.pkLogement.dysfonctionnements.json`
63. `api.logements.pkLogement.anomalies.json`
64. `api.logements.immeuble.pkImmeuble.export.json`
65. `api.logements.pkLogement.anomalies.export.json`
66. `api.logements.pkLogement.fuites.export.json`
67. `api.logements.pkLogement.interventions.export.json`
68. `api.logements.pkLogement.dysfonctionnements.export.json`

### TicketingApiController (`/api/tickets`)
69. `api.tickets.json`
70. `api.tickets.menu.json`
71. `api.tickets.pkTicket.attachment.json`
72. `api.tickets.create.pkLogement.json`

### SearchApiController (`/api/search`)
73. `api.search.json`

---

## Total : 73 fichiers JSON

## Note

Ces fichiers seront créés vides (contenant `{}`) et devront être remplis avec les données de test appropriées selon les besoins de développement.

