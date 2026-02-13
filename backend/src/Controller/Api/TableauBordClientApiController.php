<?php

namespace App\Controller\Api;

use App\Service\GetReportParams;
use DateTime;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiTableauBordClientService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
use App\Service\FakeDataService;
/**
 * API Controller for Client Dashboard (Tableau de bord client)
 */
#[Route("/api/parc", name: "api_dashboard_")]
class TableauBordClientApiController extends AbstractApiController
{

    private ApiTableauBordClientService $apiTableauBordClientService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null, ApiTableauBordClientService $apiTableauBordClientService)
    {
        parent::__construct($client, $serializer, $securityService, $fakeDataService);
        $this->apiTableauBordClientService = $apiTableauBordClientService;
    }
    
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data (already formatted)
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.parc');
                return new JsonResponse($fakeData);
            } catch (\Exception $e) {
                return $this->error('Fake data not available: ' . $e->getMessage(), 500);
            }
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $board = $client->getMyTableauBordClient();

            $boardOracle = $this->apiTableauBordClientService->getMyTableauBordClient(pkUser: $client->getPkUser());

            // Calculate installation statistics
            $installed = $board->NbCompteursPoses ?? 0;
            $total = $board->NbCompteursCommandes ?? 0;
            $remaining = $total - $installed;

            if ($total > 0) {
                $installed_percent = (int) (100 * $installed) / $total;
                $remaining_percent = (int) (100 * $remaining) / $total;
            } else {
                $installed_percent = 100;
                $remaining_percent = 0;
            }

            $chantier = [
                'installed' => $installed,
                'installed_percent' => $installed_percent,
                'remaining' => $remaining,
                'remaining_percent' => $remaining_percent,
                'total' => $total,
                'date' => null,
            ];

            $data = [
                'board' => $this->normalize($board),
                'chantier' => $chantier,
            ];

            // Check for demo mode
            if (file_exists(__DIR__ . '/../../../demo.txt')) {
                $data['demo'] = true;
                if (isset($data['board']['PcImmeublesTransfertFichiers'])) {
                    $data['board']['PcImmeublesTransfertFichiers'] = '100';
                }
            }

            return $this->success($data);
        } catch (\Exception $e) {
            return $this->error('Error fetching dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get intervention report (PDF or Excel)
     */
    #[Route("/intervention", name: "intervention", methods: ["GET"])]
    public function intervention(Request $request): Response|JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.parc.intervention');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $docType = $request->query->get('doc-type');
        $dateBegin = $request->query->get('date-begin');
        $dateEnd = $request->query->get('date-end');

        if (!$this->validateDate($dateBegin, 'd/m/Y') || !$this->validateDate($dateEnd, 'd/m/Y')) {
            return $this->error('Invalid date format. Expected format: d/m/Y', 400);
        }

        try {
            $params = new GetReportParams();
            $params->PKUSER = $client->getPkUser();
            $params->DATE1 = $dateBegin;
            $params->DATE2 = $dateEnd;

            $report = null;
            $isExcel = false;

            if ($docType == 'synthese-inte') {
                $report = $client->getReport('LIVRET_INTER_SYNTHESE', $params);
            } elseif ($docType == 'detail-inte') {
                $report = $client->getReport('LIVRET_INTER_DETAIL', $params);
            } elseif ($docType == 'detail-excel-inte') {
                $report = $client->getExcel('LIVRET_INTER_LISTE', $params);
                $isExcel = true;
            } else {
                return $this->error('Invalid document type. Allowed: synthese-inte, detail-inte, detail-excel-inte', 400);
            }

            if (empty($report)) {
                return $this->notFound('Report not found');
            }

            $response = new Response($report);

            if ($isExcel) {
                $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                $response->headers->set(
                    'Content-Disposition',
                    'inline; filename=' . $docType . '-' . $dateBegin . '-' . $dateEnd . '.xlsx'
                );
            } else {
                $response->headers->set('Content-Type', 'application/pdf');
                $response->headers->set(
                    'Content-Disposition',
                    'inline; filename=' . $docType . '-' . $dateBegin . '-' . $dateEnd . '.pdf'
                );
            }

            $response->headers->set('Content-Transfer-Encoding', 'binary');
            $response->headers->set('Expires', 0);
            $response->headers->set('Cache-Control', 'no-cache');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Content-Length', strlen($report));

            return $response;
        } catch (\Exception $e) {
            return $this->error('Error generating report: ' . $e->getMessage(), 500);
        }
    }


    private function validateDate(?string $date, string $format = 'Y-m-d H:i:s'): bool
    {
        if (empty($date)) {
            return false;
        }
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }
}
