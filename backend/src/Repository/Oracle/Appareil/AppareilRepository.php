<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Appareil;

use App\Oracle\OciFacade;
use App\Service\Dto\AppareilDto;
class AppareilRepository    
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
