<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Conso;

use App\Oracle\OciFacade;
use App\Service\Dto\ConsoDto;

class ConsoRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
