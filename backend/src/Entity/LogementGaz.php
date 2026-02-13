<?php

declare(strict_types=1);

namespace App\Entity;

final class LogementGaz
{
    /**
     * @param InfosAppareilGaz[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null // InfosAppareilGaz[]
    ) {}
}
