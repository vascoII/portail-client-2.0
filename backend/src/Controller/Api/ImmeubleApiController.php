<?php

namespace App\Controller\Api;

use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\ExcelHelper;
use App\Service\Fuite;
use App\Service\GetImmeublesParams;
use App\Service\GetReportParams;
use App\Service\Immeuble;
use DateTime;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use App\Service\Api\ApiImmeubleService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
use App\Service\FakeDataService;

/**
 * API Controller for Immeubles (Buildings)
 */
#[Route("/api/immeubles", name: "api_immeuble_")]
class ImmeubleApiController extends AbstractApiController
{
    private ApiImmeubleService $apiImmeubleService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null, ApiImmeubleService $apiImmeubleService)
    {
        parent::__construct($client, $serializer, $securityService, $fakeDataService);
        $this->apiImmeubleService = $apiImmeubleService;
    }

    /**
     * Get dashboard with building list
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        $fakeResponse = $this->sendFakeData('api.immeubles');
        if ($fakeResponse !== null) {
            return $fakeResponse;
        }

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $board = $client->getMyTableauBordClient();

            $this->validateToken($client);
            $boardOracle = $this->apiImmeubleService->getMyTableauBordClient($client->getPkUser());

            return $this->success([
                'board' => $this->normalize($board),
                'filters' => [],
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du tableau de bord: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Filter buildings
     *     */
    #[Route("/filtre", name: "filter", methods: ["GET", "POST"])]
    public function filter(Request $request): JsonResponse
    {
        // Check if faker mode is enabled and return fake data (already formatted)
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.filtre');
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
            $params = new GetImmeublesParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            // Get parameters from request
            $requestParams = $request->attributes->get('requestParams', []);
            if ($requestParams == []) {
                $requestParams = $request->attributes->all();
            }

            $ref = $requestParams['ref'] ?? $request->query->get('ref') ?? $request->request->get('ref');
            $refNumero = $requestParams['ref_numero'] ?? $request->query->get('ref_numero') ?? $request->request->get('ref_numero');
            $nom = $requestParams['nom'] ?? $request->query->get('nom') ?? $request->request->get('nom');
            $tout = $requestParams['tout'] ?? $request->query->get('tout') ?? $request->request->get('tout');
            $adresse = $requestParams['adresse'] ?? $request->query->get('adresse') ?? $request->request->get('adresse');
            $search = $requestParams['search'] ?? $request->query->get('search') ?? $request->request->get('search', false);

            if ($search !== false) {
                if (!is_null($ref) || !is_null($refNumero) || !is_null($nom) || !is_null($tout) || !is_null($adresse)) {
                    $params->FIELD_REF = $ref;
                    $params->FIELD_REF_NUMERO = $refNumero;
                    $params->FIELD_NOM = $nom;
                    $params->FIELD_ALLFIELDS = $tout;
                    $params->FIELD_ADRESSE_CP_VILLE = $adresse;

                    $immeubles = $client->getMyImmeubles($params);

                    $immeublesOracle = $this->apiImmeubleService->getMyImmeubles($client->getPkUser(), $params);
                } else {
                    $immeubles = [];
                }
            } else {
                $immeubles = $client->getMyImmeubles($params);

                $immeublesOracle = $this->apiImmeubleService->getMyImmeubles($client->getPkUser(), $params);
            }

            return $this->success([
                'immeubles' => $this->normalize($immeubles),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors du filtrage des immeubles: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get building details
     *     */
    #[Route("/{pkImmeuble}", name: "show", methods: ["GET"])]
    public function show(int $pkImmeuble, Request $request, Immeuble $immeubleService): JsonResponse
    {
        // Check if faker mode is enabled and return fake data (already formatted)
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.pkImmeuble');
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
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);

            if (!$immeuble) {
                return $this->notFound('Immeuble non trouvé');
            }

            $tabs_top_consos = $immeubleService->generateTabTopConsos($immeuble);
            $tabs_evo_consos = $immeubleService->generateTabEvoConsos($immeuble);
            $evolution_charts_js = $immeubleService->generateEvolutionChartsDataByTab($immeuble, $tabs_evo_consos);
            $comparative_chart_js = $immeubleService->generateComparativeChartData($immeuble);

            // Chantier data
            $installed = $immeuble->ImmeubleEC->Chantier->NbCompteursPoses ?? 0;
            $total = $immeuble->ImmeubleEC->Chantier->NbCompteursCommandes ?? 0;
            $remaining = $total - $installed;

            if ($total !== 0) {
                $installed_percent = (int) (100 * $installed) / $total;
                $remaining_percent = (int) (100 * $remaining) / $total;
            } else {
                $installed_percent = 100;
                $remaining_percent = 0;
            }

            $dateEntreeChantier = $immeuble->ImmeubleEC->Chantier->DateEntreeChantier ?? null;
            $date = $dateEntreeChantier ? new DateTime($dateEntreeChantier) : null;

            $chantier = [
                'installed' => $installed,
                'installed_percent' => $installed_percent,
                'remaining' => $remaining,
                'remaining_percent' => $remaining_percent,
                'total' => $installed + $remaining,
                'date' => $date ? $date->format('d/m/Y') : null,
            ];

            $responseData = [
                'immeuble' => $this->normalize($immeuble),
                'evolution_charts' => $evolution_charts_js,
                'comparative_chart' => $comparative_chart_js,
                'tabs_top_consos' => $tabs_top_consos,
                'tabs_evo_consos' => $tabs_evo_consos,
                'chantier' => $chantier,
            ];

            // GPS coordinates for preview/demo mode
            if (file_exists('./../preview.txt') || file_exists('./../demo.txt')) {
                $add = ($immeuble->Immeuble->Adresse1 ?? '') . ' ' .
                    ($immeuble->Immeuble->Cp ?? '') . ' ' .
                    ($immeuble->Immeuble->Ville ?? '');
                $responseData['GPS'] = $immeubleService->getGPSCoordinates($add);
                $responseData['preview'] = file_exists('./../preview.txt') ? 'preview' : null;
                $responseData['demo'] = file_exists('./../demo.txt') ? 'demo' : null;
            }

            return $this->success($responseData);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération de l\'immeuble: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get interventions list
     *     */
    #[Route("/{pkImmeuble}/interventions", name: "list_interventions", methods: ["GET"])]
    public function listInterventions(int $pkImmeuble, Request $request, Depannage $depannageService): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.pkImmeuble.interventions');
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
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $depannages = $client->getInterventionsImmeuble($pkImmeuble);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);
            $depannagesOracle = $this->apiImmeubleService->getInterventionsImmeuble($client->getPkUser(), $pkImmeuble);

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'depannages' => $this->normalize($depannages),
                'filters' => $depannageService->extractFiltersValues($depannages),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des interventions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get leaks list
     *     */
    #[Route("/{pkImmeuble}/fuites", name: "list_leaks", methods: ["GET"])]
    public function listLeaks(int $pkImmeuble, Request $request, Fuite $fuiteService): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.pkImmeuble.fuites');
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
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $fuites = $client->getFuitesImmeuble($pkImmeuble);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);
            $fuitesOracle = $this->apiImmeubleService->getFuitesImmeuble($client->getPkUser(), $pkImmeuble);

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'fuites' => $this->normalize($fuites),
                'filters' => $fuiteService->extractFiltersValues($fuites),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des fuites: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get anomalies list
     *     */
    #[Route("/{pkImmeuble}/anomalies", name: "list_anomalies", methods: ["GET"])]
    public function listAnomalies(int $pkImmeuble, Request $request, Anomalie $anomalieService): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.pkImmeuble.anomalies');
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
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $anomalies = $client->getAnomaliesImmeuble($pkImmeuble);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);
            $anomaliesOracle = $this->apiImmeubleService->getAnomaliesImmeuble($client->getPkUser(), $pkImmeuble);

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'anomalies' => $this->normalize($anomalies),
                'filters' => $anomalieService->extractFiltersValues($anomalies),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des anomalies: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get dysfunctions list
     *     */
    #[Route("/{pkImmeuble}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]
    public function listDysfunctions(int $pkImmeuble, Request $request, Dysfonctionnement $dysfonctionnementService): JsonResponse
    {
        // Check if faker mode is enabled and return fake data
        if ($this->isFakerMode()) {
            try {
                $fakeData = $this->fakeDataService->get('api.immeubles.pkImmeuble.dysfonctionnements');
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
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);
            $dysfonctionnementsOracle = $this->apiImmeubleService->getDysfonctionnementsImmeuble($client->getPkUser(), $pkImmeuble);

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'dysfonctionnements' => $this->normalize($dysfonctionnements),
                'filters' => $dysfonctionnementService->extractFiltersValues($dysfonctionnements),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des dysfonctionnements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export anomalies to Excel
     *     */
    #[Route("/{pkImmeuble}/anomalies/export", name: "export_anomalies", methods: ["GET"])]
    public function exportAnomalies(int $pkImmeuble, Request $request, Anomalie $anomalieService, ExcelHelper $excelHelper): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $anomalies = $client->getAnomaliesImmeuble($pkImmeuble);
            $data = $anomalieService->export($anomalies);
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $excelHelper) {
                    $path = 'php://output';
                    $excelHelper->write($path, $data);
                }
            );
            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', 'attachment; filename=export-anomalies.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des anomalies: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export leaks to Excel
     *     */
    #[Route("/{pkImmeuble}/fuites/export", name: "export_leaks", methods: ["GET"])]
    public function exportLeaks(int $pkImmeuble, Request $request, Fuite $fuiteService, ExcelHelper $excelHelper): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $fuites = $client->getFuitesImmeuble($pkImmeuble);
            $data = $fuiteService->export($fuites);
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $excelHelper) {
                    $path = 'php://output';
                    $excelHelper->write($path, $data);
                }
            );
            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', 'attachment; filename=export-fuites.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des fuites: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export interventions to Excel
     *     */
    #[Route("/{pkImmeuble}/interventions/export", name: "export_interventions", methods: ["GET"])]
    public function exportInterventions(int $pkImmeuble, Request $request, Depannage $depannageService, ExcelHelper $excelHelper): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $depannages = $client->getInterventionsImmeuble($pkImmeuble);
            $data = $depannageService->export($depannages);
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $excelHelper) {
                    $path = 'php://output';
                    $excelHelper->write($path, $data);
                }
            );
            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', 'attachment; filename=export-interventions.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des interventions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export dysfunctions to Excel
     *     */
    #[Route("/{pkImmeuble}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]
    public function exportDysfunctions(int $pkImmeuble, Request $request, Dysfonctionnement $dysfonctionnementService, ExcelHelper $excelHelper): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble);
            $data = $dysfonctionnementService->export($dysfonctionnements);
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $excelHelper) {
                    $path = 'php://output';
                    $excelHelper->write($path, $data);
                }
            );
            $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            $response->headers->set('Content-Disposition', 'attachment; filename=export-alarmestechniques.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des dysfonctionnements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate intervention report (PDF or Excel)
     *     */
    #[Route("/{pkImmeuble}/intervention", name: "intervention_report", methods: ["GET"])]
    public function intervention(Request $request, int $pkImmeuble): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $docType = $request->query->get('doc-type');
            $dateBegin = $request->query->get('date-begin');
            $dateEnd = $request->query->get('date-end');

            if (!$this->validateDate($dateBegin, 'd/m/Y') || !$this->validateDate($dateEnd, 'd/m/Y')) {
                return $this->error('Invalid date format. Expected format: d/m/Y', 400);
            }

            $params = new GetReportParams();
            $params->PKIMMEUBLE = $pkImmeuble;
            $params->DATE1 = $dateBegin;
            $params->DATE2 = $dateEnd;

            $report = null;
            $contentType = 'application/pdf';
            $filename = '';

            if ($docType == 'synthese-inte') {
                $report = $client->getReport('LIVRET_INTER_SYNTHESE', $params);
                $filename = $docType . '-' . $dateBegin . '-' . $dateEnd . '.pdf';
            } elseif ($docType == 'detail-inte') {
                $report = $client->getReport('LIVRET_INTER_DETAIL', $params);
                $filename = $docType . '-' . $dateBegin . '-' . $dateEnd . '.pdf';
            } elseif ($docType == 'detail-excel-inte') {
                $report = $client->getExcel('LIVRET_INTER_LISTE', $params);
                $contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                $filename = $docType . '-' . $dateBegin . '-' . $dateEnd . '.xlsx';
            } else {
                return $this->error('Type de document invalide', 400);
            }

            if (empty($report)) {
                return $this->notFound('Rapport non trouvé');
            }

            $response = new Response($report);
            $response->headers->set('Content-Type', $contentType);
            $response->headers->set('Content-Disposition', 'inline; filename=' . $filename);
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

    /**
     * Get intervention details
     *     */
    #[Route("/{pkImmeuble}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]
    public function showIntervention(int $pkImmeuble, string $pkIntervention, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $depannage = $client->getDetailDepannage($pkIntervention);

            $immeubleOracle = $this->apiImmeubleService->getTableauBordImmeuble($client->getPkUser(), $pkImmeuble);
            $depannageOracle = $this->apiImmeubleService->getDetailDepannage($client->getPkUser(), $pkIntervention);

            if (!$depannage) {
                return $this->notFound('Intervention non trouvée');
            }

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'depannage' => $this->normalize($depannage),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération de l\'intervention: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Download report PDF
     *     */
    #[Route("/{pkImmeuble}/releve_pdf/{type}/{energie}", name: "report_pdf", methods: ["GET"])]
    public function reportPdf(Request $request, int $pkImmeuble, string $type, string $energie, #[MapQueryParameter] int $pkReleve): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            if ($type == 'repartition') {
                $type = null;
            }

            $report = $client->getReportImmeuble($pkImmeuble, is_null($type) ? null : strtoupper($type), is_null($energie) ? null : strtoupper($energie), $pkReleve);

            if (empty($report)) {
                return $this->notFound('Rapport non trouvé');
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
            return $this->error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Download report Excel
     *     */
    #[Route("/{pkImmeuble}/releve_excel/{type}/{energie}", name: "report_excel", methods: ["GET"])]
    public function reportExcel(Request $request, int $pkImmeuble, string $type, string $energie, #[MapQueryParameter] int $pkReleve): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }
        
        if ($type == 'repartition') {
            $type = null;
        }
        $report = $client->getReportImmeubleExcel($pkImmeuble, is_null($type) ? null : strtoupper($type), is_null($energie) ? null : strtoupper($energie), $pkReleve);
        if (empty($report)) {
            $response = new Response();
                $response->headers->set('Content-Type', 'text/html; charset=utf-8');
                $response->setContent($this->getHtml());
                $response->setStatusCode(Response::HTTP_OK);
                return $response;
        }

        $response = new Response($report);
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'inline; filename=releve_' . $pkImmeuble . '_' . $pkReleve . '.xlsx');
        $response->headers->set('Content-Transfer-Encoding', 'binary');
        $response->headers->set('Expires', 0);
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Content-Length', strlen($report));

        return $response;
    }

    private function validateDate(string $date, string $format = 'Y-m-d H:i:s'): bool
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }
}
