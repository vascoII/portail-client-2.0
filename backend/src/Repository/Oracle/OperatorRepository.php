<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Service\GetImmeublesParams;

class OperatorRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    
    public function getStatOccupants(int $pkUser)
    {
        return [];
    }

    public function getMyImmeubles4gestio(int $pkUser, ?GetImmeublesParams $params = null)
    {
        return [];
    }

    public function getImmeubles4gestio(int $id, ?GetImmeublesParams $params = null, bool $includeDeleted = false)
    {
        return [];
    }

    public function getGestionnaires(int $pkUser)
    {
        return [];
    }
}
