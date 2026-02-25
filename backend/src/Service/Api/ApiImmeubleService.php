<?php

namespace App\Service\Api;

use App\Repository\Oracle\ImmeubleRepository;
use App\Service\Dto\GetImmeubleOutputDto;
use App\Service\Dto\ListImmeublesOutputDto;
use App\Service\Dto\ListLogementsOuputDto;
use App\Service\Dto\ImmeubleDto;


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

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    public function updateAddress2And3(int $pkUser, int $pkImmeuble, string $adresse2, string $adresse3): ImmeubleDto
    {
        $this->checkUserHasAccessToImmeuble($pkUser, $pkImmeuble);
        $result = $this->immeubleRepository->updateAddress2And3($pkImmeuble, $adresse2, $adresse3);

        if (!$result->isSuccess) {
            throw new \Exception("Failed to update address for immeuble with id $pkImmeuble");
        }
        
        $immeuble = $this->immeubleRepository->findByPkImmeuble($pkImmeuble);
        return new ImmeubleDto(
            $immeuble->pkImmeuble,
            $immeuble->nom,
            $immeuble->numero,
            $immeuble->ref,
            $immeuble->adresse1,
            $immeuble->adresse2,
            $immeuble->adresse3,
            $immeuble->cp,
            $immeuble->ville
        );
    }
}
