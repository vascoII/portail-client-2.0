<?php

declare(strict_types=1);

namespace App\Repository\Dto\Occupant;

use App\Entity\Occupant;


final class GetOccupantOutputDto
{
    public function __construct(
        public readonly Occupant $occupant
    ) {}
}
