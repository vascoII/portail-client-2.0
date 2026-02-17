<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class AppareilDto    
{
    public function __construct(
        public readonly ?int $pkAppareil,
        public readonly ?string $numero,
        public readonly ?string $emplacement,
        public readonly ?string $fluide,
        public readonly ?string $typeAppareil,
        public readonly ?string $unite
    ) {}
}
