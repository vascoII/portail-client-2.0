<?php

declare(strict_types=1);

namespace App\Service\Dto;

use App\Service\Dto\InfosDepannageDto;

final class DetailsDepannageDto
{
    /**
     * @param DepannageDto[] $listeDepannagesOccupant
     */
    public function __construct(
        public readonly ?InfosDepannageDto $infosDepannage,
        public readonly array $listeDepannagesOccupant
    ) {}
}
