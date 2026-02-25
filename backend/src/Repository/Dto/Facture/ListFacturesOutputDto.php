<?php

declare(strict_types=1);

namespace App\Repository\Dto\Facture;

use App\Domain\Entity\Facture;

final class ListFacturesOutputDto
{
    /** @param Facture[] $factures */
    public function __construct(
        public readonly array $factures
    ) {}
}
