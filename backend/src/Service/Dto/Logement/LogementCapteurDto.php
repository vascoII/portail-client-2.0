<?php

declare(strict_types=1);

namespace App\Service\Dto\Logement;

use App\Service\Dto\IndexRecapDateDto;
use App\Service\Dto\SerieDto;

final class LogementCapteurDto
{
    public function __construct(
        public ?IndexRecapDateDto $indexRecapTemperature = null,
        public ?IndexRecapDateDto $indexRecapHumidite = null,
        public ?SerieDto $serieConsosTemperature = null,
        public ?SerieDto $serieConsosHumidite = null
    ) {}
}
