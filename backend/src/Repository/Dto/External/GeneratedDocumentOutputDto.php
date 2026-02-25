<?php

declare(strict_types=1);

namespace App\Repository\Dto\External;

final class GeneratedDocumentOutputDto
{
    public function __construct(
        public readonly int $id,
        public readonly string $filename,
        public readonly string $url,
        public readonly string $length
    ) {}
}
