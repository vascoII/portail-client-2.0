<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;


class SearchRepository
{
    public function __construct(
        private readonly OciFacade $oci
    ) {}

    
    
}
