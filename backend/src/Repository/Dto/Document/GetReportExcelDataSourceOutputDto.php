<?php

declare(strict_types=1);

namespace App\Repository\Dto\Document;

final class GetReportExcelDataSourceOutputDto
{
    public function __construct(
        public readonly ?string $excelContent
    ) {}
}
