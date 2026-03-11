<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class InterventionRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    
    
}
