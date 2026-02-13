<?php

namespace App\Service\Api;

use App\Repository\Oracle\InterventionRepository;

class ApiInterventionService
{
    public function __construct(
        private readonly InterventionRepository $interventionRepository,
    ) {
    }
}

