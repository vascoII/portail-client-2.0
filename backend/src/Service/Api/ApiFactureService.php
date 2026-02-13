<?php

namespace App\Service\Api;

use App\Repository\Oracle\FactureRepository;

/**
 * Service métier pour les factures côté API.
 *
 * Objectif : remplacer progressivement l'appel SOAP getFactures()
 * par un accès direct Oracle (via FactureRepository).
 */
class ApiFactureService
{
    public function __construct(
        private readonly FactureRepository $factureRepository,
    ) {
    }

    public function getFactures(int $pkUser)
    {
        $rows = $this->factureRepository->getFacturesForUser($pkUser);

        $factures = [];
        foreach ($rows as $row) {
            $factures[] = (object) [
                'PKFacture'          => $row['PKFacture'] ?? null,
                'NumFacture'         => $row['NumFacture'] ?? $row['Numero'] ?? null,
                'Numero'             => $row['Numero'] ?? $row['NumFacture'] ?? null,
                'DateEdition'        => $row['DateEdition'] ?? null,
                'MontantTotalHT'     => isset($row['MontantTotalHT']) ? (float) $row['MontantTotalHT'] : null,
                'MontantTotalTTC'    => isset($row['MontantTotalTTC']) ? (float) $row['MontantTotalTTC'] : null,
                'MontantTotalAPayer' => isset($row['MontantTotalAPayer']) ? (float) $row['MontantTotalAPayer'] : null,
                // Champs non encore disponibles dans la requête simplifiée Oracle
                'CodeGestio'         => $row['CodeGestio'] ?? null,
                'Adresse'            => $row['Adresse'] ?? null,
                'Ville'              => $row['Ville'] ?? null,
                'CP'                 => $row['CP'] ?? null,
            ];
        }

        $liste = new \stdClass();
        $liste->facture = $factures;

        $response = new \stdClass();
        $response->ListeFactures = $liste;

        return $response;
    }

}

