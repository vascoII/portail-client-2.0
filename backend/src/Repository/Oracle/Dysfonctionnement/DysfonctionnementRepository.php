<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Dysfonctionnement;

use App\Oracle\OciFacade;
use App\Service\Dto\DysfonctionnementDto;

class DysfonctionnementRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
