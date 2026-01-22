<?php

namespace App\Controller\Api;

use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

/**
 * API Controller for Health Checks
 * 
 * Note: Cet endpoint n'utilise pas d'authentification, comme d'autres endpoints
 * existants (ex: /login). C'est une pratique courante pour les health checks.
 */
#[Route("/api/health", name: "api_health_")]
class HealthApiController extends AbstractController
{
    public function __construct(
        private Connection $connection,
        private ?LoggerInterface $logger = null
    ) {
    }

    /**
     * Health check endpoint for database connection
     * 
     * Effectue un "ping" de la base de données Oracle pour valider :
     * - La connexion à Oracle
     * - La configuration Doctrine DBAL
     * - L'extension PHP OCI8
     * 
     * @param Request $request
     * @return JsonResponse
     */
    #[Route("/database", name: "database", methods: ["GET"])]
    public function databaseHealth(Request $request): JsonResponse
    {
        try {
            // Test de connexion avec SELECT 1 FROM DUAL (requête Oracle standard pour ping)
            $result = $this->connection->executeQuery('SELECT 1 FROM DUAL')->fetchOne();
            
            if ($result != 1) {
                throw new \RuntimeException('Unexpected query result');
            }
            
            // Récupérer des informations sur la connexion
            $serverVersion = $this->connection->getServerVersion();
            $databaseName = $this->connection->getDatabase();
            $params = $this->connection->getParams();
            // Extraire le nom du driver depuis les paramètres de connexion
            $driverName = $params['driver'] ?? 'unknown';
            
            return new JsonResponse([
                'success' => true,
                'status' => 'healthy',
                'data' => [
                    'database' => [
                        'connected' => true,
                        'server_version' => $serverVersion,
                        'database_name' => $databaseName,
                        'driver' => $driverName,
                    ],
                    'timestamp' => (new \DateTime())->format('c'),
                ],
            ], 200);
            
        } catch (Exception $e) {
            if ($this->logger) {
                $this->logger->error('Database health check failed', [
                    'exception' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
            
            return new JsonResponse([
                'success' => false,
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'timestamp' => (new \DateTime())->format('c'),
            ], 503);
        } catch (\Exception $e) {
            // Catch any other exception (not just DBAL exceptions)
            if ($this->logger) {
                $this->logger->error('Database health check failed', [
                    'exception' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
            
            return new JsonResponse([
                'success' => false,
                'status' => 'unhealthy',
                'message' => 'Database health check error: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'timestamp' => (new \DateTime())->format('c'),
            ], 503);
        }
    }
}
