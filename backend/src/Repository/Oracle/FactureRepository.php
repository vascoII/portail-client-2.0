<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;
use App\Repository\Oracle\UserRepository;

/**
 * Lecture des factures depuis Oracle (migration SOAP → Oracle).
 *
 * À adapter selon le schéma réel (noms de tables/colonnes).
 * Exemple supposé : vue ou table FACTURES avec colonnes alignées sur le SOAP.
 */
class FactureRepository
{
    public function __construct(
        private readonly OciFacade $oci,
        private readonly UserRepository $userRepository
    ) {
    }

    /**
     * Retourne les factures pour un utilisateur (pkUser).
     *
     * @return list<array<string, mixed>> Liste de factures (tableau associatif par ligne)
     */
    public function getFacturesForUser(int $pkUser): array
    {
        $fkClient = $this->userRepository->getFkClientForUser($pkUser);
        if ($fkClient === null) {
            return [];
        }

        return $this->getFacturesForClient($fkClient);
    }

    /**
     * Retourne les factures pour un client top (FKCLIENTTOP),
     * en suivant la logique du WebService C# (version simplifiée
     * sans jointures sur immeuble/client pour l’instant).
     *
     * @return list<array<string, mixed>>
     */
    public function getFacturesForClient(int $fkClient): array
    {
        $sql = <<<'SQL'
            SELECT
                PKFACTURE      AS PKFacture,
                NUMDECOMPTE    AS NumFacture,
                NUMDECOMPTE    AS Numero,
                DATEEDITION    AS DateEdition,
                HT             AS MontantTotalHT,
                TTC            AS MontantTotalTTC,
                TOTALAPAYER    AS MontantTotalAPayer
            FROM FACTURE
            WHERE FKCLIENTTOP = :fkClient
              AND DATEEDITION > SYSDATE - 2*365
            ORDER BY PKFACTURE DESC
            FETCH FIRST 50 ROWS ONLY
            SQL;

        return $this->oci->fetchAllAssoc($sql, ['fkClient' => $fkClient]);
    }
}
