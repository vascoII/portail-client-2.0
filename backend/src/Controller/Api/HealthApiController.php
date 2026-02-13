<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Service\Api\ApiHealthService;


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
        private readonly ApiHealthService $apiHealthService
    ) {
    }

    /**
     * Health check endpoint for database connection
     * 
     * Effectue un "ping" de la base de données Oracle pour valider :
     * - La connexion à Oracle
     * 
     * @return JsonResponse
     */
    #[Route("/database", name: "database", methods: ["GET"])]
    public function databaseHealth(): JsonResponse
    {
        try {
            $res = $this->apiHealthService->getHealth();   
            
            return $this->json(['status' => $res ? 'ok' : 'error']);
        } catch (\Throwable $e) {
            return $this->json([
                'status' => 'error',
                'oracle_error' => $e->getMessage(),
            ], 500);
        }
    }
}
