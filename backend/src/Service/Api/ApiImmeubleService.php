<?php

namespace App\Service\Api;

use App\Repository\Oracle\Techem\ImmeubleRepository;
use App\Service\Dto\Immeuble\ImmeubleDto;
use App\Service\Dto\Immeuble\ImmeubleEAUDto;
use App\Service\Dto\Immeuble\ImmeubleRepartDto;
use App\Service\Dto\Immeuble\ImmeubleCETDto;
use App\Service\Dto\Immeuble\ImmeubleCapteurDto;
use App\Service\Dto\Immeuble\ImmeubleElectDto;
use App\Service\Dto\Immeuble\ImmeubleGazDto;
use App\Service\Dto\SerieDto;


class ApiImmeubleService extends ApiBaseService
{
    public function __construct(
        private readonly ImmeubleRepository $immeubleRepository
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

    //////////////////////////////////////////////////////////////////////////////////////
    public function getImmeuble(int $pkUser, int $pkImmeuble): ?ImmeubleDto
    {
        return $this->immeubleRepository->getImmeuble($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleCount(int $pkUser, int $pkImmeuble): array
    {
        return $this->immeubleRepository->getImmeubleCount($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleEc(int $pkUser, int $pkImmeuble): ImmeubleEAUDto
    {
        return $this->immeubleRepository->getImmeubleEc($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleEf(int $pkUser, int $pkImmeuble): ImmeubleEAUDto
    {
        return $this->immeubleRepository->getImmeubleEf($pkUser, $pkImmeuble);
    }

    public function getImmeubleRepart(int $pkUser, int $pkImmeuble): ImmeubleRepartDto
    {
        return $this->immeubleRepository->getImmeubleRepart($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleCet(int $pkUser, int $pkImmeuble): ImmeubleCETDto
    {
        return $this->immeubleRepository->getImmeubleCet($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleCapteur(int $pkUser, int $pkImmeuble): ImmeubleCapteurDto
    {
        return $this->immeubleRepository->getImmeubleCapteur($pkUser, $pkImmeuble);
    }

    public function getImmeubleElect(int $pkUser, int $pkImmeuble): ImmeubleElectDto
    {
        return $this->immeubleRepository->getImmeubleElect($pkUser, $pkImmeuble);
    }

    public function getImmeubleGaz(int $pkUser, int $pkImmeuble): ImmeubleGazDto
    {
        return $this->immeubleRepository->getImmeubleGaz($pkUser, $pkImmeuble);
    }
    
    public function getImmeubleSerieConsosEau(int $pkUser, int $pkImmeuble): SerieDto
    {
        return $this->immeubleRepository->getImmeubleSerieConsosEau($pkUser, $pkImmeuble);
    }

    public function getImmeubleSerieConsosCompteurGeneral(int $pkUser, int $pkImmeuble): SerieDto
    {
        return $this->immeubleRepository->getImmeubleSerieConsosCompteurGeneral($pkUser, $pkImmeuble);
    }

    public function getChantierByPkImmeuble(int $pkUser, int $pkImmeuble): array 
    {
        return $this->immeubleRepository->getChantierByPkImmeuble($pkUser, $pkImmeuble);
    }
}
