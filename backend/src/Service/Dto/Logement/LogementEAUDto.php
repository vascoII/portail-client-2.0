<?php

declare(strict_types=1);

namespace App\Service\Dto\Logement;

use App\Service\Dto\InfosAppareilEAUDto;
use App\Service\Dto\ConsosPeriodeDto;
use App\Service\Dto\SerieDto;

final class LogementEAUDto
{
    /**
     * @param InfosAppareilEAUDto[] $listeInfosAppareils
     */
    public function __construct(
        public ?int $nbFuites = null,
        public ?int $nbAnomalies = null,
        public ?ConsosPeriodeDto $consoPeriode = null,
        public ?array $listeInfosAppareils = null, // InfosAppareilEAUDto[]
        public ?SerieDto $serieConsos = null,
        public ?float $consoMemeTypeLogement = null
    ) {}
}
