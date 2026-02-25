<?php

declare(strict_types=1);

namespace App\Repository\Dto\Immeuble;

final class ListLogementsOuputDto
{
    /** @param Immeuble[] $immeubleDto */
    public function __construct(
        public readonly array $immeubleDto
    ) {}
}
