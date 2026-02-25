<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class ListIndicatorsOuputDto
{
    /** @param [] $indicators */
    public function __construct(
        public readonly array $indicators
    ) {}
}
