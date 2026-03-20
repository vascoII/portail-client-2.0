<?php

namespace App\Controller\Api\v2;

use App\Service\Anomalie;
use App\Service\CsvHelper;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\Fuite;
use App\Service\GetReportParams;
use App\Service\Logement;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;

require_once './tech/fpdf/fpdf.php';
/**
 * API Controller for Occupants
 */
#[Route("/api/v2/occupant", name: "api_v2_occupant_")]
class OccupantApiController extends AbstractApiController
{
    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService)
    {
        parent::__construct($client, $serializer, $securityService);
    }

    /**
     * Get current occupant's logement details
     */
    #[Route("/{fk}", name: "show", methods: ["GET"])]
    public function show(Request $request, Logement $logementService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $consoTabs = $logementService->generateTabConsos($logement);
            $soustraitants = $client->getSousTraitants();

            // Handle repart appareils
            $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart ?? [];
            if (count($repartAppareils) > 1) {
                $allAppareils = new \stdClass();
                $allAppareils->Appareil = new \stdClass();
                $allAppareils->Appareil->PkAppareil = "0000000";
                $allAppareils->Appareil->Numero = "0000000";
                $allAppareils->Appareil->Emplacement = "Tous les appareils";
                $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU ?? null;
                array_unshift($repartAppareils, $allAppareils);
                $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'consoTabs' => $this->normalize($consoTabs),
                'soustraitants' => $this->normalize($soustraitants),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du logement de l\'occupant: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get simulator data for current occupant
     */
    #[Route("/{fk}/simulateur", name: "simulateur", methods: ["GET"])]
    public function simulateur(Request $request, Logement $logementService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $consoTabs = $logementService->generateTabConsos($logement);

            // Handle repart appareils
            $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart ?? [];
            if (count($repartAppareils) > 1) {
                $allAppareils = new \stdClass();
                $allAppareils->Appareil = new \stdClass();
                $allAppareils->Appareil->PkAppareil = "0000000";
                $allAppareils->Appareil->Numero = "0000000";
                $allAppareils->Appareil->Emplacement = "Tous les appareils";
                $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU ?? null;
                array_unshift($repartAppareils, $allAppareils);
                $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'consoTabs' => $this->normalize($consoTabs),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des données du simulateur: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get intervention details
     */
    #[Route("/{fk}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]
    public function showIntervention(string $pkIntervention, Request $request): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $depannage = $client->getDetailDepannage($pkIntervention);

            return $this->success([
                'logement' => $this->normalize($logement),
                'depannage' => $this->normalize($depannage),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des détails de l\'intervention: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List interventions for current occupant
     */
    #[Route("/{fk}/interventions", name: "list_interventions", methods: ["GET"])]
    public function listInterventions(Request $request, Depannage $depannageService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $depannages = $client->getInterventionsImmeuble($pkImmeuble, $logement->Logement->PkLogement, $userFk);
            } else {
                $depannages = [];
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'depannages' => $this->normalize($depannages),
                'filters' => $depannageService->extractFiltersValues($depannages),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des interventions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List leaks for current occupant
     */
    #[Route("/{fk}/fuites", name: "list_leaks", methods: ["GET"])]
    public function listLeaks(Request $request, Fuite $fuiteService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;
            $pkAppareil = $request->query->get('appareil');

            if ($pkImmeuble) {
                $fuites = $client->getFuitesImmeuble($pkImmeuble, $logement->Logement->PkLogement, $pkAppareil, $userFk);
            } else {
                $fuites = [];
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'fuites' => $this->normalize($fuites),
                'filters' => $fuiteService->extractFiltersValues($fuites),
            ]);
        } catch (\Exception $e) {
            return $this->error('Fuites lors de la récupération des erreurs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List dysfunctions for current occupant
     */
    #[Route("/{fk}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]
    public function listDysfunctions(Request $request, Dysfonctionnement $dysfonctionnementService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble, $logement->Logement->PkLogement, $userFk);
           } else {
                $dysfonctionnements = [];
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'dysfonctionnements' => $this->normalize($dysfonctionnements),
                'filters' => $dysfonctionnementService->extractFiltersValues($dysfonctionnements),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des dysfonctionnements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List anomalies for current occupant
     */
    #[Route("/{fk}/anomalies", name: "list_anomalies", methods: ["GET"])]
    public function listAnomalies(Request $request, Anomalie $anomalieService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;
            $pkAppareil = $request->query->get('appareil');

            if ($pkImmeuble) {
                $anomalies = $client->getAnomaliesImmeuble($pkImmeuble, $logement->Logement->PkLogement, $pkAppareil, $userFk);
            } else {
                $anomalies = [];
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'anomalies' => $this->normalize($anomalies),
                'filters' => $anomalieService->extractFiltersValues($anomalies),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des anomalies: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export anomalies to CSV
     */
    #[Route("/{fk}/anomalies/export", name: "export_anomalies", methods: ["GET"])]
    public function exportAnomalies(Request $request, Anomalie $anomalieService, CsvHelper $csvHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $anomalies = $client->getAnomaliesImmeuble($pkImmeuble, $logement->Logement->PkLogement, null, $userFk);
            } else {
                $anomalies = [];
            }

            $data = $anomalieService->export($anomalies);

            $response = new StreamedResponse(
                function () use ($data, $csvHelper) {
                    $handle = fopen('php://output', 'r+');
                    $csvHelper->write($handle, $data);
                    fclose($handle);
                }
            );
            $response->headers->set('Content-Type', 'text/csv');
            $response->headers->set('Content-Disposition', 'attachment; filename="export-anomalies.csv";');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des anomalies: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export leaks to CSV
     */
    #[Route("/{fk}/fuites/export", name: "export_leaks", methods: ["GET"])]
    public function exportLeaks(Request $request, Fuite $fuiteService, CsvHelper $csvHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $fuites = $client->getFuitesImmeuble($pkImmeuble, $logement->Logement->PkLogement, null, $userFk);
            } else {
                $fuites = [];
            }

            $data = $fuiteService->export($fuites);

            $response = new StreamedResponse(
                function () use ($data, $csvHelper) {
                    $handle = fopen('php://output', 'r+');
                    $csvHelper->write($handle, $data);
                    fclose($handle);
                }
            );
            $response->headers->set('Content-Type', 'text/csv');
            $response->headers->set('Content-Disposition', 'attachment; filename="export-fuites.csv";');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des fuites: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export interventions to CSV
     */
    #[Route("/{fk}/interventions/export", name: "export_interventions", methods: ["GET"])]
    public function exportInterventions(Request $request, Depannage $depannageService, CsvHelper $csvHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $depannages = $client->getInterventionsImmeuble($pkImmeuble, $logement->Logement->PkLogement, $userFk);
            } else {
                $depannages = [];
            }

            $data = $depannageService->export($depannages);

            $response = new StreamedResponse(
                function () use ($data, $csvHelper) {
                    $handle = fopen('php://output', 'r+');
                    $csvHelper->write($handle, $data);
                    fclose($handle);
                }
            );
            $response->headers->set('Content-Type', 'text/csv');
            $response->headers->set('Content-Disposition', 'attachment; filename="export-depannages.csv";');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des interventions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export dysfunctions to CSV
     */
    #[Route("/{fk}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]
    public function exportDysfunctions(Request $request, Dysfonctionnement $dysfonctionnementService, CsvHelper $csvHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordOccupant($userFk);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble, $logement->Logement->PkLogement, $userFk);
            } else {
                $dysfonctionnements = [];
            }

            $data = $dysfonctionnementService->export($dysfonctionnements);

            $response = new StreamedResponse(
                function () use ($data, $csvHelper) {
                    $handle = fopen('php://output', 'r+');
                    $csvHelper->write($handle, $data);
                    fclose($handle);
                }
            );
            $response->headers->set('Content-Type', 'text/csv');
            $response->headers->set('Content-Disposition', 'attachment; filename="export-autres-dysfonctionnemnts.csv";');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des dysfonctionnements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get water report PDF
     */
    #[Route("/{pkOccupant}/releve-eau", name: "releve_eau", methods: ["GET"])]
    public function showEauReleve(int $pkOccupant, Request $request): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $params = new GetReportParams();
            $params->PKOCCUPANT = $pkOccupant;
            $params->TYPEERC = 'EAU';

            $report = $client->getReport('RELEVE_OCCUPANT', $params);
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
     * Get repartition report PDF
     */
    #[Route("/{pkOccupant}/releve-repart/{pkImmeuble}", name: "releve_repart", methods: ["GET"])]
    public function showRepartReleve(int $pkImmeuble, int $pkOccupant, Request $request): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $params = new GetReportParams();
            $params->PKIMMEUBLE = $pkImmeuble;
            $params->PKOCCUPANT = $pkOccupant;

            $report = $client->getReport('REPART_OCCUPANT', $params);
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
     * Get note report PDF
     */
    #[Route("/{pkOccupant}/releve-note/{pkImmeuble}/{energie}", name: "releve_note", methods: ["GET"])]
    public function showNoteReleve(int $pkImmeuble, int $pkOccupant, string $energie, Request $request): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $params = new GetReportParams();
            if ($energie == 'CHAUFFAGE') {
                $params->PKOCCUPANT = $pkOccupant . '|TYPEERC=CHAUFFAGE';
                $params->PKIMMEUBLE = $pkImmeuble;
            } else {
                $params->PKOCCUPANT = $pkOccupant . '|TYPEERC=EAU';
                $params->PKIMMEUBLE = $pkImmeuble;
            }

            $report = $client->getReport('NOTE_INFO_MENSUELLE', $params);
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
     * Submit water meter reading (public endpoint, no authentication required)
     * POST /api/occupant/releve
     */
    #[Route("/releve", name: "releve", methods: ["POST"])]
    public function submitReleve(Request $request): JsonResponse
    {
        // Endpoint public : pas d'authentification requise
        $data = json_decode($request->getContent(), true);

        // Validation des champs obligatoires (mêmes que submit_contact.php)
        $requiredFields = [
            'immeuble',
            'date_passage',
            'prenom',
            'nom',
            'adresse',
            'code_postal',
            'ville',
            'telephone',
            'email',
        ];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                return $this->error("Le champ '$field' est requis", 400);
            }
        }

        try {
            // Délègue l'appel SOAP au service Client (setReleveOccupant)
            $this->client->setReleveOccupant($data);

            return $this->success(['success' => true], 'Relevé transmis avec succès', 200);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'envoi du relevé: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get my account information
     */
    #[Route("/{fk}/my-account", name: "my_account", methods: ["GET", "POST"])]
    public function myAccount(Logement $logementService, Request $request): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            // Handle POST request for RGPD consent update
            if ($request->isMethod('POST')) {
                $requestData = json_decode($request->getContent(), true);
                $rgpdcheckboxvalue = (isset($requestData['rgpd_checkbox']) && $requestData['rgpd_checkbox']) ? 'true' : 'false';
            } else {
                // GET request - get current RGPD value from user
                $data = $request->getContent();
                $rgpdcheckboxvalue = $data ? 'true' : 'false';
            }

            $logement = $client->getTableauBordOccupant($userFk);
            $consoTabs = $logementService->generateTabConsos($logement);

            // Handle repart appareils
            $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart ?? [];
            if (count($repartAppareils) > 1) {
                $allAppareils = new \stdClass();
                $allAppareils->Appareil = new \stdClass();
                $allAppareils->Appareil->PkAppareil = "0000000";
                $allAppareils->Appareil->Numero = "0000000";
                $allAppareils->Appareil->Emplacement = "Tous les appareils";
                $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU ?? null;
                array_unshift($repartAppareils, $allAppareils);
                $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'consoTabs' => $this->normalize($consoTabs),
                'rgpdcheckboxvalue' => $rgpdcheckboxvalue,
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des informations du compte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get or update alerts configuration
     */
    #[Route("/{fk}/alertes", name: "alertes", methods: ["GET", "POST"])]
    public function alertes(Request $request, Logement $logementService): JsonResponse
    {
        $userFk = $request->get('fk') ?? $request->query->get('fk');

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            if ($request->isMethod('POST')) {
                $data = $request->request->all();
                if (isset($data['SEUIL_CONSO_ACTIF'])) {
                    $data['SEUIL_CONSO_ACTIF'] = 'O';
                } else {
                    $data['SEUIL_CONSO_ACTIF'] = 'N';
                }
                $client->setSeuilConso($data);
            }

            $logement = $client->getTableauBordOccupant($userFk);
            $consoTabs = $logementService->generateTabConsos($logement);

            // Handle repart appareils
            $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart ?? [];
            if (count($repartAppareils) > 1) {
                $allAppareils = new \stdClass();
                $allAppareils->Appareil = new \stdClass();
                $allAppareils->Appareil->PkAppareil = "0000000";
                $allAppareils->Appareil->Numero = "0000000";
                $allAppareils->Appareil->Emplacement = "Tous les appareils";
                $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU ?? null;
                array_unshift($repartAppareils, $allAppareils);
                $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'consoTabs' => $this->normalize($consoTabs)
            ], $request->isMethod('POST') ? 'Alertes mises à jour avec succès' : null);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération/mise à jour des alertes: ' . $e->getMessage(), 500);
        }
    }
}
