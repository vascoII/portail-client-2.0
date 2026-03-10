<?php

declare(strict_types=1);

namespace App\Service\Api;

use App\Repository\Oracle\Client\ClientRepository;

class ApiClientService
{
    public function __construct(
        private readonly ClientRepository $clientRepository,
    ) {
    }

    /**
     * Liste tous les clients actifs.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllClients(): array
    {
        return $this->clientRepository->findAll();
    }

    /**
     * Retourne un client par identifiant métier PKCLIENT.
     *
     * @return array<string, mixed>|null
     */
    public function getClient(int $pkClient): ?array
    {
        return $this->clientRepository->findOneByPkClient($pkClient);
    }

    public function createClient(array $data): void
    {
        $this->clientRepository->create($data);
    }

    public function updateClient(int $pkClient, array $data): void
    {
        $this->clientRepository->update($pkClient, $data);
    }

    public function deleteClient(int $pkClient): void
    {
        $this->clientRepository->delete($pkClient);
    }
}

