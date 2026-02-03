<?php

namespace App\Repository\Oracle;

use Doctrine\DBAL\Connection;

/**
 * Lecture des factures depuis Oracle (migration SOAP → Oracle).
 *
 * À adapter selon le schéma réel (noms de tables/colonnes).
 * Exemple supposé : vue ou table FACTURES avec colonnes alignées sur le SOAP.
 */
class FactureRepository
{
    public function __construct(
        private readonly Connection $connection
    ) {
    }

    /**
     * Retourne les factures pour un utilisateur (pkUser).
     *
     * @return list<array<string, mixed>> Liste de factures (tableau associatif par ligne)
     */
    public function getFacturesForUser(int $pkUser): array
    {
        // Exemple de requête à adapter au schéma Oracle réel.
        // Les noms de tables/colonnes sont des placeholders.
        $sql = <<<'SQL'
            SELECT
                PKFACTURE   AS PKFacture,
                NUMFACTURE  AS NumFacture,
                NUMERO      AS Numero,
                DATEEDITION AS DateEdition,
                MONTANTTOTALHT AS MontantTotalHT,
                MONTANTTOTALTTC AS MontantTotalTTC,
                MONTANTTOTALAPAYER AS MontantTotalAPayer,
                CODEGESTIO  AS CodeGestio,
                ADRESSE     AS Adresse,
                VILLE       AS Ville,
                CP          AS CP
            FROM FACTURES
            WHERE PKUSER = :pkUser
            ORDER BY DATEEDITION DESC
            SQL;

        try {
            $result = $this->connection->executeQuery($sql, ['pkUser' => $pkUser]);
            return $result->fetchAllAssociative();
        } catch (\Throwable $e) {
            // En cas d'erreur (table absente, schéma différent), retourner vide
            // pour permettre le fallback ou le debug sans casser l'app.
            throw $e;
        }
    }
}
