<?php

declare(strict_types=1);

namespace App\Entity;

final class IndexReleve
{
    public function __construct(
        public readonly ?\DateTimeImmutable $dateReleve,
        public readonly ?float $index,
        public readonly ?float $conso
    ) {}
}
