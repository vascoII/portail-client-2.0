<?php

declare(strict_types=1);

namespace App\Repository\Oracle\SousTraitant;

use App\Oracle\OciFacade;
use App\Oracle\OciUpdateHandler;
use App\Service\Dto\SousTraitantDto;

class SousTraitantRepository
{
    public function __construct(
        private readonly OciFacade $oci,
        private readonly OciUpdateHandler $ociUpdate,
    ) {}

    /**
     * Retourne tous les sous-traitants actifs via la vue WEB_SOUSTRAITANT.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findAll(): array
    {
        $sql = <<<SQL
SELECT
    PKSOUSTRAITANT,
    NOM,
    DESCRIPTION,
    TERRITOIRES,
    PAYS,
    ADRESSE,
    CP,
    VILLE,
    PROTECTION,
    ACTIF
FROM WEB_SOUSTRAITANT
ORDER BY NOM
SQL;

        return $this->oci->fetchAllAssoc($sql);
    }

    /**
     * Retourne un sous-traitant par identifiant.
     *
     * @return array<string, mixed>|null
     */
    public function findOneById(int $pkSousTraitant): ?array
    {
        $sql = <<<SQL
SELECT
    PKSOUSTRAITANT,
    NOM,
    DESCRIPTION,
    TERRITOIRES,
    PAYS,
    ADRESSE,
    CP,
    VILLE,
    PROTECTION,
    ACTIF
FROM WEB_SOUSTRAITANT
WHERE PKSOUSTRAITANT = :pk
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pk' => $pkSousTraitant]);

        return $rows[0] ?? null;
    }

    /**
     * Création d'un sous-traitant.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function create(SousTraitantDto $dto): void
    {
        throw new \RuntimeException('Oracle write operations are not implemented yet.');
    }

    /**
     * Mise à jour d'un sous-traitant.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function update(int $pkSousTraitant, SousTraitantDto $dto): void
    {
        $sql = <<<SQL
UPDATE SOUSTRAITANT
SET
    NOM         = :nom,
    DESCRIPTION = :description,
    TERRITOIRES = :territoires,
    PAYS        = :pays,
    ADRESSE     = :adresse,
    CP          = :cp,
    VILLE       = :ville,
    PROTECTION  = :protection
WHERE PKSOUSTRAITANT = :pk
SQL;

        $params = [
            'pk'          => $pkSousTraitant,
            'nom'         => $dto->nom,
            'description' => $dto->description,
            'territoires' => $dto->territoires,
            'pays'        => $dto->pays,
            'adresse'     => $dto->adresse,
            'cp'          => $dto->cp,
            'ville'       => $dto->ville,
            'protection'  => $dto->protection,
        ];

        $this->ociUpdate->update($sql, $params);
    }

    /**
     * Suppression d'un sous-traitant.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function delete(int $pkSousTraitant): void
    {
        throw new \RuntimeException('Oracle write operations are not implemented yet.');
    }
}
