<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class InfosAppareilEAUDto
{
    public function __construct(
        public ?AppareilDto $appareil = null,
        public ?SerieDto $serieConsos = null,
        public ?IndexReleveDto $r6 = null,
        public ?IndexReleveDto $r5 = null,
        public ?IndexReleveDto $r4 = null,
        public ?IndexReleveDto $r3 = null,
        public ?IndexReleveDto $r2 = null,
        public ?IndexReleveDto $r1 = null,
        public ?int $nbFuites = null,
        public ?int $nbDepannages = null,
        public ?int $nbDysfonctionnements = null,
        public ?int $nbAnomalies = null
    ) {}
}
