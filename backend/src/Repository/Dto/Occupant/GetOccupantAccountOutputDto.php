<?php

declare(strict_types=1);

namespace App\Repository\Dto\Occupant;

use App\Entity\Occupant;

final class GetOccupantAccountOutputDto
{
    public function __construct(
        public readonly Occupant $occupantAccount
    ) {}
}
