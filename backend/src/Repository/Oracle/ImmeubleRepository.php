<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Oracle\OciUpdateHandler;
use App\Repository\Dto\Shared\SuccessOutputDto;
use App\Repository\Dto\Immeuble\GetImmeubleOutputDto;

class ImmeubleRepository
{
    public function __construct(
        private readonly OciFacade $oci,
        private readonly OciUpdateHandler $ociUpdate,
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

    /** 
     *
     * @param integer $pkImmeuble
     * @param string $adresse2
     * @param string $adresse3
     * @return SuccessOutputDto
     */
    public function updateAddress2And3(int $pkImmeuble, string $adresse2, string $adresse3): SuccessOutputDto
    {
        $sql = "UPDATE IMMEUBLE SET ADRESSE2 = :adresse2, ADRESSE3 = :adresse3 WHERE PKIMMEUBLE = :pkImmeuble";

        $params = [
            'pkImmeuble'   => $pkImmeuble,
            'adresse2' => $adresse2,
            'adresse3' => $adresse3,
        ];

        // Renvoie le nombre de lignes modifiées
        return $this->ociUpdate->update($sql, $params) > 0 ? SuccessOutputDto::ok() : SuccessOutputDto::error("Failed to update address");
    }

    public function findByPkImmeuble(int $pkImmeuble): ?GetImmeubleOutputDto
    {
        $sql = "SELECT PKIMMEUBLE, NOM, NUMERO, REF, ADRESSE1, ADRESSE2, ADRESSE3, CP, VILLE FROM IMMEUBLE WHERE PKIMMEUBLE = :pkImmeuble";
        $params = ['pkImmeuble' => $pkImmeuble];
        $result = $this->oci->fetchAllAssoc($sql, $params);
        return $result ? new GetImmeubleOutputDto(...$result[0]) : null;
    }
    
}
