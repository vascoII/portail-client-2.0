<?php

declare(strict_types=1);

namespace App\Repository\Dto\Document;

final class GetReportExcelOutputDto
{
    public function __construct(
        public readonly mixed $content,   // Le binaire du fichier Excel
        public readonly string $mimeType, // Typiquement 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        public readonly string $filename, // Nom du fichier, ex: 'rapport.xlsx'
        public readonly string $length    // Taille du fichier en octets
    ) {}
}
