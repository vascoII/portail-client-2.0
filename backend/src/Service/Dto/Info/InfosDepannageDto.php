<?php

declare(strict_types=1);

namespace App\Service\Dto\Info;

use App\Service\Dto\Logement\LogementDto;
use App\Service\Dto\OccupantDto;
use App\Service\Dto\DepannageDto;

final class InfosDepannageDto
{
    public function __construct(
        public readonly ?LogementDto $logement,
        public readonly ?OccupantDto $occupant,
        public readonly ?DepannageDto $depannage
    ) {}
}
