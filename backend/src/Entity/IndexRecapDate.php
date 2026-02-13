<?php

declare(strict_types=1);

namespace App\Entity;

final class IndexRecapDate
{
    public function __construct(
        public readonly ?\DateTimeImmutable $date,
        public readonly ?float $moy,
        public readonly ?float $max,
        public readonly ?float $min
    ) {}
}
