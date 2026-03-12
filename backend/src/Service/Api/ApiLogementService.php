<?php

namespace App\Service\Api;

use App\Repository\Oracle\LogementRepository;
use App\Service\GetLogementsParams;
use App\Repository\Dto\Logement\LogementOutputDto;

class ApiLogementService
{
    public function __construct(
        private readonly LogementRepository $logementRepository
    ) {
    }

    public function getLogements(int $pkUser, int $pkImmeuble, ?GetLogementsParams $params = null)
    {
        return $this->logementRepository->getLogements($pkUser, $pkImmeuble, $params);
    }

    public function getTableauBordLogement(string $SessionID, int $PkUser, int $PkLogement, int $PkOccupant)
    {
        return $this->logementRepository->getTableauBordLogement($SessionID, $PkUser, $PkLogement, $PkOccupant);
    }

    public function getTableauBordImmeuble(int $pkUser, int $pkImmeuble)
    {
        return $this->logementRepository->getTableauBordImmeuble($pkUser, $pkImmeuble);
    }

    public function getFuitesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return $this->logementRepository->getFuitesImmeuble($pkUser, $pkImmeuble, $pkLogement, $pkAppareil);
    }

    public function getDysfonctionnementsImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null)
    {
        return $this->logementRepository->getDysfonctionnementsImmeuble($pkUser, $pkImmeuble, $pkLogement);
    }

    public function getAnomaliesImmeuble(int $pkUser, int $pkImmeuble, ?int $pkLogement = null, ?int $pkAppareil = null)
    {
        return $this->logementRepository->getAnomaliesImmeuble($pkUser, $pkImmeuble, $pkLogement, $pkAppareil);
    }
    
    public function getTicketInterInit(string $SessionID, int $PkUser, int $PkLogement)
    {
        return $this->logementRepository->getTicketInterInit($SessionID, $PkUser, $PkLogement);
    }

    public function getMyTableauBordClient(int $pkUser)
    {
        return $this->logementRepository->getMyTableauBordClient($pkUser);
    }

    public function getInfosAppareilsType(int $pkUser, int $pkLogement, array $type)
    {
        return $this->logementRepository->getInfosAppareilsType($pkUser, $pkLogement, $type);
    }

    public function getNbTicketsInterByLogement(string $SessionID, int $PkUser, int $PkLogement, string $ParamsFiltres)
    {
        return $this->logementRepository->getNbTicketsInterByLogement($SessionID, $PkUser, $PkLogement, $ParamsFiltres);
    }

    public function getOccupants(int $pkUser, int $pkLogement, int $pkOccupant, bool $isActif = true)
    {
        return $this->logementRepository->getOccupants($pkUser, $pkLogement, $pkOccupant, $isActif);
    }

    public function getDetailDepannage(int $pkUser, int $pkIntervention)
    {
        return $this->logementRepository->getDetailDepannage($pkUser, $pkIntervention);
    }

    public function getInterventionsImmeuble(int $pkUser, int $pkImmeuble, int $pkLogement)
    {
        return $this->logementRepository->getInterventionsImmeuble($pkUser, $pkImmeuble, $pkLogement);
    }   
}

