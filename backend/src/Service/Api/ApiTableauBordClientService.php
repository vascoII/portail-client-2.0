<?php

namespace App\Service\Api;

use App\Repository\Oracle\Techem\TableauBordClientRepository;


class ApiTableauBordClientService
{
    public function __construct(
        private readonly TableauBordClientRepository $tableauBordClientRepository,
    ) {
    }

    public function getMyTableauBordClient(int $pkUser, string $sessionId)
    {
        return $this->tableauBordClientRepository->getMyTableauBordClient($pkUser, $sessionId);
    }
}

