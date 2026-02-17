<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleCapteur
{
    public function __construct(
        public ?IndexRecapDate $indexRecapTemperature = null,
        public ?IndexRecapDate $indexRecapHumidite = null,
        public ?Serie $serieConsosTemperature = null,
        public ?Serie $serieConsosHumidite = null
    ) {}
}
