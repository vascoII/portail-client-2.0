<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Depannage;

use App\Oracle\OciFacade;
use App\Service\Dto\DetailsDepannageDto;
class DetailsDepannageRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
