<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

use App\Entity\DetailsDepannage;

final class GetDetailsDepannageOutputDto
{
    public function __construct(
        public readonly DetailsDepannage $detailsDepannage
    ) {}
}
