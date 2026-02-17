<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class InfosDepannageDto
{
    public function __construct(
        public readonly ?LogementDto $logement,
        public readonly ?OccupantDto $occupant,
        public readonly ?DepannageDto $depannage
    ) {}
}
