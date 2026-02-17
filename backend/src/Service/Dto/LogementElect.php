<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class LogementElect
{
    /**
     * @param InfosAppareilElect[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null // InfosAppareilElect[]
    ) {}
}
