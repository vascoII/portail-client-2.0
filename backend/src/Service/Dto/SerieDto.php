<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class SerieDto
{
    public function __construct(
        public readonly ?int $DefaultIntervalle,
        public readonly ?string $ValeursXyl,
        public readonly ?string $Annee
    ) {}
}
