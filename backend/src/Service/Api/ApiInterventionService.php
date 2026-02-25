<?php

namespace App\Service\Api;

use App\Repository\Oracle\InterventionRepository;
use App\Repository\Dto\Intervention\ListCasesOutputDto;

class ApiInterventionService
{
    public function __construct(
        private readonly InterventionRepository $interventionRepository
    ) {
    }
}

