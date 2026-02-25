<?php

namespace App\Controller\Api;

use App\Service\ExcelHelper;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Api\ApiTicketingService;
use App\Service\Api\ApiSecurityService as SecurityService;
use Symfony\Component\Serializer\SerializerInterface;
use App\Service\Client;
use App\Service\FakeDataService;
/**
 * API Controller for Ticketing
 */
#[Route("/api/tickets", name: "api_ticket_")]
class TicketingApiController extends AbstractApiController
{
    private ApiTicketingService $apiTicketingService;

    public function __construct(Client $client, SerializerInterface $serializer, SecurityService $securityService, ?FakeDataService $fakeDataService = null, ApiTicketingService $apiTicketingService)
    {
        parent::__construct($client, $serializer, $securityService, $fakeDataService);
        $this->apiTicketingService = $apiTicketingService;
    }
    
    #[Route("", name: "list", methods: ["GET"])]
    public function ticketList(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $showAll = $request->query->get('showAll');
            $board = $client->getMyTableauBordClient();

            $this->validateToken($client);
            $boardOracle = $this->apiTicketingService->getMyTableauBordClient($client->getPkUser());

            // Check for demo/preview mode
            if (file_exists(__DIR__ . '/../../../demo.txt') || file_exists(__DIR__ . '/../../../preview.txt')) {
                $jsondemo = '{
                    "Erreur": "",
                    "Info": "",
                    "ListeTicketsInter": {
                        "ticketInter": [
                            {
                                "Nom": "M. Gethi",
                                "Email": "test@techem.com",
                                "TelFixe": "06.11.11.11.11",
                                "TicketDate": "2025-05-20T19:22:34",
                                "MotifLibre": "Pouvez-vous faire vérifier le compteur, nous avons un écart avec l\'index indiqué par l\'occupant ?",
                                "Statut": "Nouveau",
                                "ObjetRetour": "Pouvez-vous faire vérifier le compteur, nous avons un écart avec l\'index indiqué par l\'occupant ?",
                                "FkLogement": "1165420",
                                "RefLogement": "001095P0901",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "070038",
                                "FkImmeuble": "2108",
                                "Statut_Client": "",
                                "CaseNumber": "00105598",
                                "CaseId": "5003X00002CuohYQAR",
                                "LastUpdateDate": "2025-05-21T14:23:51"
                            },
                            {
                                "Nom": "Mme Uajiau",
                                "Email": "occupant2@techem.fr",
                                "TelFixe": "06.02.03.04.05",
                                "TicketDate": "2025-04-17T16:45:22",
                                "MotifLibre": "Bonjour, je vous remercie de fixer un rendez-vous au locataire afin d\'effectuer la pose d\'un compteur d\'eau. Cordialement",
                                "Statut": "En cours de traitement",
                                "ObjetRetour": "Pose d\'un nouveau compteur",
                                "FkLogement": "1165453",
                                "RefLogement": "001095H0040",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "070038",
                                "FkImmeuble": "2108",
                                "Statut_Client": "",
                                "CaseNumber": "00147278",
                                "CaseId": "5003X00002QC8hOQAT",
                                "LastUpdateDate": "2025-05-20T13:26:13"
                            },
                            {
                                "Nom": "M. Osuor",
                                "Email": "occupant@techem.fr",
                                "TelFixe": "0102030405",
                                "TicketDate": "2025-02-01T12:15:08",
                                "MotifLibre": "DEMANDE DE POSE D\'UN COMPTEUR D EAU FROIDE",
                                "Statut": "Clos - Demande traitée",
                                "ObjetRetour": "POSE DE COMPTEUR D EAU FROIDE",
                                "FkLogement": "1269966",
                                "RefLogement": "074238H0006",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "070038",
                                "FkImmeuble": "2108",
                                "Statut_Client": "",
                                "CaseNumber": "00203282",
                                "CaseId": "5003X00002hzdw2QAA",
                                "LastUpdateDate": "2025-03-22T10:41:27"
                            },
                            {
                                "Nom": "M. Demo",
                                "Email": "occupant@techem.fr",
                                "TelFixe": "0102030405",
                                "TicketDate": "2024-09-02T12:15:08",
                                "MotifLibre": "Demande de pose de Répartiteur",
                                "Statut": "Clos - Demande traitée",
                                "ObjetRetour": "Bonjour, Pouvez-vous poser les répartiteur dans ce logement ?",
                                "FkLogement": "1594353",
                                "RefLogement": "Log 18",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "064272",
                                "FkImmeuble": "340523",
                                "Statut_Client": "",
                                "CaseNumber": "00203282",
                                "CaseId": "5003X00002hzdw2QAA",
                                "LastUpdateDate": "2025-03-22T10:41:27"
                            }
                        ]
                    }
                }';
                $tickets_array = json_decode($jsondemo, true);
            } else {
                $tickets = $client->getTicketsIntersUser(null);
                $tickets_array = json_decode(json_encode($tickets), true);

                $ticketsOracle = $this->apiTicketingService->getTicketsIntersUser($client->getPkUser());
            }

            $tickets_list = [];
            if (isset($tickets_array['ListeTicketsInter']['ticketInter'])) {
                $tickets_list = $tickets_array['ListeTicketsInter']['ticketInter'];
            } elseif (isset($tickets_array['ListeTicketsInter'])) {
                // Handle case where ticketInter might be directly in ListeTicketsInter
                $ticketData = $tickets_array['ListeTicketsInter'];
                if (is_array($ticketData) && isset($ticketData[0])) {
                    $tickets_list = $ticketData;
                } else {
                    $tickets_list = [$ticketData];
                }
            }

            return $this->success([
                'board' => $this->normalize($board),
                'tickets' => $tickets_list,
                'count' => count($tickets_list),
                'showAll' => $showAll !== null,
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des billets: ' . $e->getMessage(), 500);
        }
    }


    #[Route("/menu", name: "menu", methods: ["GET"])]
    public function menuTicket(Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $isTicketInterEnabled = $client->getTicketsInterEnabled();
            $nbTicketsInterUser = $client->getNbTicketsInterUser();

            $isTicketInterEnabledOracle = $this->apiTicketingService->getTicketsInterEnabled($client->getPkUser());
            $nbTicketsInterUserOracle = $this->apiTicketingService->getNbTicketsInterUser($client->getPkUser());

            return $this->success([
                'isTicketInterEnabled' => $isTicketInterEnabled,
                'nbTicketsInterUser' => $nbTicketsInterUser,
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération du menu des billets: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Close a ticket
     */
    #[Route("/{caseId}/close", name: "close", methods: ["POST", "PUT"])]
    public function closeTicket(string $caseId, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $statut = 'Clos';
            $ticketResponse = $client->setTicketStatutClient($caseId, $statut);

            // Check if there's an error in the response
            if (is_object($ticketResponse) && isset($ticketResponse->Erreur) && !empty($ticketResponse->Erreur)) {
                return $this->error($ticketResponse->Erreur, 500);
            }

            return $this->success([], 'Ticket clôturé avec succès.', 200);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la fermeture du ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ticket attachment
     */
    #[Route("/{pkTicket}/attachment", name: "attachment", methods: ["GET"])]
    public function attachmentTicket(string $pkTicket, Request $request, LoggerInterface $logger): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $attachment = $client->getAttachmentTicketInter($pkTicket);

            $attachmentOracle = $this->apiTicketingService->getAttachmentTicketInter($client->getPkUser(), $pkTicket);

            if (!$attachment) {
                return $this->notFound('Pièce jointe introuvable');
            }

            $imageName = $attachment->Name ?? null;
            $imageContent = $attachment->content ?? null;

            $logger->info('Image name: ' . print_r($imageName, true));
            $logger->info('Image content length: ' . (is_string($imageContent) ? strlen($imageContent) : 'N/A'));

            return $this->success([
                'attachmentName' => $imageName,
                'attachmentContent' => $imageContent,
            ]);
        } catch (\Exception $e) {
            $logger->error('Erreur lors de la récupération de la pièce jointe: ' . $e->getMessage());
            return $this->error('Erreur lors de la récupération de la pièce jointe: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get ticket owner information for creating a ticket
     */
    #[Route("/create/{pkLogement}", name: "create_info", methods: ["GET"])]
    public function createTicketInfo(int $pkLogement, Request $request): JsonResponse
    {
        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            $ticketOwner = $client->getTicketInterInit($pkLogement);

            $ticketOwnerOracle = $this->apiTicketingService->getTicketOwnerInter($client->getPkUser(), $pkLogement);

            $dataForm = [
                'pkLogement' => (int) $pkLogement,
                'name' => $ticketOwner->Nom ?? null,
                'email' => $ticketOwner->Email ?? null,
                'phone' => $ticketOwner->TelFixe ?? null,
                'mobile' => $ticketOwner->TelMobile ?? null,
            ];

            return $this->success([
                'ticketOwner' => $this->normalize($ticketOwner),
                'formData' => $dataForm,
            ]);
        } catch (\Exception $e) {
            return $this->error('Erreur lors de la récupération des informations du propriétaire du billet: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export tickets to Excel
     * GET /api/tickets/download
     * Downloads the Excel file automatically
     */
    #[Route("/download", name: "download", methods: ["GET"])]
    public function download(Request $request, ExcelHelper $excelHelper): StreamedResponse|JsonResponse
    {
        ini_set('max_execution_time', 120);

        $client = $this->getAuthenticatedClientFromHeaders($request);
        if ($client instanceof JsonResponse) {
            return $client;
        }

        try {
            // Check for demo/preview mode
            if (file_exists(__DIR__ . '/../../../demo.txt') || file_exists(__DIR__ . '/../../../preview.txt')) {
                $jsondemo = '{
                    "Erreur": "",
                    "Info": "",
                    "ListeTicketsInter": {
                        "ticketInter": [
                            {
                                "Nom": "M. Gethi",
                                "Email": "test@techem.com",
                                "TelFixe": "06.11.11.11.11",
                                "TicketDate": "2025-05-20T19:22:34",
                                "MotifLibre": "Pouvez-vous faire vérifier le compteur, nous avons un écart avec l\'index indiqué par l\'occupant ?",
                                "Statut": "Nouveau",
                                "ObjetRetour": "Pouvez-vous faire vérifier le compteur, nous avons un écart avec l\'index indiqué par l\'occupant ?",
                                "FkLogement": "1165420",
                                "RefLogement": "001095P0901",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "070038",
                                "FkImmeuble": "2108",
                                "Statut_Client": "",
                                "CaseNumber": "00105598",
                                "CaseId": "5003X00002CuohYQAR",
                                "LastUpdateDate": "2025-05-21T14:23:51"
                            },
                            {
                                "Nom": "Mme Uajiau",
                                "Email": "occupant2@techem.fr",
                                "TelFixe": "06.02.03.04.05",
                                "TicketDate": "2025-04-17T16:45:22",
                                "MotifLibre": "Bonjour, je vous remercie de fixer un rendez-vous au locataire afin d\'effectuer la pose d\'un compteur d\'eau. Cordialement",
                                "Statut": "En cours de traitement",
                                "ObjetRetour": "Pose d\'un nouveau compteur",
                                "FkLogement": "1165453",
                                "RefLogement": "001095H0040",
                                "NumIntervention": "00142990",
                                "WebUser_Nom": "Demo",
                                "WebUser_Prenom": "Client",
                                "WebUser_Tel": "0102030405",
                                "WebUser_Email": "noreply@techem.fr",
                                "Imm_Id": "070038",
                                "FkImmeuble": "2108",
                                "Statut_Client": "",
                                "CaseNumber": "00147278",
                                "CaseId": "5003X00002QC8hOQAT",
                                "LastUpdateDate": "2025-05-20T13:26:13"
                            }
                        ]
                    }
                }';
                $tickets_array = json_decode($jsondemo, true);
            } else {
                // Get all tickets (showAll = null means all tickets)
                $tickets = $client->getTicketsIntersUser(null);
                $tickets_array = json_decode(json_encode($tickets), true);
            }

            // Extract tickets list
            $tickets_list = [];
            if (isset($tickets_array['ListeTicketsInter']['ticketInter'])) {
                $tickets_list = $tickets_array['ListeTicketsInter']['ticketInter'];
            } elseif (isset($tickets_array['ListeTicketsInter'])) {
                $ticketData = $tickets_array['ListeTicketsInter'];
                if (is_array($ticketData) && isset($ticketData[0])) {
                    $tickets_list = $ticketData;
                } else {
                    $tickets_list = [$ticketData];
                }
            }

            // Format data for Excel export
            $data = [];
            
            // Headers
            $headers = [
                'Numéro de ticket',
                'Date de demande',
                'Demandeur',
                'Objet',
                'Immeuble',
                'Nom occupant',
                'Réf. logement',
                'Statut',
                'Dernière modification',
                'Dépannage',
            ];
            $data[] = $headers;

            // Data rows
            foreach ($tickets_list as $ticket) {
                $ticketDate = isset($ticket['TicketDate']) && !empty($ticket['TicketDate'])
                    ? date('d/m/Y H:i', strtotime($ticket['TicketDate']))
                    : '';
                
                $lastUpdateDate = isset($ticket['LastUpdateDate']) && !empty($ticket['LastUpdateDate'])
                    ? date('d/m/Y H:i', strtotime($ticket['LastUpdateDate']))
                    : '';

                $demandeur = trim(($ticket['WebUser_Nom'] ?? '') . ' ' . ($ticket['WebUser_Prenom'] ?? ''));

                $row = [
                    $ticket['CaseNumber'] ?? '',
                    $ticketDate,
                    $demandeur,
                    $ticket['ObjetRetour'] ?? '',
                    $ticket['Imm_Id'] ?? '',
                    $ticket['Nom'] ?? '',
                    $ticket['RefLogement'] ?? '',
                    $ticket['Statut'] ?? '',
                    $lastUpdateDate,
                    $ticket['NumIntervention'] ?? '',
                ];
                $data[] = $row;
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
            $response->headers->set('Content-Disposition', 'attachment; filename=export-tickets.xlsx;');

            return $response;
        } catch (\Exception $e) {
            return $this->error('Erreur lors de l\'exportation des billets: ' . $e->getMessage(), 500);
        }
    }
}
