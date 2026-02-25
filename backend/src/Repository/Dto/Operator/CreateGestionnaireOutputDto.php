<?php

declare(strict_types=1);

namespace App\Repository\Dto\Operator;

final class CreateGestionnaireOutputDto
{
    public function __construct(
        public readonly bool $success
    ) {}
}
