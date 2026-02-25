<?php

declare(strict_types=1);

namespace App\Repository\Dto\Logement;

final class LogementOutputDto
{
    public function __construct(
        public readonly array $logementDto
    ) {}
}
