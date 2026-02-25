<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class GetReportOutputDto
{
    public function __construct(
        public readonly string $data,
        public readonly string $filename,
        public readonly string $length
    ) {}
}
