<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Chantier;

use App\Oracle\OciFacade;

class ChantierRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {
    }

    /**
     * Retourne un chantier par identifiant métier pkImmeuble.
     *
     * @return array<string, mixed>|null
     */
    public function getByPkImmeuble(string $pkImmeuble): ?array
    {
        $sql = <<<SQL
SELECT
    *
FROM CHANTIER
WHERE FKIMMEUBLE = :pkImmeuble
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);

        return $rows ?? null;
    }

}

