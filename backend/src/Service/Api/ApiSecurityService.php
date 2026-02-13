<?php

namespace App\Service\Api;

use App\Repository\Oracle\SecurityRepository;

class ApiSecurityService
{
    public function __construct(
        private readonly SecurityRepository $securityRepository,
    ) {
    }

    public function validateToken(string $sessionId, int $pkUser): bool
    {
        return $this->securityRepository->validateToken($sessionId, $pkUser);
    }
}

