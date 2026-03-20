<?php

declare(strict_types=1);

namespace App\Service\Dto\Logement;

use App\Service\Dto\InfosAppareilGazDto;

final class LogementGazDto
{
    /**
     * @param InfosAppareilGazDto[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null // InfosAppareilGazDto[]
    ) {}
}
