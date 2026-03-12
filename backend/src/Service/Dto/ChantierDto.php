<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ChantierDto
{
    public function __construct(
        public readonly ?int $PkChantier,
        public readonly ?int $PkDevis,
        public readonly ?int $PkImmeuble,
        public readonly ?\DateTimeImmutable $DateEntreeChantier,
        public readonly ?int $NbCompteursPoses,
        public readonly ?int $NbCompteursCommandes
    ) {}
}
