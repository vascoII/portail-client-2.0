<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class ImmeubleCapteurDto
{
    public function __construct(
        public ?IndexRecapDateDto $IndexRecapTemperature = null,
        public ?IndexRecapDateDto $IndexRecapHumidite = null,
        public ?SerieDto $SerieConsosTemperature = null,
        public ?SerieDto $SerieConsosHumidite = null
    ) {}
}
