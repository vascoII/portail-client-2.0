<?php

declare(strict_types=1);

namespace App\Service\Dto\Info;

use App\Service\Dto\AppareilDto;
use App\Service\Dto\SerieDto;
use App\Service\Dto\IndexReleveDto;

final class InfosAppareilRepartDto
{
    public function __construct(
        public ?AppareilDto $appareil = null,
        public ?SerieDto $serieConsosDJU = null,
        public ?SerieDto $serieConsos = null,
        public ?IndexReleveDto $r6 = null,
        public ?IndexReleveDto $r5 = null,
        public ?IndexReleveDto $r4 = null,
        public ?IndexReleveDto $r3 = null,
        public ?IndexReleveDto $r2 = null,
        public ?IndexReleveDto $r1 = null
    ) {}
}
