<?php

declare(strict_types=1);

namespace App\Entity;

final class Serie
{
    public function __construct(
        public readonly ?int $defaultIntervalle,
        public readonly ?string $valeursXyl,
        public readonly ?string $annee
    ) {}
}
