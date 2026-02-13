<?php

declare(strict_types=1);

namespace App\Entity;

final class Depannage
{
    public function __construct(
        public readonly ?string $workOrderNumber,
        public readonly ?string $numero,
        public readonly ?string $statut,
        public readonly ?string $statutAbrege,
        public readonly ?\DateTimeImmutable $date,
        public readonly ?string $motif,
        public readonly ?string $motifAbrege,
        public readonly ?string $compteRendu
    ) {}
}
