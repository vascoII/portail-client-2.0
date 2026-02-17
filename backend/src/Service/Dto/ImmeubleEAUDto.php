<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleEAUDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?int $nbFuites = null,
        public ?int $degresFuites = null,
        public ?int $nbAnomalies = null,
        public ?int $degresAnomalies = null,
        public ?ChantierDto $chantier = null,
        public ?TopConsosDto $topConsos = null,
        public ?SerieDto $serieConsos1 = null,
        public ?SerieDto $serieConsos2 = null,
        public ?array $listeReleves = null
    ) {}
}
