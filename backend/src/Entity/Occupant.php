<?php

declare(strict_types=1);

namespace App\Entity;

final class Occupant
{
    public function __construct(
        public readonly ?int $pkOccupant,
        public readonly ?string $nom,
        public readonly ?string $ref,
        public readonly ?\DateTimeImmutable $dateArrivee,
        public readonly ?\DateTimeImmutable $dateDepart
    ) {}
}
