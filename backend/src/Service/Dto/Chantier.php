<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class Chantier
{
    public function __construct(
        public readonly ?int $pkChantier,
        public readonly ?int $pkDevis,
        public readonly ?int $pkImmeuble,
        public readonly ?\DateTimeImmutable $dateEntreeChantier,
        public readonly ?int $nbCompteursPoses,
        public readonly ?int $nbCompteursCommandes
    ) {}
}
