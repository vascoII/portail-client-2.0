<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class FrontRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getSousTraitants(int $pkUser)
    {
        return [];
    }
    
    
}
