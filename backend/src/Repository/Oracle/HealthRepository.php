<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;

class HealthRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {
    }

    public function getHealthForOracle(): bool
    {
        return $this->oci->pingHealth();
    }
}

