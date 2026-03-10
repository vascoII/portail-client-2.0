<?php

declare(strict_types=1);

namespace App\Repository\Oracle\Client;

use App\Oracle\OciFacade;

class ClientRepository
{
    public function __construct(
        private readonly OciFacade $oci,
    ) {
    }

    /**
     * Retourne tous les clients actifs via la vue WEB_CLIENT.
     *
     * @return array<int, array<string, mixed>>
     */
    public function findAll(): array
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
    VILLE,
    ESPACECLIENT_SHOWIMMEUBLESARC,
    ESPACECLIENT_SHOWFACTURES,
    ESPACECLIENT_SHOWCHANTIERS,
    ESPACECLIENT_SHOWBILLINGOCC,
    CHGT_OCCUPANT_TYPE,
    ESPACECLIENT_GESTION,
    NOTEOCCUPANT,
    ESPACECLIENT_DATEACTIVATIONCLI,
    ESPACECLIENT_DATEACTIVATIONOCC,
    ESPACECLIENT_UNIFICATIONLOGEMENT,
    ESPACECLIENT_TICKETINTER,
    CODEENT,
    FKCLIENT
FROM WEB_CLIENT
ORDER BY NOM
SQL;

        return $this->oci->fetchAllAssoc($sql);
    }

    /**
     * Retourne un client par identifiant métier PKCLIENT.
     *
     * @return array<string, mixed>|null
     */
    public function findOneByPkClient(int $pkClient): ?array
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
    VILLE,
    ESPACECLIENT_SHOWIMMEUBLESARC,
    ESPACECLIENT_SHOWFACTURES,
    ESPACECLIENT_SHOWCHANTIERS,
    ESPACECLIENT_SHOWBILLINGOCC,
    CHGT_OCCUPANT_TYPE,
    ESPACECLIENT_GESTION,
    NOTEOCCUPANT,
    ESPACECLIENT_DATEACTIVATIONCLI,
    ESPACECLIENT_DATEACTIVATIONOCC,
    ESPACECLIENT_UNIFICATIONLOGEMENT,
    ESPACECLIENT_TICKETINTER,
    CODEENT,
    FKCLIENT
FROM WEB_CLIENT
WHERE PKCLIENT = :pkClient
SQL;

        $rows = $this->oci->fetchAllAssoc($sql, ['pkClient' => $pkClient]);

        return $rows[0] ?? null;
    }

    /**
     * Création d'un client.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function create(array $data): void
    {
        throw new \RuntimeException('Oracle write operations are not implemented yet.');
    }

    /**
     * Mise à jour d'un client.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function update(int $pkClient, array $data): void
    {
        throw new \RuntimeException('Oracle write operations are not implemented yet.');
    }

    /**
     * Suppression d'un client.
     * Signature prévue pour un futur support d'écriture Oracle.
     */
    public function delete(int $pkClient): void
    {
        throw new \RuntimeException('Oracle write operations are not implemented yet.');
    }
}

