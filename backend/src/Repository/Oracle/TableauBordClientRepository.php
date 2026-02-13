<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class TableauBordClientRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getMyTableauBordClient(int $pkUser)
    {
        return [];
    }
    
}
