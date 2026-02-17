<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Fuite;

use App\Oracle\OciFacade;
use App\Service\Dto\FuiteDto;

class FuiteRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
