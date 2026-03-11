<?php

namespace App\Service\Api;

use App\Repository\Oracle\TableauBordClientRepository;


class ApiTableauBordClientService
{
    public function __construct(
        private readonly TableauBordClientRepository $tableauBordClientRepository,
    ) {}

    public function getMyTableauBordClient(int $pkUser, string $sessionId)
    {
        return [];
        return $this->tableauBordClientRepository->getMyTableauBordClient($pkUser, $sessionId);
    }
}
