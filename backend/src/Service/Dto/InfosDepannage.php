<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class InfosDepannage
{
    public function __construct(
        public readonly ?Logement $logement,
        public readonly ?Occupant $occupant,
        public readonly ?Depannage $depannage
    ) {}
}
