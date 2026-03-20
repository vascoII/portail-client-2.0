<?php

namespace App\Oracle;

/**
 * Façade d'écriture Oracle dédiée aux opérations de création (INSERT).
 *
 * - Utilise des requêtes préparées (oci_parse / oci_bind_by_name)
 * - Exécute en mode OCI_NO_AUTO_COMMIT
 * - Fait un COMMIT explicite en cas de succès
 * - Fait un ROLLBACK en cas d'erreur et relance une exception détaillée
 */
class OciCreateHandler
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
    /**
     * Exécute un INSERT dans une transaction sécurisée.
     *
     * @param string $sql    Requête INSERT avec bind variables (:id, :name, ...)
     * @param array  $params Tableau associatif nom => valeur
     *
     * @return int Nombre de lignes insérées
     */
    public function insert(string $sql, array $params = []): int
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
                // On stocke la valeur dans un tableau pour que la référence reste valide
                $boundParams[$paramName] = $value;
                oci_bind_by_name($stid, $paramName, $boundParams[$paramName]);
            }
        }

        try {
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

            $rowCount = oci_num_rows($stid);

            if (! oci_commit($this->getConnection())) {
                $e = oci_error($this->getConnection());
                throw new \RuntimeException('OCI commit failed: ' . ($e['message'] ?? 'unknown'));
            }

            oci_free_statement($stid);

            return $rowCount;
        } catch (\Throwable $e) {
            // Sécurité maximale : rollback systématique en cas d'erreur
            @oci_rollback($this->getConnection());
            oci_free_statement($stid);
            throw $e;
        }
    }

    /**
     * Renvoie une valeur simple Oracle pour enrichir les messages d'erreur.
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
}

