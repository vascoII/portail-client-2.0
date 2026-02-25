<?php

declare(strict_types=1);

namespace App\Repository\Dto\Intervention;

final class ListCasesOutputDto
{
    public function __construct(
        public readonly bool $success
    ) {}
}
