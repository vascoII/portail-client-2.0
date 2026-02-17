<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class Conso
{
    public function __construct(
        public readonly ?int $pkLogement,
        public readonly ?string $nomOcc,
        public readonly ?string $refOcc,
        public readonly ?int $fluide,
        public readonly ?float $conso
    ) {}
}
