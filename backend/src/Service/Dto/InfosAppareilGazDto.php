<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class InfosAppareilGazDto
{
    public function __construct(
        public ?AppareilDto $appareil = null
    ) {}
}
