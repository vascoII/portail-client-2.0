<?php

namespace App\Service\DataSource;

use App\Service\Client;

/**
 * Route les appels "liste factures" vers SOAP ou Oracle selon la config (DATA_SOURCE_FACTURES).
 */
class FactureListProviderRouter implements FactureListProviderInterface
{
    public const SOURCE_SOAP = 'soap';
    public const SOURCE_ORACLE = 'oracle';

    public function __construct(
        private readonly SoapFactureListProvider $soapProvider,
        private readonly OracleFactureListProvider $oracleProvider,
        private readonly string $source
    ) {
    }

    public function getFactures(Client $client): object
    {
        return $this->source === self::SOURCE_ORACLE
            ? $this->oracleProvider->getFactures($client)
            : $this->soapProvider->getFactures($client);
    }
}
