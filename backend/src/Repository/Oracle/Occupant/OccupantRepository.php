<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Occupant;

use App\Oracle\OciFacade;
use App\Service\Dto\OccupantDto;
class OccupantRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
