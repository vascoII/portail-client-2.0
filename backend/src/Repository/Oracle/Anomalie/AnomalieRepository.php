<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Anomalie;

use App\Oracle\OciFacade;
use App\Service\Dto\AnomalieDto;

class AnomalieRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
