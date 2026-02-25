<?php

declare(strict_types=1);

namespace App\Repository\Dto\Shared;

final class GetReportByTokenOutputDto
{
    public function __construct(
        public readonly string $reportContent
    ) {}
}
