<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Chantier;
use App\Entity\TopConsos;
use App\Entity\Serie;

final class ImmeubleEAU
{
    /**
     * @param Releve[] $listeReleves
     */
    public function __construct(
        public ?int $nbCompteursARelever = null,
        public ?int $nbCompteursReleves = null,
        public ?int $nbFuites = null,
        public ?int $degresFuites = null,
        public ?int $nbAnomalies = null,
        public ?int $degresAnomalies = null,
        public ?Chantier $chantier = null,
        public ?TopConsos $topConsos = null,
        public ?Serie $serieConsos1 = null,
        public ?Serie $serieConsos2 = null,
        public ?array $listeReleves = null
    ) {}
}
