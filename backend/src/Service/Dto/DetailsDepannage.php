<?php

declare(strict_types=1);

namespace App\Service\Dto;

use App\Service\Dto\InfosDepannage;

final class DetailsDepannage
{
    /**
     * @param Depannage[] $listeDepannagesOccupant
     */
    public function __construct(
        public readonly ?InfosDepannage $infosDepannage,
        public readonly array $listeDepannagesOccupant
    ) {}
}
