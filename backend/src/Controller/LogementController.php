<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use App\Service\ExcelHelper;
use DateTime;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\GetLogementsParams;
use App\Service\GetReportParams;
use App\Form\InterventionType;
use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\Fuite;
use App\Service\Logement;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Attribute\Route;


/**
 * Class LogementController
 * @package App\Controller
 */
class LogementController extends  AbstractTechemController
{

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */

     //#[Route('/immeuble/{pkImmeuble}/logements', name: 'TechemCoreBundle_Logement_index')]
     //#[Route('/gestionParc/{pkImmeuble}', name: 'TechemCoreBundle_GestionParc_logement', defaults:[ 'gestion' => true])]
    public function indexAction($pkImmeuble, $gestion = false)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
        $interventionForm = $this->createForm(
            InterventionType::class,
            null,
            [
                'action' => $this->generateUrl(
                    'TechemCoreBundle_Create_Ticket',
                    [
                        'pkImmeuble' => $pkImmeuble,
                    ]
                ),

            ]
        );
        $locals = [
            'immeuble'         => $client->getTableauBordImmeuble($pkImmeuble),
            'interventionForm' => $interventionForm->createView(),
            'gestion' => $gestion
        ];

        // dd($locals);
        return $this->render('Logement/index.html.twig', $locals);
    }

    //#[Route('/logement/{pkLogement}/createticket', name: 'TechemCoreBundle_Create_Ticket_Show')]
    public function createTicketAction(Request $request, LoggerInterface $logger)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(['message' => 'wrong request'], 400);
        }

        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $interventionForm = $this->createForm(InterventionType::class);
        $interventionForm->handleRequest($request);

        $formData = $request->request->all()['intervention'] ?? [];

        $logger->info('Form data received: ' . print_r($formData, true));

        if (!empty($formData['message']) && !empty($formData['pkLogement']) && !empty($formData['name'])) {

            $attachment = $request->files->get('intervention')['attachment'] ?? null;

            if (!empty($attachment)) {
                $originalName = $attachment->getClientOriginalName();
                $pathName = $attachment->getPathname();
                $tempName = $attachment->getFilename();

                $logger->info('File Attachment: ' . print_r($attachment, true));
                $logger->info('Attachment Name: ' . print_r($originalName, true));
                $logger->info('Path Name: ' . print_r($pathName, true));
                $logger->info('Temp Name: ' . print_r($tempName, true));

                $img = file_get_contents($pathName);

                $imgBase64 = base64_encode($img);

                $logger->info('Image base64: ' . $imgBase64);

                $attachmentSend = [
                    'name' => $originalName,
                    'content' => $imgBase64,
                ];

                $nbTickets = $client->createTicketInterAttachment($formData, $attachmentSend);
            } else {
                $nbTickets = $client->createTicketInter($formData);
            }

            return new JsonResponse([
                'message' => 'Demande d\'intervention envoyée',
                'nbTickets' => $nbTickets,
                'pkLogement' => $formData['pkLogement'],
            ], 200);
        } else {
            $formErrors = [];
            foreach ($interventionForm->getErrors(true) as $error) {
                $formErrors[] = $error->getMessage();
            }
            $logger->error('Form validation failed: ' . print_r($formErrors, true));

            return new JsonResponse([
                'message' => 'Le formulaire n\'est pas valide',
                'error' => $formErrors,
            ], 400);
        }
    }

    //#[Route('/immeuble/{pkImmeuble}/logements/ticketowner', name: 'TechemCoreBundle_Ticket_Owner')]
    public function getTicketOnwerAction(Request $request)
    {
        if (!$request->isXmlHttpRequest()) {
            return new JsonResponse(['message' => 'wrong request'], 400);
        }
        $client = $this->getClient();

        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $pkLogement  = $request->request->get('pkLogement');
        $ticketOwner = $client->getTicketInterInit($pkLogement);

        return new JsonResponse($ticketOwner, 200);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logements/recherche', name: 'TechemCoreBundle_Logement_search')]
    public function searchAction()
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $locals = [
            'board' => $client->getMyTableauBordClient(),
        ];

        return $this->render('Logement/search.html.twig', $locals);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    //#[Route('/infos-appareils', name: 'TechemCoreBundle_Logement_infos_appareils')]
    public function getInfosAppareilAction(Request $request)
    {
        $types = [
            'eau'       => [
                'EF' => 'EAU',
                'EC' => 'EAU',
            ],
            'chauffage' => [
                'Repart' => 'Repart',
                'CET'    => 'CET',
            ],
        ];

        $pkLogement = $request->get('pklogement', null);
        $type       = $request->get('type', '');

        if (is_null($pkLogement)) {
            throw new NotFoundHttpException();
        }

        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $appareils = $client->getInfosAppareilsType($pkLogement, $types[$type]);

        $locals = [
            'pkLogement' => $pkLogement,
            'appareils'  => $appareils,
        ];
// dd($locals);
        return $this->render('Logement/_infos_appareils_' . strtolower($type) . '.html.twig', $locals);
    }

    //#[Route('/gestionParc/{pkLogement}/edit', name: 'TechemCoreBundle_Logement_edit')]
    public function editAction($pkLogement, Request $request, Logement $logementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement         = $client->getTableauBordLogement($pkLogement);
        $ticketOwner      = $client->getTicketInterInit($pkLogement);

        $data = json_decode($request->getContent(), true);
		
		$isnew = False;
        
		$dataOccupant  = $client->getOccupants($logement->Immeuble->PkImmeuble, $logement->Occupant->PkOccupant, $isnew);

		if(isset($dataOccupant['newEmail']) or isset($dataOccupant['newTelmobile'])){
			$changeinprogress=True;
		}else{
			$changeinprogress=False;
		}


        if ($data) {
            $occu = $client->setOccupants4Chgt($logement->Occupant->PkOccupant, $data, $isnew);
            return new JsonResponse($occu);
        }

        $dataForm = [
            'pkLogement' => (int) $pkLogement,
            'name'       => $ticketOwner->Nom,
            'email'      => $ticketOwner->Email,
            'phone'      => $ticketOwner->TelFixe,
            'mobile'     => $ticketOwner->TelMobile,
        ];

        $interventionForm = $this->createForm(
            InterventionType::class,
            $dataForm,
            [
                'action' => $this->generateUrl(
                    'TechemCoreBundle_Create_Ticket_Show',
                    [
                        'pkLogement' => $pkLogement,
                    ]
                ),

            ]
        );

        $nbTickets = $client->getNbTicketsInterByLogement($pkLogement);

        $locals = [
            'logement'         => $logement,
            'consoTabs'        => $logementService->generateTabConsos($logement),
            'interventionForm' => $interventionForm->createView(),
            'nbTickets' => $nbTickets,
            'gestion' => true,
			'changeinprogress'=>$changeinprogress,
            'occupant' => $dataOccupant,
            'pkLogement' => $pkLogement
        ];

        $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart;
        if (count($repartAppareils) > 1) {
            $allAppareils = new \stdClass();
            $allAppareils->Appareil = new \stdClass();
            $allAppareils->Appareil->PkAppareil = "0000000";
            $allAppareils->Appareil->Numero = "0000000";
            $allAppareils->Appareil->Emplacement = "Tous les appareils";
            $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU;
            array_unshift($repartAppareils, $allAppareils);
            $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
        }

        return $this->render('Logement/edit.html.twig', $locals);
    }

    //#[Route('/gestionParc/{pkLogement}/show', name: 'TechemCoreBundle_GestionParc_show',defaults: ['gestion' => true])]
    //#[Route('/gestionParc/{pkLogement}/declareOccupant', name: 'TechemCoreBundle_GestionParc_declareOccupant',defaults: ['declareOccupant' => true])]
    //#[Route('/logement/{pkLogement}', name: 'TechemCoreBundle_Logement_show', defaults: ['gestion' => false])]
    public function showAction($pkLogement, Request $request, Logement $logementService, LoggerInterface $logger , $gestion = false, $declareOccupant = false)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement         = $client->getTableauBordLogement($pkLogement);
        $ticketOwner      = $client->getTicketInterInit($pkLogement);

        $data = json_decode($request->getContent(), true);

		$isnew = True;
        $dataOccupant  = $client->getOccupants($logement->Immeuble->PkImmeuble, $logement->Occupant->PkOccupant, $isnew);
		
		if(isset($dataOccupant['newNom'])){
			$changeinprogress=True;
		}else{
			$changeinprogress=False;
		}
		
		
		
		
        if ($data) {
            $occu = $client->setOccupants4Chgt($logement->Occupant->PkOccupant, $data, $isnew);
            return new JsonResponse($occu);
        }
			
			

        $dataForm = [
            'pkLogement' => (int) $pkLogement,
            'name'       => $ticketOwner->Nom,
            'email'      => $ticketOwner->Email,
            'phone'      => $ticketOwner->TelFixe,
            'mobile'     => $ticketOwner->TelMobile,
        ];

        $interventionForm = $this->createForm(
            InterventionType::class,
            $dataForm,
            [
                'action' => $this->generateUrl(
                    'TechemCoreBundle_Create_Ticket_Show',
                    [
                        'pkLogement' => $pkLogement,
                    ]
                ),

            ]
        );

        $nbTickets = $client->getNbTicketsInterByLogement($pkLogement);

        $locals = [
            'logement'         => $logement,
            'consoTabs'        => $logementService->generateTabConsos($logement),
            'interventionForm' => $interventionForm->createView(),
            'nbTickets' => $nbTickets,
            'gestion' => $gestion,
            'pkLogement' => $pkLogement,
			'changeinprogress'=>$changeinprogress,
        ];

        $repartAppareils = $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart;
        if (count($repartAppareils) > 1) {
            $allAppareils = new \stdClass();
            $allAppareils->Appareil = new \stdClass();
            $allAppareils->Appareil->PkAppareil = "0000000";
            $allAppareils->Appareil->Numero = "0000000";
            $allAppareils->Appareil->Emplacement = "Tous les appareils";
            $allAppareils->SerieConsos = $logement->LogementRepart->SerieConsosDJU;
            array_unshift($repartAppareils, $allAppareils);
            $logement->LogementRepart->ListeInfosAppareils->infosAppareilRepart = $repartAppareils;
        }
        if($declareOccupant) {
			$locals['occupant'] = $dataOccupant;
            return $this->render('Logement/newOccupant.html.twig', $locals);
        }

        return $this->render('Logement/show.html.twig', $locals);
    }

    //#[Route('/logements/{pkImmeuble}/logement/{pkLogement}/releve_repart', name: 'TechemCoreBundle_Logement_repart_releve')]
    public function showRepartReleveAction(Request $request, $pkImmeuble, $pkLogement)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params             = new GetReportParams();
        $params->PKIMMEUBLE = $pkImmeuble;
        $params->PKLOGEMENT = $pkLogement;

        $report = $client->getReport('REPART_LOGEMENT', $params);
        if (empty($report)) {
            throw new NotFoundHttpException();
        }

        $response = new Response($report);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Disposition', 'inline; filename=relevé-' . date('d-m-Y'));
        $response->headers->set('Content-Transfer-Encoding', 'binary');
        $response->headers->set('Expires', 0);
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Content-Length', strlen($report));

        return $response;
    }


    /**
     * @param $pkLogement
     * @param $pkIntervention
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/interventions/{pkIntervention}', name: 'TechemCoreBundle_Logement_showintervention')]
    public function showInterventionAction($pkLogement, $pkIntervention)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement  = $client->getTableauBordLogement($pkLogement);
        $depannage = $client->getDetailDepannage($pkIntervention);

        $locals = [
            'logement'  => $logement,
            'depannage' => $depannage,
        ];

        return $this->render('Logement/showIntervention.html.twig', $locals);
    }

    /**
     * @param $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/interventions', name: 'TechemCoreBundle_Logement_listinterventions')]
    public function listInterventionsAction($pkLogement, Depannage $depannageService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $depannages = $client->getInterventionsImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $depannages = [];
        }

        $locals = [
            'logement'   => $logement,
            'depannages' => $depannages,
            'filters'    => $depannageService->extractFiltersValues($depannages),
        ];

        return $this->render('Logement/listInterventions.html.twig', $locals);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */

    public function filterResultAction(Request $request, Logement $logementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params                       = new GetLogementsParams();
        $params->NBANOMALIES          = true;
        $params->NBDEPANNAGES         = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES             = true;
        $params->NBCOMPTEURS          = true;

        $ref        = $request->get('ref', null);
        $ref_numero = $request->get('ref_numero', null);
        $nom        = $request->get('nom', null);
        $tout       = $request->get('tout', null);
        $adresse    = $request->get('adresse', null);
        $pkImmeuble = $request->get('pkImmeuble', -1);
        $search     = $request->get('search', false);

        if ($search !== false) {
            if (!is_null($ref) || !is_null($ref_numero) || !is_null($nom) || !is_null($tout) || !is_null($adresse)) {
                if (!is_null($ref)) {
                    $params->FIELD_REFOCCUPANT = $ref;
                } elseif (!is_null($ref_numero)) {
                    $params->FIELD_REFOCCUPANT = $ref_numero;
                }

                $params->FIELD_NOM              = $nom;
                $params->FIELD_ALLFIELDS        = $tout;
                $params->FIELD_ADRESSE_CP_VILLE = $adresse;

                $logements = $client->getLogements($pkImmeuble, $params);
            } else {
                $logements = [];
            }
        } else {
            $logements = $client->getLogements($pkImmeuble, $params);
        }

        $gestion = false;

        if ($request->get('gestion')) {
            $gestion = true;
        }
        $locals = [
            'logements' => [],
            'filters'   => $logementService->extractFiltersValues($logements),
            'gestion' => $gestion
        ];

        if ($pkImmeuble !== -1) {
            $locals['immeuble'] = $client->getTableauBordImmeuble($pkImmeuble);
        } else {
            $locals['board'] = $client->getMyTableauBordClient();
        }

        foreach ($logements as $logement) {

            $locals['logements'][] = [
                'infosLogement'    => $logement,
                'comptesAppareils' => $logementService->extractDeviceTypeCount($logement->ListeAppareils->appareil),
            ];
        }

        return $this->render('Logement/_list_logements.html.twig', $locals);
    }

    /**
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/fuites', name: 'TechemCoreBundle_Logement_listleaks')]
    public function listLeaksAction(Request $request, $pkLogement, Fuite $fuiteService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $pkAppareil = $request->get('appareil', null);
            $fuites     = $client->getFuitesImmeuble($logement->Immeuble->PkImmeuble, $pkLogement, $pkAppareil);
        } else {
            $fuites = [];
        }

        $locals = [
            'logement' => $logement,
            'fuites'   => $fuites,
            'filters'  => $fuiteService->extractFiltersValues($fuites),
        ];

        return $this->render('Logement/listLeaks.html.twig', $locals);
    }

    //#[Route('/logement/{pkLogement}/dysfonctionnements', name: 'TechemCoreBundle_Logement_listdysfunctions')]
    public function listDysfunctionsAction($pkLogement, Dysfonctionnement $dysfonctionnementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);

        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $dysfonctionnements = [];
        }


        $locals = [
            'logement'           => $logement,
            'dysfonctionnements' => $dysfonctionnements,
            'filters'            => $dysfonctionnementService->extractFiltersValues($dysfonctionnements),
        ];

        return $this->render('Logement/listDysfunctions.html.twig', $locals);
    }

    //#[Route('/logement/{pkLogement}/anomalies', name: 'TechemCoreBundle_Logement_listanomalies')]
    public function listAnomaliesAction(Request $request, $pkLogement, Anomalie $anomalieService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $pkAppareil = $request->get('appareil', null);
            $anomalies  = $client->getAnomaliesImmeuble($logement->Immeuble->PkImmeuble, $pkLogement, $pkAppareil);
        } else {
            $anomalies = [];
        }

        $locals = [
            'logement'  => $logement,
            'anomalies' => $anomalies,
            'filters'   => $anomalieService->extractFiltersValues($anomalies),
        ];

        return $this->render('Logement/listAnomalies.html.twig', $locals);
    }

    /**
     * @param $logements
     * @param $client
     * @param $types
     *
     * @return array
     */
    public function findDate($logements, $client, $types)
    {
        /**
         * Default data for the header
         * @var array $array
         */
        $array = [
            'R1' => null,
            'R2' => null,
            'R3' => null,
            'R4' => null,
            'R5' => null,
            'R6' => null,
        ];

        /**
         * set DateTime on string
         * @var  $Rx_key
         * @var  $value
         */
        foreach ($array as $Rx_key => $value) {
            foreach ($logements as $logement) {
                $appareils = $client->getInfosAppareilsType($logement->Logement->PkLogement, $types);
                if ($array[$Rx_key] == null) {
                    foreach ($appareils as $appareil) {
                        if ($array[$Rx_key] == null && $appareil->$Rx_key) {
                            $array[$Rx_key] = date_format(date_create($appareil->$Rx_key->DateReleve), "d/m/Y");
                        }
                    }
                }
            }
        }
        return $array;
    }

    /**
     * Export logements
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/immeuble/{pkImmeuble}/logements/export', name: 'TechemCoreBundle_Logement_export')]
    public function exportAction(Request $request, $pkImmeuble, ExcelHelper $excelHelper)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $types = [
            'EF'     => 'EAU',
            'EC'     => 'EAU',
            'Repart' => 'Repart',
            'CET'    => 'CET',
        ];

        $params                       = new GetLogementsParams();
        $params->NBANOMALIES          = true;
        $params->NBDEPANNAGES         = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES             = true;
        $params->NBCOMPTEURS          = true;

        $logements = $client->getLogements($pkImmeuble, $params);


        $data = [];

        $immeuble = $client->getTableauBordImmeuble($pkImmeuble)->Immeuble;

        $headerImmeuble = [
            'ID Immeuble : ' . $immeuble->Numero,
            'Adresse Immeuble : ' . $immeuble->Adresse1,
            $immeuble->Cp,
            $immeuble->Ville,
        ];

        $data[] = $headerImmeuble;
        $data[] = [];

        /**
         * array with key "Rx" and value "date"
         * @var array $date
         */
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

        $headers = array_merge(
            $headers,
            [
                'Conso.',
                'Alerte',
            ]
        );

        $data[] = $headers;

        foreach ($logements as $logement) {
            $appareils = $client->getInfosAppareilsType($logement->Logement->PkLogement, $types);


            foreach ($appareils as $appareil) {
                $row = [
                    'Réf. client'    => (isset($logement->Occupant) && isset($logement->Occupant->Ref)) ? $logement->Occupant->Ref : null,
                    'Bât.'           => (isset($logement->Logement) && isset($logement->Logement->NumBatiment)) ? $logement->Logement->NumBatiment : null,
                    'Esc.'           => (isset($logement->Logement) && isset($logement->Logement->NumEscalier)) ? $logement->Logement->NumEscalier : null,
                    'Etage'          => (isset($logement->Logement) && isset($logement->Logement->NumEtage)) ? $logement->Logement->NumEtage : null,
                    'Logt'           => (isset($logement->Logement) && isset($logement->Logement->NumOrdre)) ? $logement->Logement->NumOrdre : null,
                    'Nom occupant'   => (isset($logement->Occupant) && isset($logement->Occupant->Nom)) ? $logement->Occupant->Nom : null,
                    'Empl.'          => (isset($appareil->Appareil) && isset($appareil->Appareil->Emplacement)) ? $appareil->Appareil->Emplacement : null,
                    'Fluide'         => (isset($appareil->Appareil) && isset($appareil->Appareil->Fluide)) ? $appareil->Appareil->Fluide : null,
                    'N° de compteur' => (isset($appareil->Appareil) && isset($appareil->Appareil->Numero)) ? $appareil->Appareil->Numero : null,
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

                $row = array_merge(
                    $row,
                    [
                        'Conso.' => (isset($appareil->R1)) ? $appareil->R1->Conso : null,
                        'Alerte' => trim((isset($appareil->NbFuites) && $appareil->NbFuites > 0 ? 'Fuite' : '') . ' ' . (isset($appareil->NbAnomalies) && $appareil->NbAnomalies > 0 ? 'Anomalie' : '')),
                    ]
                );

                $data[] = $row;
            }
        }


        if (ob_get_contents()) {
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
    }

    /**
     * Export anomalies
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/anomalies/export', name: 'TechemCoreBundle_Logement_export_anomalies')]
    public function exportAnomaliesAction($pkLogement, Anomalie $anomalieService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $anomalies = $client->getAnomaliesImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $anomalies = [];
        }
        $data             = $anomalieService->export($anomalies);


        $helper = $this->container->get('excel.helper');
        ob_end_clean();
        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $path = 'php://output';
                $helper->write($path, $data);
            }
        );
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename=export-anomalies.xlsx;');

        return $response;
    }

    /**
     * Export fuites
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/fuites/export', name: 'TechemCoreBundle_Logement_export_leaks')]
    public function exportLeaksAction($pkLogement, Fuite $fuiteService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $fuites = $client->getFuitesImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $fuites = [];
        }
        $data          = $fuiteService->export($fuites);

        $helper = $this->container->get('excel.helper');
        ob_end_clean();
        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $path = 'php://output';
                $helper->write($path, $data);
            }
        );
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename=export-fuites.xlsx;');

        return $response;
    }

    /**
     * Export dépannages
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/interventions/export', name: 'TechemCoreBundle_Logement_export_interventions')]
    public function exportInterventionsAction($pkLogement, Depannage $depannageService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $depannages = $client->getInterventionsImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $depannages = [];
        }
        $data              = $depannageService->export($depannages);
        $helper            = $this->container->get('excel.helper');
        ob_end_clean();
        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $path = 'php://output';
                $helper->write($path, $data);
            }
        );
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename=export-interventions.xlsx;');

        return $response;
    }

    /**
     * Export fuites
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkLogement
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/logement/{pkLogement}/dysfonctionnements/export', name: 'TechemCoreBundle_Logement_export_dysfunctions')]
    public function exportDysfunctionsAction(Dysfonctionnement $dysfonctionnementService, $pkLogement)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $logement = $client->getTableauBordLogement($pkLogement);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($logement->Immeuble->PkImmeuble, $pkLogement);
        } else {
            $dysfonctionnements = [];
        }
        $data                      = $dysfonctionnementService->export($dysfonctionnements);
        $helper                    = $this->container->get('excel.helper');
        ob_end_clean();
        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $path = 'php://output';
                $helper->write($path, $data);
            }
        );
        $response->headers->set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $response->headers->set('Content-Disposition', 'attachment; filename=export-alarmestechniques.xlsx;');

        return $response;
    }

    /**
     * Guide logement
     *
     * @param $file
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/guide/{file}', name: 'TechemCoreBundle_Logement_guide')]
    public function guideAction($file )
    {
		$file = 'GuideOccupant.pdf';
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        // $report = $client->getFile($file);
        // if (empty($report)) {
            // throw new NotFoundHttpException();
        // }

        // $response = new Response($report);
        // $response->headers->set('Content-Type', 'application/pdf');
        // $response->headers->set('Content-Disposition', 'inline; filename=' . $file);
        // $response->headers->set('Content-Transfer-Encoding', 'binary');
        // $response->headers->set('Expires', 0);
        // $response->headers->set('Cache-Control', 'no-cache');
        // $response->headers->set('Pragma', 'no-cache');
        // $response->headers->set('Content-Length', strlen($report));

        // return $response;
		
		return $this->file(file:'../public/guideoccupant.pdf');
    }

    //#[Route('/logement/{pkImmeuble}/createticket', name: 'TechemCoreBundle_Create_Ticket')]
    public function createTicketImmeubleAction(Request $request, $pkImmeuble)
    {
        if (!$request->isXmlHttpRequest()) {

            return new JsonResponse(['message' => 'wrong request'], 400);
        }

        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $interventionForm = $this->createForm(InterventionType::class);
        $interventionForm->handleRequest($request);
        $formData = $request->request->get('intervention');
        if (!empty($formData['message']) && $formData['pkLogement'] && $formData['name']) {
            $logger = $this->container->get('logger');
            $logger->info('Files All: ' . print_r($request->files->all(), true));

            $attachment = $request->files->get('intervention')['attachment'];

            if (!empty($attachment)) {

                $originalName = $attachment->getClientOriginalName();

                $pathName = $attachment->getPathname();

                $tempName = $attachment->getFilename();

                $logger->info('File Attachement: ' . print_r($request->files->get('intervention')['attachment'], true));

                $logger->info('Attachement Name: ' . print_r($originalName, true));

                $logger->info('Path Name: ' . print_r($pathName, true));

                $logger->info('Temp Name: ' . print_r($tempName, true));


                $logger->info('request headers : ' . print_r($request->headers->all(), true));

                $logger->info('Form data : ' . print_r($formData, true));

                $img = file_get_contents($pathName);

                //          Encodage d'image
                $imgBase64 = base64_encode($img);

                $logger->info('Image base 64 : ' . print_r($imgBase64, true));

                $attachmentSend = [
                    'name' => $originalName,
                    'content' => $imgBase64,
                ];

                $nbTickets = $client->createTicketInterAttachment($formData, $attachmentSend);
            } else {

                $nbTickets = $client->createTicketInter($formData);
            }


            return new JsonResponse(
                [
                    'message'    => 'Demande d\'intervention envoyé',
                    'nbTickets'  => $nbTickets,
                    'pkLogement' => $formData['pkLogement'],
                ],
                200
            );
        } else {
            return new JsonResponse(
                [
                    'message' => 'le formulaire n\'est pas valide',
                    'error'   => $interventionForm->getErrors(),
                ],
                400
            );
        }
    }

    public function dd($var)
    {
        echo '<pre style="background-color: #2B333F; color: #fff8f8;padding: 15px;" >';
        var_dump($var);
        echo '</pre>';
        die;
    }
}
