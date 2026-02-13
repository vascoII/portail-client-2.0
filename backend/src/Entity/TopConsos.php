<?php

declare(strict_types=1);

namespace App\Entity;

final class TopConsos
{
    /**
     * @param Conso[] $consosGrandes
     * @param Conso[] $consosPetites
     */
    public function __construct(
        public readonly ?\DateTimeImmutable $dateReleve,
        public readonly array $consosGrandes,
        public readonly array $consosPetites
    ) {}
}
