<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class SousTraitantDto
{
    public function __construct(
        public readonly ?string $nom,
        public readonly ?string $description,
        public readonly ?string $territoires,
        public readonly ?string $pays,
        public readonly ?string $adresse,
        public readonly ?string $cp,
        public readonly ?string $ville,
        public readonly ?string $protection
    ) {}
}
