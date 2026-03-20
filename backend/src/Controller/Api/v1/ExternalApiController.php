<?php

namespace App\Controller\Api\v1;

use App\Service\GetReportParams;
use DateTime;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiExternalService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
/**
 * API Controller for Rxternal services (token, getReport)
 */
#[Route("/api/v1/document", name: "api_v1_document_")]
class ExternalApiController extends AbstractApiController
{

    private ApiExternalService $apiExternalService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ApiExternalService $apiExternalService)
    {
        parent::__construct($client, $serializer, $securityService);
        $this->apiExternalService = $apiExternalService ;
    }
    
    #[Route("/reporttoken/{id}", name: "report_by_token", methods: ["GET"])]
    public function reportByToken(Request $request, int $id): JsonResponse
    {
        try {
            $pdfContent = $this->client->getReportByToken($id);

            $response = new Response($pdfContent);
            $response->headers->set('Content-Type', 'application/pdf');
            $response->headers->set('Content-Disposition', 'inline; filename="document.pdf"');
            $response->headers->set('Content-Transfer-Encoding', 'binary');
            $response->headers->set('Expires', 0);
            $response->headers->set('Cache-Control', 'no-cache');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Content-Length', strlen($pdfContent));

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du rapport par jeton: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get generated Document report (PDF)
     */
    #[Route("/receive", name: "receive_pdf", methods: ["POST"])]
    public function reveiveGeneratedDocument(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (! is_array($data) || ! isset($data['id']) || ! isset($data['content'])) {
                return new JsonResponse(['error' => 'Invalid payload'], Response::HTTP_BAD_REQUEST);
            }

            $stored = $this->apiExternalService->storeDocumentReportService($data);
            return new JsonResponse($stored, Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du rapport par jeton: ' . $e->getMessage(), 500);
        }
    }
}
