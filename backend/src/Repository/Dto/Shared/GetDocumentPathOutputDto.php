<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class GetDocumentPathOutputDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $path
    ) {}
}
