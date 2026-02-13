<?php

namespace App\Service\Api;

use App\Repository\Oracle\GestionParcRepository;

class ApiGestionParcService
{
    public function __construct(
        private readonly GestionParcRepository $gestionParcRepository,
    ) {
    }
}

