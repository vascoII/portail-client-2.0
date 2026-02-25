<?php

declare(strict_types=1);

namespace App\Repository\Dto\Immeuble;

final class GetImmeubleOutputDto
{
    public function __construct(
        public readonly ?int $pkImmeuble,
        public readonly ?string $nom,
        public readonly ?string $numero,
        public readonly ?string $ref,
        public readonly ?string $adresse1,
        public readonly ?string $adresse2,
        public readonly ?string $adresse3,
        public readonly ?string $cp,
        public readonly ?string $ville
    ) {}
}
