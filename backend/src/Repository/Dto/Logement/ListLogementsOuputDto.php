<?php

declare(strict_types=1);

namespace App\Repository\Dto\Logement;

use App\Entity\Logement;

final class ListLogementsOuputDto
{
    /** @param Logement[] $listLogementDto */
    public function __construct(
        public readonly array $listLogementDto
    ) {}
}
