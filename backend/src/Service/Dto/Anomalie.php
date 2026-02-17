<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class Anomalie
{
    public function __construct(
        public readonly ?float $index,
        public readonly ?float $conso,
        public readonly ?string $observations
    ) {}
}
