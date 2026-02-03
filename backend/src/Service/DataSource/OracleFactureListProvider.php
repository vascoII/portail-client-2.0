<?php

namespace App\Service\DataSource;

use App\Repository\Oracle\FactureRepository;
use App\Service\Client;

/**
 * Fournit la liste des factures via Oracle (requêtes SQL).
 * Construit une réponse au format compatible SOAP pour le contrôleur.
 */
class OracleFactureListProvider implements FactureListProviderInterface
{
    public function __construct(
        private readonly FactureRepository $factureRepository
    ) {
    }

    public function getFactures(Client $client): object
    {
        $pkUser = (int) $client->getPkUser();
        $rows = $this->factureRepository->getFacturesForUser($pkUser);

        $factures = [];
        foreach ($rows as $row) {
            $factures[] = (object) [
                'PKFacture' => $row['PKFacture'] ?? null,
                'NumFacture' => $row['NumFacture'] ?? $row['Numero'] ?? null,
                'Numero' => $row['Numero'] ?? $row['NumFacture'] ?? null,
                'DateEdition' => $row['DateEdition'] ?? null,
                'MontantTotalHT' => isset($row['MontantTotalHT']) ? (float) $row['MontantTotalHT'] : null,
                'MontantTotalTTC' => isset($row['MontantTotalTTC']) ? (float) $row['MontantTotalTTC'] : null,
                'MontantTotalAPayer' => isset($row['MontantTotalAPayer']) ? (float) $row['MontantTotalAPayer'] : null,
                'CodeGestio' => $row['CodeGestio'] ?? null,
                'Adresse' => $row['Adresse'] ?? null,
                'Ville' => $row['Ville'] ?? null,
                'CP' => $row['CP'] ?? null,
            ];
        }

        $listeFactures = new \stdClass();
        $listeFactures->facture = $factures;

        $response = new \stdClass();
        $response->ListeFactures = $listeFactures;

        return $response;
    }
}
