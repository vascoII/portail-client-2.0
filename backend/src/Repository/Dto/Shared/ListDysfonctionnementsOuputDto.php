<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class ListDysfonctionnementsOuputDto
{
    public function __construct(
        public readonly array $dysfonctionnements
    ) {}
}
