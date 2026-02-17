<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Immeuble;

use App\Oracle\OciFacade;
use App\Service\Dto\ImmeubleCETDto;
class ImmeubleCETRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
