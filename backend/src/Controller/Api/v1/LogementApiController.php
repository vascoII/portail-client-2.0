<?php

namespace App\Controller\Api\v1;

use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\ExcelHelper;
use App\Service\Fuite;
use App\Service\GetLogementsParams;
use App\Service\GetReportParams;
use App\Service\Logement;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiLogementService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;

require_once './tech/fpdf/fpdf.php';

/**
 * API Controller for Logements (Housing Units)
 */
#[Route("/api/v1/logements", name: "api_v1_logement_")]
class LogementApiController extends AbstractApiController
{

    private ApiLogementService $apiLogementService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ApiLogementService $apiLogementService)
    {
        parent::__construct($client, $serializer, $securityService);
        $this->apiLogementService = $apiLogementService;
    }

    #[Route("/immeuble/{pkImmeuble}", name: "index", methods: ["GET"])]
    public function index(int $pkImmeuble, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble);
            
            return $this->success([
                'immeuble' => $this->normalize($immeuble),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération de l\'immeuble: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a ticket for a logement
     */
    #[Route("/{pkLogement}/tickets", name: "create_ticket", methods: ["POST"])]
    public function createTicket(int $pkLogement, Request $request, LoggerInterface $logger): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $formData = $request->request->all()['intervention'] ?? [];
        /*'Nom'        => $data['name'],
            'Email'      => $data['email'],
            'TelFixe'    => $data['phone'],
            'TelMobile'  => $data['mobile'],
            'Objet'      => $data['objet'],
            'MotifLibre' => $data['message'],*/
        $logger->info('Form data received: ' . print_r($formData, true));

        if (empty($formData['message']) || empty($formData['pkLogement']) || empty($formData['name'])) {
            return $this->error('Champs requis manquants: message, pkLogement, name', 400);
        }

        try {
            $attachment = $request->files->get('intervention')['attachment'] ?? null;

            if (!empty($attachment)) {
                $originalName = $attachment->getClientOriginalName();
                $pathName = $attachment->getPathname();
                $img = file_get_contents($pathName);
                $imgBase64 = base64_encode($img);

                $logger->info('File Attachment: ' . print_r($attachment, true));

                $attachmentSend = [
                    'name' => $originalName,
                    'content' => $imgBase64,
                ];

                $nbTickets = $client->createTicketInterAttachment($formData, $attachmentSend);
            } else {
                $nbTickets = $client->createTicketInter($formData);
            }

            return $this->success([
                'nbTickets' => $nbTickets,
                'pkLogement' => $formData['pkLogement'],
            ], 'Demande d\'intervention envoyée');
        } catch (\Exception $e) {
            $logger->error('Erreur lors de la création du ticket: ' . $e->getMessage());
            return $this->error('Erreur lors de la création du ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ticket owner information
     */
    #[Route("/{pkLogement}/ticket-owner", name: "ticket_owner", methods: ["GET", "POST"])]
    public function getTicketOwner(int $pkLogement, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        // Support both GET and POST for compatibility
        $pkLogementParam = $request->request->get('pkLogement') ?? $pkLogement;

        try {
            $ticketOwner = $client->getTicketInterInit($pkLogementParam);

            return $this->success($this->normalize($ticketOwner));
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du propriétaire du ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Search logements
     */
    #[Route("/search", name: "search", methods: ["GET"])]
    public function search(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $board = $client->getMyTableauBordClient();

            return $this->success($this->normalize($board));
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du tableau de bord: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get device information for a logement
     */
    #[Route("/{pkLogement}/appareils/{type}", name: "infos_appareils", methods: ["GET"])]
    public function getInfosAppareil(int $pkLogement, string $type, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $types = [
            'eau' => [
                'EF' => 'EAU',
                'EC' => 'EAU',
            ],
            'chauffage' => [
                'Repart' => 'Repart',
                'CET' => 'CET',
            ],
        ];

        if (!isset($types[$type])) {
            return $this->error('Type invalide. Doit être "eau" ou "chauffage"', 400);
        }

        try {
            $appareils = $client->getInfosAppareilsType($pkLogement, $types[$type]);

            return $this->success([
                'pkLogement' => $pkLogement,
                'type' => $type,
                'appareils' => $this->normalize($appareils),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des informations sur les appareils: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get logement details
     */
    #[Route("/{pkLogement}", name: "show", methods: ["GET"])]
    public function show(int $pkLogement, Request $request, Logement $logementService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $ticketOwner = $client->getTicketInterInit($pkLogement);
            $nbTickets = $client->getNbTicketsInterByLogement($pkLogement);
            $consoTabs = $logementService->generateTabConsos($logement);

            $isnew = false;
            $dataOccupant = $client->getOccupants($logement->Immeuble->PkImmeuble, $logement->Occupant->PkOccupant, $isnew);
            $changeinprogress = isset($dataOccupant['newNom']);

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
                'ticketOwner' => $this->normalize($ticketOwner),
                'nbTickets' => $nbTickets,
                'consoTabs' => $this->normalize($consoTabs),
                'changeinprogress' => $changeinprogress,
                'occupant' => $this->normalize($dataOccupant),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du logement: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update occupant information
     */
    #[Route("/{pkLogement}/occupant", name: "update_occupant", methods: ["PUT", "PATCH"])]
    public function updateOccupant(int $pkLogement, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->error('Données JSON invalides', 400);
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $isnew = false;
            $occu = $client->setOccupants4Chgt($logement->Occupant->PkOccupant, $data, $isnew);

            return $this->success($this->normalize($occu), 'Occupant mis à jour avec succès');
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la mise à jour de l\'occupant: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get repartition report PDF
     */
    #[Route("/{pkLogement}/releve-repart", name: "releve_repart", methods: ["GET", "POST"])]
    public function showRepartReleve(int $pkLogement, Request $request): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if (!$pkImmeuble) {
                return $this->notFound('Immeuble non trouvé pour ce logement');
            }

            $params = new GetReportParams();
            $params->PKIMMEUBLE = $pkImmeuble;
            $params->PKLOGEMENT = $pkLogement;

            $report = $client->getReport('REPART_LOGEMENT', $params);
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
     * Get intervention details for a logement
     */
    #[Route("/{pkLogement}/interventions/{pkIntervention}", name: "show_intervention", methods: ["GET"])]
    public function showIntervention(int $pkLogement, int $pkIntervention, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
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
     * List interventions for a logement
     */
    #[Route("/{pkLogement}/interventions", name: "list_interventions", methods: ["GET"])]
    public function listInterventions(int $pkLogement, Request $request, Depannage $depannageService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $depannages = $client->getInterventionsImmeuble($pkImmeuble, $pkLogement);
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
     * Filter logements
     */
    #[Route("/filter", name: "filter", methods: ["GET", "POST"])]
    public function filterResult(Request $request, Logement $logementService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $parameters = json_decode($request->getContent(), true);
            $pkImmeuble = $parameters['pkImmeuble'];

            $params = new GetLogementsParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            $ref = $request->get('ref') ?? $request->query->get('ref');
            $ref_numero = $request->get('ref_numero') ?? $request->query->get('ref_numero');
            $nom = $request->get('nom') ?? $request->query->get('nom');
            $tout = $request->get('tout') ?? $request->query->get('tout');
            $adresse = $request->get('adresse') ?? $request->query->get('adresse');
            //$pkImmeuble = $request->get('pkImmeuble', -1) ?? $request->query->get('pkImmeuble', -1);
            $search = $request->get('search', false) ?? $request->query->get('search', false);
            $gestion = $request->get('gestion', false) ?? $request->query->get('gestion', false);

            if ($search !== false) {
                if (!is_null($ref) || !is_null($ref_numero) || !is_null($nom) || !is_null($tout) || !is_null($adresse)) {
                    if (!is_null($ref)) {
                        $params->FIELD_REFOCCUPANT = $ref;
                    } elseif (!is_null($ref_numero)) {
                        $params->FIELD_REFOCCUPANT = $ref_numero;
                    }

                    $params->FIELD_NOM = $nom;
                    $params->FIELD_ALLFIELDS = $tout;
                    $params->FIELD_ADRESSE_CP_VILLE = $adresse;

                    $logements = $client->getLogements($pkImmeuble, $params);
                } else {
                    $logements = [];
                }
            } else {
                $logements = $client->getLogements($pkImmeuble, $params);
            }

            $result = [
                'logements' => [],
                'filters' => $logementService->extractFiltersValues($logements),
                'gestion' => (bool) $gestion,
            ];

            if ($pkImmeuble !== -1) {
                $result['immeuble'] = $this->normalize($client->getTableauBordImmeuble($pkImmeuble));
            } else {
                $result['board'] = $this->normalize($client->getMyTableauBordClient());
            }

            foreach ($logements as $logement) {
                $result['logements'][] = [
                    'infosLogement' => $this->normalize($logement),
                    'comptesAppareils' => $logementService->extractDeviceTypeCount($logement->ListeAppareils->appareil ?? []),
                ];
            }

            return $this->success($result);
        } catch (\Exception $e) {
            return $this->error('Erreur de filtrage des logements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List leaks for a logement
     */
    #[Route("/{pkLogement}/fuites", name: "list_leaks", methods: ["GET"])]
    public function listLeaks(int $pkLogement, Request $request, Fuite $fuiteService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;
            $pkAppareil = $request->query->get('appareil');

            if ($pkImmeuble) {
                $fuites = $client->getFuitesImmeuble($pkImmeuble, $pkLogement, $pkAppareil);
            } else {
                $fuites = [];
            }

            return $this->success([
                'logement' => $this->normalize($logement),
                'fuites' => $this->normalize($fuites),
                'filters' => $fuiteService->extractFiltersValues($fuites),
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des fuites: ' . $e->getMessage(), 500);
        }
    }

    /**
     * List dysfunctions for a logement
     */
    #[Route("/{pkLogement}/dysfonctionnements", name: "list_dysfunctions", methods: ["GET"])]
    public function listDysfunctions(int $pkLogement, Request $request, Dysfonctionnement $dysfonctionnementService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble, $pkLogement);
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
     * List anomalies for a logement
     */
    #[Route("/{pkLogement}/anomalies", name: "list_anomalies", methods: ["GET"])]
    public function listAnomalies(int $pkLogement, Request $request, Anomalie $anomalieService): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;
            $pkAppareil = $request->query->get('appareil');

            if ($pkImmeuble) {
                $anomalies = $client->getAnomaliesImmeuble($pkImmeuble, $pkLogement, $pkAppareil);
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
     * Export logements to Excel
     */
    #[Route("/immeuble/{pkImmeuble}/export", name: "export", methods: ["GET"])]
    public function export(int $pkImmeuble, Request $request, ExcelHelper $excelHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $types = [
                'EF' => 'EAU',
                'EC' => 'EAU',
                'Repart' => 'Repart',
                'CET' => 'CET',
            ];

            $params = new GetLogementsParams();
            $params->NBANOMALIES = true;
            $params->NBDEPANNAGES = true;
            $params->NBDYSFONCTIONNEMENTS = true;
            $params->NBFUITES = true;
            $params->NBCOMPTEURS = true;

            $logements = $client->getLogements($pkImmeuble, $params);
            $immeuble = $client->getTableauBordImmeuble($pkImmeuble)->Immeuble;

            $data = [];
            $data[] = [
                'ID Immeuble : ' . $immeuble->Numero,
                'Adresse Immeuble : ' . $immeuble->Adresse1,
                $immeuble->Cp,
                $immeuble->Ville,
            ];
            $data[] = [];

            $date = $this->findDate($logements, $client, $types);

            $headers = [
                'Réf. client',
                'Bât.',
                'Esc.',
                'Etage',
                'Logt',
                'Nom occupant',
                'Empl.',
                'Fluide',
                'N° de compteur',
            ];

            for ($i = 6; $i >= 1; $i--) {
                if ($date['R' . $i] != '01/01/0001') {
                    $headers[] = $date['R' . $i];
                }
            }

            $headers = array_merge($headers, ['Conso.', 'Alerte']);
            $data[] = $headers;

            foreach ($logements as $logement) {
                $appareils = $client->getInfosAppareilsType($logement->Logement->PkLogement, $types);

                foreach ($appareils as $appareil) {
                    $row = [
                        'Réf. client' => $logement->Occupant->Ref ?? null,
                        'Bât.' => $logement->Logement->NumBatiment ?? null,
                        'Esc.' => $logement->Logement->NumEscalier ?? null,
                        'Etage' => $logement->Logement->NumEtage ?? null,
                        'Logt' => $logement->Logement->NumOrdre ?? null,
                        'Nom occupant' => $logement->Occupant->Nom ?? null,
                        'Empl.' => $appareil->Appareil->Emplacement ?? null,
                        'Fluide' => $appareil->Appareil->Fluide ?? null,
                        'N° de compteur' => $appareil->Appareil->Numero ?? null,
                    ];

                    for ($i = 6; $i >= 1; $i--) {
                        if ($date['R' . $i] != '01/01/0001') {
                            if ($date['R' . $i] != null && isset($appareil->{'R' . $i})) {
                                $row[] = $appareil->{'R' . $i}->Index;
                            } else {
                                $row[] = null;
                            }
                        }
                    }

                    $row = array_merge($row, [
                        'Conso.' => $appareil->R1->Conso ?? null,
                        'Alerte' => trim(($appareil->NbFuites > 0 ? 'Fuite' : '') . ' ' . ($appareil->NbAnomalies > 0 ? 'Anomalie' : '')),
                    ]);

                    $data[] = $row;
                }
            }

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
            $response->headers->set('Content-Disposition', 'attachment; filename=export-logements.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des logements: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export anomalies to Excel
     */
    #[Route("/{pkLogement}/anomalies/export", name: "export_anomalies", methods: ["GET"])]
    public function exportAnomalies(int $pkLogement, Request $request, Anomalie $anomalieService, ExcelHelper $excelHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $anomalies = $client->getAnomaliesImmeuble($pkImmeuble, $pkLogement);
            } else {
                $anomalies = [];
            }

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
     */
    #[Route("/{pkLogement}/fuites/export", name: "export_leaks", methods: ["GET"])]
    public function exportLeaks(int $pkLogement, Request $request, Fuite $fuiteService, ExcelHelper $excelHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $fuites = $client->getFuitesImmeuble($pkImmeuble, $pkLogement);
            } else {
                $fuites = [];
            }

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
     */
    #[Route("/{pkLogement}/interventions/export", name: "export_interventions", methods: ["GET"])]
    public function exportInterventions(int $pkLogement, Request $request, Depannage $depannageService, ExcelHelper $excelHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $depannages = $client->getInterventionsImmeuble($pkImmeuble, $pkLogement);
            } else {
                $depannages = [];
            }

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
     */
    #[Route("/{pkLogement}/dysfonctionnements/export", name: "export_dysfunctions", methods: ["GET"])]
    public function exportDysfunctions(int $pkLogement, Request $request, Dysfonctionnement $dysfonctionnementService, ExcelHelper $excelHelper): Response|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $logement = $client->getTableauBordLogement($pkLogement);
            $pkImmeuble = $logement->Immeuble->PkImmeuble ?? null;

            if ($pkImmeuble) {
                $dysfonctionnements = $client->getDysfonctionnementsImmeuble($pkImmeuble, $pkLogement);
            } else {
                $dysfonctionnements = [];
            }

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
     * Download guide PDF
     */
    #[Route("/guide", name: "guide", methods: ["GET"])]
    public function guide(Request $request): Response|JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $filePath = __DIR__ . '/../../../public/GuideOccupant.pdf';
        if (!file_exists($filePath)) {
            return $this->notFound('Fichier de guide introuvable');
        }

        return new BinaryFileResponse($filePath, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename=GuideOccupant.pdf',
        ]);
    }

    /**
     * Create ticket from immeuble
     */
    #[Route("/immeuble/{pkImmeuble}/tickets", name: "create_ticket_immeuble", methods: ["POST"])]
    public function createTicketImmeuble(int $pkImmeuble, Request $request, LoggerInterface $logger): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        $formData = $request->request->get('intervention') ?? [];
        if (empty($formData['message']) || empty($formData['pkLogement']) || empty($formData['name'])) {
            return $this->error('Champs requis manquants: message, pkLogement, name', 400);
        }
echo '<pre>'; var_dump($formData); echo '<pre>'; die;
        try {
            $attachment = $request->files->get('intervention')['attachment'] ?? null;

            if (!empty($attachment)) {
                $originalName = $attachment->getClientOriginalName();
                $pathName = $attachment->getPathname();
                $img = file_get_contents($pathName);
                $imgBase64 = base64_encode($img);

                $logger->info('File Attachment: ' . print_r($attachment, true));

                $attachmentSend = [
                    'name' => $originalName,
                    'content' => $imgBase64,
                ];

                $nbTickets = $client->createTicketInterAttachment($formData, $attachmentSend);
            } else {
                $nbTickets = $client->createTicketInter($formData);
            }

            return $this->success([
                'nbTickets' => $nbTickets,
                'pkLogement' => $formData['pkLogement'],
            ], 'Demande d\'intervention envoyé');
        } catch (\Exception $e) {
            $logger->error('Erreur lors de la création du ticket: ' . $e->getMessage());
            return $this->error('Erreur lors de la création du ticket: ' . $e->getMessage(), 500);
        }
    }


    private function findDate($logements, $client, $types): array
    {
        $array = [
            'R1' => null,
            'R2' => null,
            'R3' => null,
            'R4' => null,
            'R5' => null,
            'R6' => null,
        ];

        foreach ($array as $Rx_key => $value) {
            foreach ($logements as $logement) {
                $appareils = $client->getInfosAppareilsType($logement->Logement->PkLogement, $types);
                if ($array[$Rx_key] == null) {
                    foreach ($appareils as $appareil) {
                        if ($array[$Rx_key] == null && isset($appareil->$Rx_key)) {
                            $array[$Rx_key] = date_format(date_create($appareil->$Rx_key->DateReleve), "d/m/Y");
                        }
                    }
                }
            }
        }

        return $array;
    }
}
