<?php

declare(strict_types=1);

namespace App\Entity;

final class LogementEAU
{
    /**
     * @param InfosAppareilEAU[] $listeInfosAppareils
     */
    public function __construct(
        public ?int $nbFuites = null,
        public ?int $nbAnomalies = null,
        public ?ConsosPeriode $consoPeriode = null,
        public ?array $listeInfosAppareils = null, // InfosAppareilEAU[]
        public ?Serie $serieConsos = null,
        public ?float $consoMemeTypeLogement = null
    ) {}
}
