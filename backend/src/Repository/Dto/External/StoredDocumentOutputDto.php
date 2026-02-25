<?php

declare(strict_types=1);

namespace App\Repository\Dto\External;

final class StoredDocumentOutputDto
{
    public function __construct(
        public readonly string $filename,
        public readonly string $path,
        public readonly string $url,
        public readonly string $length
    ) {}
}
