<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class OccupantRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getTableauBordOccupant(int $pkUser, int $userFk)
    {
        return [];
    }

    public function getSousTraitants(int $pkUser)
    {
        return [];
    }

    public function getDetailDepannage(int $pkUser, int $pkIntervention)
    {
        return [];
    }

    public function getInterventionsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $userFk)
    {
        return [];
    }

    public function getFuitesImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $pkAppareil, int $userFk)
    {
        return [];
    }

    public function getDysfonctionnementsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement, int $userFk)
    {
        return [];
    }

    public function getAnomaliesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null, ?int $userFk = null)
    {
        return [];
    }
    
}
