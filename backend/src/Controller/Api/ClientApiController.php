<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Service\Api\ApiClientService;
use App\Service\Api\ApiSecurityService as SecurityService;
use App\Service\Client;
use App\Service\FakeDataService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * API Controller pour les clients (Oracle WEB_CLIENT)
 */
#[Route("/api/clients", name: "api_client_")]
class ClientApiController extends AbstractApiController
{
    private ApiClientService $apiClientService;

    public function __construct(
        Client $client,
        SerializerInterface $serializer,
        SecurityService $securityService,
        ?FakeDataService $fakeDataService = null,
        ApiClientService $apiClientService,
    ) {
        parent::__construct($client, $serializer, $securityService, $fakeDataService);
        $this->apiClientService = $apiClientService;
    }

    /**
     * Liste tous les clients.
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $rows = $this->apiClientService->getAllClients();

            return $this->success([
                'clients' => $rows,
            ]);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération des clients: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Détail d'un client par PKCLIENT.
     */
    #[Route("/{pkClient}", name: "show", methods: ["GET"])]
    public function show(int $pkClient, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $row = $this->apiClientService->getClient($pkClient);
            if ($row === null) {
                return $this->notFound('Client introuvable');
            }

            return $this->success($row);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération du client: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Création d'un client (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("", name: "create", methods: ["POST"])]
    public function create(Request $request): JsonResponse
    {
        return $this->error('Création de client via Oracle non encore implémentée', 501);

        // Exemple de mapping quand l\'écriture Oracle sera disponible :
        // $payload = json_decode($request->getContent(), true) ?? [];
        // $this->apiClientService->createClient($payload);
        // return $this->success(null, 'Client créé', 201);
    }

    /**
     * Mise à jour d'un client (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("/{pkClient}", name: "update", methods: ["PUT", "PATCH"])]
    public function update(int $pkClient, Request $request): JsonResponse
    {
        return $this->error('Mise à jour de client via Oracle non encore implémentée', 501);

        // Exemple de mapping quand l\'écriture Oracle sera disponible :
        // $payload = json_decode($request->getContent(), true) ?? [];
        // $this->apiClientService->updateClient($pkClient, $payload);
        // return $this->success(null, 'Client mis à jour', 200);
    }

    /**
     * Suppression d'un client (structure CRUD préparée, écriture Oracle non implémentée).
     */
    #[Route("/{pkClient}", name: "delete", methods: ["DELETE"])]
    public function delete(int $pkClient, Request $request): JsonResponse
    {
        return $this->error('Suppression de client via Oracle non encore implémentée', 501);

        // Exemple quand l\'écriture Oracle sera disponible :
        // $this->apiClientService->deleteClient($pkClient);
        // return $this->success(null, 'Client supprimé', 200);
    }
}

