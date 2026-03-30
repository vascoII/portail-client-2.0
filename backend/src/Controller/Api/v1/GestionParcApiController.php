<?php

namespace App\Controller\Api\v1;

use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\Fuite;
use App\Service\GetImmeublesParams;
use App\Service\GetReportParams;
use App\Service\Immeuble;
use DateTime;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

require_once './tech/fpdf/fpdf.php';

/**
 * API Controller for Gestion Parc (Property Management)
 */
#[Route("/api/v1/gestion-parc", name: "api_v1_gestion_parc_")]
class GestionParcApiController extends AbstractApiController
{
    /**
     * Get dashboard with building list
     */
    #[Route("", name: "index", methods: ["GET"])]
    public function index(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $board = $client->getMyTableauBordClientNoCache();

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
     */
    #[Route("/filtre", name: "filter", methods: ["GET", "POST"])]
    public function filter(Request $request): JsonResponse
    {
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
            $ref = $request->query->get('ref') ?? $request->request->get('ref');
            $refNumero = $request->query->get('ref_numero') ?? $request->request->get('ref_numero');
            $nom = $request->query->get('nom') ?? $request->request->get('nom');
            $tout = $request->query->get('tout') ?? $request->request->get('tout');
            $adresse = $request->query->get('adresse') ?? $request->request->get('adresse');
            $search = $request->query->get('search') ?? $request->request->get('search', false);

            if ($search !== false) {
                if (!is_null($ref) || !is_null($refNumero) || !is_null($nom) || !is_null($tout) || !is_null($adresse)) {
                    $params->FIELD_REF = $ref;
                    $params->FIELD_REF_NUMERO = $refNumero;
                    $params->FIELD_NOM = $nom;
                    $params->FIELD_ALLFIELDS = $tout;
                    $params->FIELD_ADRESSE_CP_VILLE = $adresse;

                    $immeubles = $client->getMyImmeubles($params, false);
                } else {
                    $immeubles = [];
                }
            } else {
                $immeubles = $client->getMyImmeubles($params, false);
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
     */
    #[Route("/{pkImmeuble}", name: "show", methods: ["GET"])]
    public function show(int $pkImmeuble, Request $request, Immeuble $immeubleService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);

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

            return $this->success([
                'immeuble' => $this->normalize($immeuble),
                'evolution_charts' => $evolution_charts_js,
                'comparative_chart' => $comparative_chart_js,
                'tabs_top_consos' => $tabs_top_consos,
                'tabs_evo_consos' => $tabs_evo_consos,
                'chantier' => $chantier,
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération de l\'immeuble: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get intervention details
     */
    #[Route("/{pkImmeuble}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]
    public function showIntervention(int $pkImmeuble, int $pkIntervention, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $depannage = $client->getDetailDepannage($pkIntervention);

            if (!$depannage) {
                return $this->notFound('Intervention not found');
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
     * Get interventions list
     */
    #[Route("/{pkImmeuble}/interventions", name: "list_interventions", methods: ["GET"])]
    public function listInterventions(int $pkImmeuble, Request $request, Depannage $depannageService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $depannages = $client->getInterventionsImmeuble($pkImmeuble);

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
     */
    #[Route("/{pkImmeuble}/fuites", name: "list_leaks", methods: ["GET"])]
    public function listLeaks(int $pkImmeuble, Request $request, Fuite $fuiteService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $fuites = $client->getFuitesImmeuble($pkImmeuble);

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
     */
    #[Route("/{pkImmeuble]/anomalies", name: "list_anomalies", methods: ["GET"])]
    public function listAnomalies(int $pkImmeuble, Request $request, Anomalie $anomalieService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $anomalies = $client->getAnomaliesImmeuble($pkImmeuble);

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
     */
    #[Route("/{pkImmeuble]/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]
    public function listDysfunctions(int $pkImmeuble, Request $request, Dysfonctionnement $dysfonctionnementService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble);

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
     * Download report PDF
     */
    #[Route("/{pkImmeuble}/releve/{type}/{energie}", name: "report", methods: ["GET", "POST"])]
    public function report(Request $request, int $pkImmeuble, string $type, string $energie): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $date = $request->query->get('date') ?? $request->request->get('date');
            $report = $client->getReportImmeuble($pkImmeuble, $type, $energie, $date);

            if (empty($report)) {
                $pdf = new \FPDF();
                $pdf->AddPage();
                $pdf->SetFont('Helvetica', '', 14);

                // Centrer le texte sur la page
                $message = "Aucun rapport disponible pour la période sélectionnée.";
                $pdf->SetXY(10, 10); // Position approximativement verticale au centre
                $pdf->Cell(190, 10, mb_convert_encoding($message, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C'); // FPDF attend ISO-8859-1 par défaut

                $pdfOutput = $pdf->Output('', 'S');

                $response = new Response($pdfOutput, Response::HTTP_OK, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="rapport-vide.pdf"',
                    'Content-Length' => strlen($pdfOutput),
                ]);

                return $response;
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
     * Export anomalies to Excel
     */
    #[Route("/{pkImmeuble}/anomalies/export", name: "export_anomalies", methods: ["GET"])]
    public function exportAnomalies(int $pkImmeuble, Request $request, Anomalie $anomalieService): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $anomalies = $client->getAnomaliesImmeuble($pkImmeuble);
            $data = $anomalieService->export($anomalies);
            $helper = $this->container->get('excel.helper');
            
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $helper) {
                    $path = 'php://output';
                    $helper->write($path, $data);
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
     */
    #[Route("/{pkImmeuble}/fuites/export", name: "export_leaks", methods: ["GET"])]
    public function exportLeaks(int $pkImmeuble, Request $request, Fuite $fuiteService): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $fuites = $client->getFuitesImmeuble($pkImmeuble);
            $data = $fuiteService->export($fuites);
            $helper = $this->container->get('excel.helper');
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $helper) {
                    $path = 'php://output';
                    $helper->write($path, $data);
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
     */
    #[Route("/{pkImmeuble}/interventions/export", name: "export_interventions", methods: ["GET"])]
    public function exportInterventions(int $pkImmeuble, Request $request, Depannage $depannageService): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $depannages = $client->getInterventionsImmeuble($pkImmeuble);
            $data = $depannageService->export($depannages);
            $helper = $this->container->get('excel.helper');
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }

            $response = new StreamedResponse(
                function () use ($data, $helper) {
                    $path = 'php://output';
                    $helper->write($path, $data);
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
     */
    #[Route("/{pkImmeuble}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]
    public function exportDysfunctions(int $pkImmeuble, Request $request, Dysfonctionnement $dysfonctionnementService): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble);
            $data = $dysfonctionnementService->export($dysfonctionnements);
            $helper = $this->container->get('excel.helper');
            // ⚠️ Important : ne nettoyer le buffer que s'il existe
            if (ob_get_level() > 0) {
                ob_end_clean();
            }    

            $response = new StreamedResponse(
                function () use ($data, $helper) {
                    $path = 'php://output';
                    $helper->write($path, $data);
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
     */
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
                return $this->error('Format de date invalide. Format attendu: d/m/Y', 400);
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
                $pdf = new \FPDF();
                $pdf->AddPage();
                $pdf->SetFont('Helvetica', '', 14);

                // Centrer le texte sur la page
                $message = "Aucun rapport disponible pour la période sélectionnée.";
                $pdf->SetXY(10, 10); // Position approximativement verticale au centre
                $pdf->Cell(190, 10, mb_convert_encoding($message, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C'); // FPDF attend ISO-8859-1 par défaut

                $pdfOutput = $pdf->Output('', 'S');

                $response = new Response($pdfOutput, Response::HTTP_OK, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="rapport-vide.pdf"',
                    'Content-Length' => strlen($pdfOutput),
                ]);

                return $response;
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


    private function validateDate(string $date, string $format = 'Y-m-d H:i:s'): bool
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }
}
