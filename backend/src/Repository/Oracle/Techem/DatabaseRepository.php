<?php

namespace App\Repository\Oracle;

use App\Oracle\OciFacade;

class DatabaseRepository
{

    public function __construct(
        private readonly OciFacade $oci
    ) {}

    public function getSchemaTableForOracle(string $schema, string $table)
    {
        $sql = "SELECT * FROM " . strtoupper($schema) . "." . strtoupper($table) . " FETCH FIRST 10 ROWS ONLY";
            
        try {
            return $this->oci->fetchAllAssoc($sql, []);
        } catch(\Exception $exception) {
            return ['sql' => $sql, 'error' => $exception->getMessage(), 'status' => 400];
        }
    }

    public function getDataOracle(string $schema, string $table, string $column, mixed $value)
    {
        // Sécurisation des identifiants
        $schema = $this->sanitizeIdentifier($schema);
        $table  = $this->sanitizeIdentifier($table);
        $column = $this->sanitizeIdentifier($column);

        $sql = "SELECT * FROM {$schema}.{$table} WHERE {$column} = :value";
        
        try {
            return $this->oci->fetchAllAssoc($sql, ['value' => $value]);
        } catch(\Exception $exception) {
            return ['sql' => $sql, 'error' => $exception->getMessage(), 'status' => 400];
        }
    }

    private function sanitizeIdentifier(string $input): string
    {
        if (!preg_match('/^[A-Z0-9_]+$/i', $input)) {
            throw new \InvalidArgumentException("Invalid identifier: $input");
        }
        return strtoupper($input);
    }
}
