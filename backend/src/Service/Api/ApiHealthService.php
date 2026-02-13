<?php

namespace App\Service\Api;

use App\Repository\Oracle\HealthRepository;

/**
 * Service métier pour les endpoints de santé côté API.
 *
 * Objectif : centraliser les vérifications de santé (ex: connexion Oracle)
 * et autres logiques métier liées à la santé de l'API.
 */
class ApiHealthService 
{
    public function __construct(
        private readonly HealthRepository $healthRepository,
    ) {
    }

    /**
     * Vérifie la santé de l'API en effectuant des tests de connexion à Oracle.
     *
     * @return bool true si la santé est bonne, false sinon
     */
    public function getHealth(): bool
    {
        return $this->healthRepository->getHealthForOracle();
    }
}

