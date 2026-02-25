<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class ListFuitesOutputDto
{
    public function __construct(
        public readonly array $fuites
    ) {}
}
