<?php

declare(strict_types=1);

namespace App\Repository\Dto\Immeuble;

final class ListImmeublesOutputDto
{
    /** @param Immeuble[] $listImmeubleDto */
    public function __construct(
        public readonly array $listImmeubleDto
    ) {}
}
