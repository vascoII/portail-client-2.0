<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Infos;

use App\Oracle\OciFacade;
use App\Service\Dto\InfosDepannageDto;
class InfosDepannageRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {}
}
