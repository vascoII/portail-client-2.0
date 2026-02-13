<?php

declare(strict_types=1);

namespace App\Entity;

final class Logement
{
    public function __construct(
        public readonly ?int $pkLogement,
        public readonly ?string $numBatiment,
        public readonly ?string $adrBatiment,
        public readonly ?string $numEscalier,
        public readonly ?string $adrEscalier,
        public readonly ?string $numEtage,
        public readonly ?string $numOrdre,
        public readonly ?string $type
    ) {}
}
