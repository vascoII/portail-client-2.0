<?php

namespace App\Service\Api;

use App\Repository\Oracle\DatabaseRepository;

class ApiDatabaseService 
{
    public function __construct(
        private readonly DatabaseRepository $repository,
    ) {
    }

    public function getSchemaTable(string $schema, string $table): array
    {
        return $this->repository->getSchemaTableForOracle($schema, $table);
    }

    public function getData(string $schema, string $table, string $column, mixed $value): array
    {
        return $this->repository->getDataOracle($schema, $table, $column, $value);
    }
}

