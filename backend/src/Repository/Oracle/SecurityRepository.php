<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class SecurityRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function validateToken(string $sessionId, int $pkUser): bool
    {
        return true;
    }
    
}
