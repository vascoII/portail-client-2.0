<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class DysfonctionnementDto
{
    public function __construct(
        public readonly ?int $duree,
        public readonly ?\DateTimeImmutable $dateDebut,
        public readonly ?float $indexDebut,
        public readonly ?float $conso,
        public readonly ?string $type
    ) {}
}
