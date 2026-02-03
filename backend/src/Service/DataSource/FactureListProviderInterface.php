<?php

namespace App\Service\DataSource;

use App\Service\Client;

/**
 * Fournit la liste des factures (GET) soit via SOAP soit via Oracle.
 * Utilisé par FactureApiController pour la migration progressive.
 */
interface FactureListProviderInterface
{
    /**
     * Retourne les factures au format attendu par le contrôleur
     * (compatible avec la réponse SOAP : objet avec ListeFactures->facture).
     *
     * @return object { ListeFactures: { facture: array|object } }
     */
    public function getFactures(Client $client): object;
}
