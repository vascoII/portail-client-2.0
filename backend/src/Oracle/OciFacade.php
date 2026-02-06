<?php

namespace App\Oracle;

/**
 * Façade légère autour de oci_connect / oci_* pour Oracle.
 */
class OciFacade
{
    /** @var resource */
    private $conn;

    public function __construct(string $dsn, string $user, string $password)
    {
        $this->conn = oci_connect($user, $password, $dsn, 'AL32UTF8');

        if (! $this->conn) {
            $e = oci_error();
            $message = $e['message'] ?? 'unknown OCI error';
            throw new \RuntimeException('OCI connect failed: ' . $message);
        }
    }

    /**
     * Exécute une requête SELECT et retourne un tableau associatif.
     *
     * @param array<string, scalar|null> $params
     * @return list<array<string, mixed>>
     */
    public function fetchAllAssoc(string $sql, array $params = []): array
    {
        $stid = oci_parse($this->conn, $sql);
        if (! $stid) {
            $e = oci_error($this->conn);
            throw new \RuntimeException('OCI parse failed: ' . ($e['message'] ?? 'unknown'));
        }

        foreach ($params as $name => $value) {
            $paramName = ':' . ltrim($name, ':');
            oci_bind_by_name($stid, $paramName, $params[$name]);
        }

        if (! oci_execute($stid, OCI_NO_AUTO_COMMIT)) {
            $e = oci_error($stid);
            throw new \RuntimeException('OCI execute failed: ' . ($e['message'] ?? 'unknown'));
        }

        $rows = [];
        while (($row = oci_fetch_assoc($stid)) !== false) {
            $rows[] = $row;
        }

        oci_free_statement($stid);

        return $rows;
    }
}
