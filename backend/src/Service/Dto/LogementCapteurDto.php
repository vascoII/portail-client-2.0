<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class LogementCapteurDto
{
    public function __construct(
        public ?IndexRecapDateDto $indexRecapTemperature = null,
        public ?IndexRecapDateDto $indexRecapHumidite = null,
        public ?SerieDto $serieConsosTemperature = null,
        public ?SerieDto $serieConsosHumidite = null
    ) {}
}
