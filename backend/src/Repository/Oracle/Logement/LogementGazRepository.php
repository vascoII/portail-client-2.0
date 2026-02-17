<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Logement;

use App\Oracle\OciFacade;
use App\Service\Dto\LogementGazDto;
class LogementGazRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
