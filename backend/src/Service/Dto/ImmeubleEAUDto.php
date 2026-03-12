<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleEAUDto
{
    /**
     * @param ReleveDto[] $listeReleves
     */
    public function __construct(
        public ?int $NbCompteursARelever = null,
        public ?int $NbCompteursReleves = null,
        public ?int $NbFuites = null,
        public ?int $DegresFuites = null,
        public ?int $NbAnomalies = null,
        public ?int $DegresAnomalies = null,
        public ?ChantierDto $Chantier = null,
        public ?TopConsosDto $TopConsos = null,
        public ?SerieDto $SerieConsos1 = null,
        public ?SerieDto $SerieConsos2 = null,
        public ?array $ListeReleves = null
    ) {}
}
