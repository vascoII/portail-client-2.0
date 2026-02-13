<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Service\GetLogementsParams;

class LogementRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getLogements(int $pkUser, int $pkImmeuble, ?GetLogementsParams $params = null)
    {
        return [];
    }

    public function getTableauBordLogement(int $pkUser, int $pkImmeuble)
    {
        return [];
    }

    public function getTableauBordImmeuble(int $pkUser, int $pkImmeuble)
    {
        return [];
    }

    public function getFuitesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return [];
    }

    public function getDysfonctionnementsImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null)
    {
        return [];
    }

    public function getAnomaliesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return [];
    }
    
    public function getTicketInterInit(int $pkUser, $pkLogementParam)
    {
        return [];
    }

    public function getMyTableauBordClient(int $pkUser)
    {
        return [];
    }

    public function getInfosAppareilsType(int $pkUser, int $pkLogement, array $type)
    {
        return [];
    }

    public function getNbTicketsInterByLogement(int $pkUser, int $pkLogement)
    {
        return [];
    }

    public function getOccupants(int $pkUser, int $pkLogement, int $pkOccupant, bool $isActif = true)
    {
        return [];
    }

    public function getDetailDepannage(int $pkUser, int $pkIntervention)
    {
        return [];
    }

    public function getInterventionsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement)
    {
        return [];
    }
    
}
