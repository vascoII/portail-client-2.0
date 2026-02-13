<?php

namespace App\Service\Api;

use App\Repository\Oracle\OccupantRepository;

class ApiOccupantService
{
    public function __construct(
        private readonly OccupantRepository $occupantRepository,
    ) {
    }

    public function getTableauBordOccupant(int $pkUser, int $userFk)
    {
        return $this->occupantRepository->getTableauBordOccupant($pkUser, $userFk);
    }

    public function getSousTraitants(int $pkUser)
    {
        return $this->occupantRepository->getSousTraitants($pkUser);
    }

    public function getDetailDepannage(int $pkUser, int $pkIntervention)
    {
        return $this->occupantRepository->getDetailDepannage($pkUser, $pkIntervention);
    }

    public function getInterventionsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $userFk)
    {
        return $this->occupantRepository->getInterventionsImmeuble($pkUser, $pkImmeuble, $pkLogement, $userFk);
    }

    public function getFuitesImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $pkAppareil, int $userFk)
    {
        return $this->occupantRepository->getFuitesImmeuble($pkUser, $pkImmeuble, $pkLogement, $pkAppareil, $userFk);
    }

    public function getDysfonctionnementsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $userFk)
    {
        return $this->occupantRepository->getDysfonctionnementsImmeuble($pkUser, $pkImmeuble, $pkLogement, $userFk);
    }

    public function getAnomaliesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null, ?int $userFk = null)
    {
        return $this->occupantRepository->getAnomaliesImmeuble($pkUser, $pkImmeuble, $pkLogement, $pkAppareil, $userFk);
    }
}

