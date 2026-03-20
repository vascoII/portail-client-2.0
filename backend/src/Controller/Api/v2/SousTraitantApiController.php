<?php

declare(strict_types=1);

namespace App\Controller\Api\v2;

use App\Service\Api\ApiSousTraitantService;
use App\Service\Api\ApiSecurityService as SecurityService;
use App\Service\Client;
use App\Service\Dto\SousTraitantDto;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * API Controller pour les sous-traitants (Oracle WEB_SOUSTRAITANT)
 */
#[Route("/api/v2/soustraitants", name: "api_v2_soustraitant_")]
class SousTraitantApiController extends AbstractApiController
{
    private ApiSousTraitantService $apiSousTraitantService;

    public function __construct(
        Client $client,
        SerializerInterface $serializer,
        SecurityService $securityService,
        ApiSousTraitantService $apiSousTraitantService,
    ) {
        parent::__construct($client, $serializer, $securityService);
        $this->apiSousTraitantService = $apiSousTraitantService;
    }

    /**
     * Liste tous les sous-traitants.
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        // Authentification par headers (cohérent avec les autres contrôleurs API)
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $rows = $this->apiSousTraitantService->getAllSousTraitants();

            return $this->success([
                'soustraitants' => $rows,
            ]);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération des sous-traitants: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Détail d'un sous-traitant.
     */
    #[Route("/{pkSousTraitant}", name: "show", methods: ["GET"])]
    public function show(int $pkSousTraitant, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $row = $this->apiSousTraitantService->getSousTraitant($pkSousTraitant);
            if ($row === null) {
                return $this->notFound('Sous-traitant introuvable');
            }

            return $this->success($row);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération du sous-traitant: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Création d'un sous-traitant (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("", name: "create", methods: ["POST"])]
    public function create(Request $request): JsonResponse
    {
        if (!$this->validateClientOracle($request)) {
            return $this->error('Création de sous-traitant via Oracle non encore implémentée', 501);
        }
        
        $payload = json_decode($request->getContent(), true) ?? [];
        $dto = new SousTraitantDto(
           nom: $payload['nom'] ?? null,
           description: $payload['description'] ?? null,
           territoires: $payload['territoires'] ?? null,
           pays: $payload['pays'] ?? null,
           adresse: $payload['adresse'] ?? null,
           cp: $payload['cp'] ?? null,
           ville: $payload['ville'] ?? null,
           protection: $payload['protection'] ?? null,
        );
        $this->apiSousTraitantService->createSousTraitant($dto);
        return $this->success(null, 'Sous-traitant créé', 201);
    }

    /**
     * Mise à jour d'un sous-traitant (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("/{pkSousTraitant}", name: "update", methods: ["PUT", "PATCH"])]
    public function update(int $pkSousTraitant, Request $request): JsonResponse
    {
        if (!$this->validateClientOracle($request)) {
            return $this->error('Mise à jour de sous-traitant via Oracle non encore implémentée', 501);
        }
        

        $payload = json_decode($request->getContent(), true) ?? [];
        $dto = new SousTraitantDto(
            nom: $payload['nom'] ?? null,
            description: $payload['description'] ?? null,
            territoires: $payload['territoires'] ?? null,
            pays: $payload['pays'] ?? null,
            adresse: $payload['adresse'] ?? null,
            cp: $payload['cp'] ?? null,
            ville: $payload['ville'] ?? null,
            protection: $payload['protection'] ?? null,
        );
        $this->apiSousTraitantService->updateSousTraitant($pkSousTraitant, $dto);
        return $this->success(null, 'Sous-traitant mis à jour', 200);
    }

    /**
     * Suppression d'un sous-traitant (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("/{pkSousTraitant}", name: "delete", methods: ["DELETE"])]
    public function delete(int $pkSousTraitant, Request $request): JsonResponse
    {
        if (!$this->validateClientOracle($request)) {
            return $this->error('Suppression de sous-traitant via Oracle non encore implémentée', 501);
        }        
        
        $this->apiSousTraitantService->deleteSousTraitant($pkSousTraitant);
        return $this->success(null, 'Sous-traitant supprimé', 200);
    }
}

