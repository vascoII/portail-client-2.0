<?php

namespace App\Oracle;

/**
 * Façade légère autour de oci_connect / oci_* pour Oracle.
 */
class OciFacade
{
    private $conn = null;

    public function __construct(
        private string $dsn,
        private string $user,
        private string $password
    ) {}

    public function getConnection()
    {
        if ($this->conn === null) {
            $this->conn = oci_connect($this->user, $this->password, $this->dsn, 'AL32UTF8');
        }

        return $this->conn;
    }

    public function fetchAllAssoc(string $sql, array $params = []): array
    {
        $stid = oci_parse($this->getConnection(), $sql);
        if (! $stid) {
            $e = oci_error($this->getConnection());
            throw new \RuntimeException(
                "OCI parse failed: " . ($e['message'] ?? 'unknown') . "\nSQL: $sql"
            );
        }

        // Bind params
        $boundParams = [];
        if ($params) {
            foreach ($params as $name => $value) {
                $paramName = ':' . ltrim($name, ':');
                $boundParams[$paramName] = $value;

                oci_bind_by_name($stid, $paramName, $params[$name]);
            }
        }

        if (! oci_execute($stid, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($stid);

            $currentSchema = $this->getSingleValue("SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') FROM dual");
            $currentUser   = $this->getSingleValue("SELECT USER FROM dual");

            throw new \RuntimeException(
                "OCI execute failed:\n" .
                "Oracle error: " . ($e['message'] ?? 'unknown') . "\n" .
                "Error code: " . ($e['code'] ?? 'n/a') . "\n\n" .
                "SQL:\n$sql\n\n" .
                "Params:\n" . json_encode($boundParams, JSON_PRETTY_PRINT) . "\n\n" .
                "Current schema: $currentSchema\n" .
                "Connected user: $currentUser\n"
            );
        }

        $rows = [];
        while (($row = oci_fetch_array($stid, OCI_ASSOC | OCI_RETURN_NULLS | OCI_RETURN_LOBS)) !== false) {
            $rows[] = $row;
        }

        oci_free_statement($stid);

        return self::normalize_to_utf8($rows);
        //return $rows;
    }

    /**
     * Renvoie une valeur simple Oracle
     */
    private function getSingleValue(string $sql): ?string
    {
        $stid = oci_parse($this->getConnection(), $sql);
        if (! $stid || ! oci_execute($stid)) {
            return null;
        }

        $row = oci_fetch_row($stid);
        oci_free_statement($stid);

        return $row[0] ?? null;
    }

    public function pingHealth(): bool
    {
        try {
            $this->fetchAllAssoc('SELECT 1 FROM DUAL');
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function normalize_to_utf8(mixed $value): mixed
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = self::normalize_to_utf8($v);
            }
            return $value;
        }

        if (is_string($value)) {
            // Si la chaîne n'est pas du tout valide UTF-8, on convertit
            if (!mb_check_encoding($value, 'UTF-8')) {
                // Essais successifs (le plus courant : ISO-8859-1 / Windows-1252)
                $encodings = ['UTF-8', 'Windows-1252', 'ISO-8859-1', 'ISO-8859-15'];
                foreach ($encodings as $enc) {
                    $converted = @mb_convert_encoding($value, 'UTF-8', $enc);
                    if ($converted !== false && mb_check_encoding($converted, 'UTF-8')) {
                        return $converted;
                    }
                }

                // Dernier filet de sécurité : remplace les octets invalides
                return iconv('UTF-8', 'UTF-8//IGNORE', $value);
            }
            return $value;
        }

        return $value;
    }
}
