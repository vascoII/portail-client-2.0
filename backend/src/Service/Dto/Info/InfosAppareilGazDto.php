<?php

declare(strict_types=1);

namespace App\Service\Dto\Info;

use App\Service\Dto\AppareilDto;

final class InfosAppareilGazDto
{
    public function __construct(
        public ?AppareilDto $appareil = null
    ) {}
}
