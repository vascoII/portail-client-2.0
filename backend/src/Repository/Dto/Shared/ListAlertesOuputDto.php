<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class ListAlertesOuputDto
{
    public function __construct(
        public readonly array $alertes
    ) {}
}
