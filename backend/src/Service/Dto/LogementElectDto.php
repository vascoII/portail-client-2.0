<?php

declare(strict_types=1);

namespace App\Service\Dto;

final class LogementElectDto
{
    /**
     * @param InfosAppareilElectDto[] $listeInfosAppareils
     */
    public function __construct(
        public ?array $listeInfosAppareils = null // InfosAppareilElectDto[]
    ) {}
}
