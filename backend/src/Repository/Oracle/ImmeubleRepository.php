<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class ImmeubleRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getMyImmeubles($pkUser, $params = [])
    {
        return [];
    }

    public function getMyTableauBordClient($pkUser, $params = [])
    {
        return [];
    }

    public function getTableauBordImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getInterventionsImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getFuitesImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getAnomaliesImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getDysfonctionnementsImmeuble($pkUser, $pkImmeuble)
    {
        return [];
    }

    public function getDetailDepannage($pkUser, $pkIntervention)
    {
        return [];
    }
    
}
