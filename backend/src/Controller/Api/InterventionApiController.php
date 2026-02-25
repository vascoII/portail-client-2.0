<?php

namespace App\Controller\Api;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

/**
 * API Controller for Interventions (Depannages)
 */
#[Route("/api/interventions", name: "api_intervention_")]
class InterventionApiController extends AbstractApiController
{
    /**
     * Download intervention report PDF
     */
    #[Route("/{pkDepannage}/report", name: "report", methods: ["GET"])]
    public function report(string $pkDepannage, Request $request): Response|JsonResponse
    {

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $report = $client->getReportDepannage($pkDepannage);

            if (empty($report)) {
                return $this->notFound('Rapport d\'intervention introuvable');
            }

            $response = new Response($report);
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', 'inline; filename=relevé-' . date('d-m-Y') . '.pdf');
            $response->headers->set('Content-Transfer-Encoding', 'binary');
            $response->headers->set('Expires', 0);
            $response->headers->set('Cache-Control', 'no-cache');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Content-Length', strlen($report));

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la génération du rapport d\'intervention: ' . $e->getMessage(), 500);
        }
    }
}
