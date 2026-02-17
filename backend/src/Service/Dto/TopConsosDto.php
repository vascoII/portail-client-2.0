<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class TopConsosDto
{
    /**
     * @param ConsoDto[] $consosGrandes
     * @param ConsoDto[] $consosPetites
     */
    public function __construct(
        public readonly ?\DateTimeImmutable $dateReleve,
        public readonly array $consosGrandes,
        public readonly array $consosPetites
    ) {}
}
