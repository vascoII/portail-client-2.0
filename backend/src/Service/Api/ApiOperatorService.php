<?php

namespace App\Service\Api;

use App\Repository\Oracle\OperatorRepository;
use App\Service\GetImmeublesParams;

class ApiOperatorService
{
    public function __construct(
        private readonly OperatorRepository $operatorRepository,
    ) {
    }

    public function getStatOccupants(int $pkUser)
    {
        return $this->operatorRepository->getStatOccupants($pkUser);
    }

    public function getMyImmeubles4gestio(int $pkUser, ?GetImmeublesParams $params = null)
    {
        return $this->operatorRepository->getMyImmeubles4gestio($pkUser, $params);
    }

    public function getImmeubles4gestio(int $id, ?GetImmeublesParams $params = null, bool $includeDeleted = false)
    {
        return $this->operatorRepository->getImmeubles4gestio($id, $params, $includeDeleted);
    }

    public function getGestionnaires(int $pkUser)
    {
        return $this->operatorRepository->getGestionnaires($pkUser);
    }
}

