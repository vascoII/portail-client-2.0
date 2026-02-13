<?php

declare(strict_types=1);

namespace App\Entity;

final class InfosDepannage
{
    public function __construct(
        public readonly ?Logement $logement,
        public readonly ?Occupant $occupant,
        public readonly ?Depannage $depannage
    ) {}
}
