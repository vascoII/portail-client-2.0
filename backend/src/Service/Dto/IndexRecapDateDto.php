<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class IndexRecapDateDto
{
    public function __construct(
        public readonly ?\DateTimeImmutable $Date,
        public readonly ?float $Moy,
        public readonly ?float $Max,
        public readonly ?float $Min
    ) {}
}
