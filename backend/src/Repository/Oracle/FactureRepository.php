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
    ) {}

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
     * mais en exposant aussi CodeGestio / Adresse / CP / Ville).
     *
     * @return list<array<string, mixed>>
     */
    public function getFacturesForClient(int $fkClient): array
    {
        $sql = <<<'SQL'
            SELECT
                f.pkfacture        AS PKFacture,
                f.numdecompte      AS NumFacture,
                f.numdecompte      AS Numero,
                f.dateedition      AS DateEdition,
                f.ht               AS MontantTotalHT,
                f.ttc              AS MontantTotalTTC,
                f.totalapayer      AS MontantTotalAPayer,
                -- infos immeuble agrégées, comme dans le WS C#
                NVL(idi,  immeuble.id)      AS IDImm,
                NVL(adressei, immeuble.adresse) AS Adresse,
                NVL(cpi,  immeuble.cp)      AS CP,
                NVL(villei, immeuble.ville) AS Ville,
                NVL(codegestioi, immeuble.codegestio) AS CodeGestio
            FROM (
                SELECT
                    facture.pkfacture,
                    facture.numdecompte,
                    facture.dateedition,
                    facture.debutperiode,
                    facture.finperiode,
                    facture.ht,
                    facture.ttc,
                    facture.totalapayer,
                    LISTAGG(immeuble.id, ';')         WITHIN GROUP (ORDER BY immeuble.id)          AS idi,
                    LISTAGG(immeuble.codegestio, ';') WITHIN GROUP (ORDER BY immeuble.codegestio)  AS codegestioi,
                    LISTAGG(immeuble.adresse, ';')    WITHIN GROUP (ORDER BY immeuble.adresse)     AS adressei,
                    LISTAGG(immeuble.cp, ';')         WITHIN GROUP (ORDER BY immeuble.cp)          AS cpi,
                    LISTAGG(immeuble.ville, ';')      WITHIN GROUP (ORDER BY immeuble.ville)       AS villei,
                    facture.fkimmeuble
                FROM facture,
                     immeuble,
                     client,
                     (SELECT fkimmeuble, fkfacture FROM lignefacture GROUP BY fkfacture, fkimmeuble) l
                WHERE facture.fkclienttop = :fkClient
                  AND facture.fkclienttop = client.pkclient
                  AND l.fkfacture(+) = pkfacture
                  AND l.fkimmeuble = immeuble.pkimmeuble(+)
                  AND facture.dateedition > SYSDATE - 2*365
                GROUP BY
                    facture.pkfacture,
                    facture.numdecompte,
                    facture.dateedition,
                    facture.fkimmeuble,
                    facture.debutperiode,
                    facture.finperiode,
                    facture.ht,
                    facture.ttc,
                    facture.totalapayer
                ORDER BY facture.pkfacture DESC
            ) f,
            immeuble
            WHERE f.fkimmeuble = immeuble.pkimmeuble(+)
            FETCH FIRST 50 ROWS ONLY
            SQL;

        return $this->oci->fetchAllAssoc($sql, ['fkClient' => $fkClient]);
    }
}
