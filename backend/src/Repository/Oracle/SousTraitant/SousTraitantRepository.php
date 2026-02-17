<?php

declare(strict_types=1);

namespace App\Repository\Oracle\SousTraitant;

use App\Oracle\OciFacade;
use App\Service\Dto\SousTraitantDto;
class SousTraitantRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
