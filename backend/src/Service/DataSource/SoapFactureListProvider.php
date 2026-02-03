<?php

namespace App\Service\DataSource;

use App\Service\Client;

/**
 * Fournit la liste des factures via le web service SOAP (comportement actuel).
 */
class SoapFactureListProvider implements FactureListProviderInterface
{
    public function getFactures(Client $client): object
    {
        return $client->getFactures();
    }
}
