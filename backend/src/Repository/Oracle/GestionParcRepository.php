<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class GestionParcRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    
    
}
