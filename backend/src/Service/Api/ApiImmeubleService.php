<?php

namespace App\Service\Api;

use App\Repository\Oracle\ImmeubleRepository;

class ApiImmeubleService
{
    public function __construct(
        private readonly ImmeubleRepository $immeubleRepository,
    ) {
    }

    public function getMyImmeubles($pkUser, $params = [])
    {
        return $this->immeubleRepository->getMyImmeubles($pkUser, $params);
    }

    public function getMyTableauBordClient($pkUser, $params = [])
    {
        return $this->immeubleRepository->getMyTableauBordClient($pkUser, $params);
    }

    public function getTableauBordImmeuble($pkUser, $pkImmeuble)
    {
        return $this->immeubleRepository->getTableauBordImmeuble($pkUser, $pkImmeuble);
    }

    public function getInterventionsImmeuble($pkUser, $pkImmeuble)
    {
        return $this->immeubleRepository->getInterventionsImmeuble($pkUser, $pkImmeuble);
    }

    public function getFuitesImmeuble($pkUser, $pkImmeuble)
    {
        return $this->immeubleRepository->getFuitesImmeuble($pkUser, $pkImmeuble);
    }

    public function getAnomaliesImmeuble($pkUser, $pkImmeuble)
    {
        return $this->immeubleRepository->getAnomaliesImmeuble($pkUser, $pkImmeuble);
    }

    public function getDysfonctionnementsImmeuble($pkUser, $pkImmeuble)
    {
        return $this->immeubleRepository->getDysfonctionnementsImmeuble($pkUser, $pkImmeuble);
    }

    public function getDetailDepannage($pkUser, $pkIntervention)
    {
        return $this->immeubleRepository->getDetailDepannage($pkUser, $pkIntervention);
    }
}
