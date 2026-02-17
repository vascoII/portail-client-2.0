<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleGazDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?ChantierDto $chantier = null,
        public ?TopConsosDto $topConsos = null,
        public ?array $listeReleves = null
    ) {}
}
