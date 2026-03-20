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
    public function findOneByPkChantier(int $pkImmeuble): ?array
    {
        $sql = <<<SQL
SELECT
    PKCLIENT,
    ID,
    NOM,
    ADRESSE1,
    ADRESSE2,
    ADRESSE3,
    CP,

    FKCLIENT
FROM WEB_CLIENT
WHERE PKCLIENT = :pkChantier
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkImmeuble' => $pkImmeuble]);

        return $rows[0] ?? null;
    }

}

