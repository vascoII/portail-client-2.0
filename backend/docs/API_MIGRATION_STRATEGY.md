# Stratégie de Migration vers API REST

## 📋 Vue d'ensemble

Ce document décrit la stratégie pour transformer l'application Symfony actuelle (orientée web avec Twig) en une API REST complète.

## 🎯 Objectifs

1. **Créer une API REST** parallèle à l'application web existante
2. **Maintenir la compatibilité** avec l'application web actuelle
3. **Utiliser Symfony Serializer** (déjà installé) pour la sérialisation JSON
4. **Standardiser les réponses** API avec un format cohérent
5. **Gérer l'authentification** via les tokens SOAP existants

## 🏗️ Architecture proposée

### Structure des dossiers

```
src/Controller/
├── Api/                          # Nouveaux contrôleurs API
│   ├── AbstractApiController.php # Classe de base pour les API
│   ├── FactureApiController.php  # Exemple de contrôleur API
│   ├── OccupantApiController.php
│   ├── ImmeubleApiController.php
│   ├── LogementApiController.php
│   └── ...
├── AbstractTechemController.php  # Existant (pour web)
├── FactureController.php         # Existant (pour web)
└── ...
```

### Préfixe des routes API

Toutes les routes API utiliseront le préfixe `/api` :

- Web : `/factures` → `FactureController`
- API : `/api/factures` → `FactureApiController`

## 📐 Format de réponse standard

### Succès

```json
{
  "success": true,
  "status": 200,
  "message": "Optional message",
  "data": {
    // Données de la réponse
  }
}
```

### Erreur

```json
{
  "success": false,
  "status": 400,
  "message": "Error message",
  "errors": [
    // Détails des erreurs (optionnel)
  ]
}
```

## 🔐 Authentification

L'authentification actuelle via SOAP Session Token est conservée :

1. L'utilisateur se connecte via `/login` (web) ou `/api/login` (API)
2. Un token SOAP est créé et stocké dans la session
3. Les contrôleurs API vérifient l'authentification via `getAuthenticatedClient()`
4. Si non authentifié, retourne une réponse 401

### Future amélioration

Pour une vraie API stateless, considérer :

- JWT (JSON Web Tokens)
- API Keys
- OAuth2

## 📝 Plan de migration

### Phase 1 : Infrastructure (✅ Terminé)

- [x] Créer `AbstractApiController`
- [x] Créer un exemple de contrôleur API (`FactureApiController`)
- [x] Configurer les routes API

### Phase 2 : Contrôleurs API de base

- [ ] `OccupantApiController` - Gestion des occupants
- [ ] `ImmeubleApiController` - Gestion des immeubles
- [ ] `LogementApiController` - Gestion des logements
- [ ] `InterventionApiController` - Gestion des interventions
- [ ] `SecurityApiController` - Authentification API

### Phase 3 : Endpoints avancés

- [ ] Endpoints de recherche et filtrage
- [ ] Endpoints d'export (Excel, PDF)
- [ ] Endpoints de statistiques
- [ ] Endpoints de tickets

### Phase 4 : Documentation

- [ ] OpenAPI/Swagger documentation
- [ ] Postman collection
- [ ] Guide d'intégration

### Phase 5 : Tests

- [ ] Tests unitaires des contrôleurs API
- [ ] Tests d'intégration
- [ ] Tests de charge

## 🔄 Mapping Contrôleurs Web → API

| Contrôleur Web        | Contrôleur API           | Routes principales |
| --------------------- | ------------------------ | ------------------ |
| `FactureController`   | `FactureApiController`   | `/api/factures`    |
| `OccupantController`  | `OccupantApiController`  | `/api/occupants`   |
| `ImmeubleController`  | `ImmeubleApiController`  | `/api/immeubles`   |
| `LogementController`  | `LogementApiController`  | `/api/logements`   |
| `SecurityController`  | `SecurityApiController`  | `/api/auth`        |
| `TicketingController` | `TicketingApiController` | `/api/tickets`     |
| `OperatorController`  | `OperatorApiController`  | `/api/operators`   |

## 📊 Exemples de transformation

### Avant (Web - FactureController)

```php
public function indexAction()
{
    $client = $this->getClient();
    if (is_null($client)) {
        return $this->redirectToRoute('logout');
    }

    $factures = $client->getFactures();
    $locals = ['factures' => json_encode($listFactures)];

    return $this->render('Facture/index.html.twig', $locals);
}
```

### Après (API - FactureApiController)

```php
#[Route("/api/factures", name="api_facture_")]
class FactureApiController extends AbstractApiController
{
    #[Route("", name="list", methods={"GET"})]
    public function list(): JsonResponse
    {
        $client = $this->getAuthenticatedClient();
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $factures = $client->getFactures();
        return $this->success(['factures' => $normalizedFactures]);
    }
}
```

## 🛠️ Outils et dépendances

### Déjà installés

- ✅ Symfony Serializer (`symfony/serializer`)
- ✅ Symfony Framework Bundle

### Recommandés (optionnels)

- `nelmio/api-doc-bundle` - Documentation OpenAPI/Swagger
- `symfony/validator` - Validation des données (déjà installé)
- `lexik/jwt-authentication-bundle` - Pour JWT (future amélioration)

## 📚 Bonnes pratiques

### 1. Normalisation des données

Toujours normaliser les données avant de les retourner :

```php
$normalizedData = [
    'id' => $object->getId(),
    'name' => $object->getName(),
    'date' => $object->getDate() ? $object->getDate()->format('Y-m-d') : null,
];
```

### 2. Gestion des erreurs

Utiliser les méthodes d'erreur standardisées :

```php
return $this->error('Message d\'erreur', 400);
return $this->notFound('Ressource non trouvée');
return $this->unauthorized('Non autorisé');
```

### 3. Codes HTTP

- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non authentifié
- `403` - Non autorisé
- `404` - Non trouvé
- `500` - Erreur serveur

### 4. Pagination

Pour les listes, implémenter la pagination :

```php
#[Route("", name="list", methods={"GET"})]
public function list(Request $request): JsonResponse
{
    $page = $request->query->getInt('page', 1);
    $limit = $request->query->getInt('limit', 20);

    // ... logique de pagination

    return $this->success([
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
        ],
    ]);
}
```

## 🚀 Prochaines étapes

1. **Créer les contrôleurs API de base** (Occupant, Immeuble, Logement)
2. **Implémenter l'authentification API** (`SecurityApiController`)
3. **Ajouter la documentation OpenAPI**
4. **Tester les endpoints** avec Postman/Insomnia
5. **Créer des tests automatisés**

## 📖 Documentation des endpoints

Voir les fichiers de contrôleurs API individuels pour la documentation détaillée de chaque endpoint.

## 🔗 Ressources

- [Symfony Serializer Documentation](https://symfony.com/doc/7.3/components/serializer.html)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
