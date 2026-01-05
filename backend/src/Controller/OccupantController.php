<?php

namespace App\Controller;

use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\Fuite;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\GetReportParams;
use App\Service\Logement;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Class OccupantController
 * @package App\Controller
 */
class OccupantController extends  AbstractTechemController
{

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route("/occupant", name: "TechemCoreBundle_Occupant_show")]
    public function showAction(Logement $logementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user             = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');

        $logement         = $client->getTableauBordOccupant($user->FK);


        $locals = [
            'logement'  => $logement,
            'consoTabs' => $logementService->generateTabConsos($logement),
            'modeoccupant'       => true,
        ];
		$soustraitants = $client->getSousTraitants();


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

        return $this->render('Occupant/show.html.twig', $locals);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route("/occupant/simulateur", name: "TechemCoreBundle_Occupant_Simulateur")]
    public function SimulateurAction(Logement $logementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user             = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');

        $logement         = $client->getTableauBordOccupant($user->FK);


        $locals = [
            'logement'  => $logement,
            'consoTabs' => $logementService->generateTabConsos($logement),
            'modeoccupant'       => true,
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
        return $this->render('Occupant/simulateur.html.twig',$locals);
    }

    //#[Route("/occupant/interventions/{pkIntervention}", name: "TechemCoreBundle_Occupant_showintervention")]
    public function showInterventionAction($pkIntervention)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user      = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement  = $client->getTableauBordOccupant($user->FK);
        $depannage = $client->getDetailDepannage($pkIntervention);

        $locals = [
            'logement'  => $logement,
            'depannage' => $depannage,
			'modeoccupant'       => true,

        ];

        return $this->render('Occupant/showIntervention.html.twig', $locals);
    }

    //#[Route("/occupant/interventions", name: "TechemCoreBundle_Occupant_listinterventions")]
    public function listInterventionsAction(Depannage $depannageService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $depannages = $client->getInterventionsImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $user->FK);
        } else {
            $depannages = [];
        }

        $locals = [
            'logement'   => $logement,
            'depannages' => $depannages,
            'filters'    => $depannageService->extractFiltersValues($depannages),
            'modeoccupant'       => true,
        ];

        return $this->render('Occupant/listInterventions.html.twig', $locals);
    }

    //#[Route("/occupant/fuites", name: "TechemCoreBundle_Occupant_listleaks")]
    public function listLeaksAction(Request $request, Fuite $fuiteService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $pkAppareil = $request->get('appareil', null);
            $fuites     = $client->getFuitesImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $pkAppareil, $user->FK);
        } else {
            $fuites = [];
        }

        $locals = [
            'logement' => $logement,
            'fuites'   => $fuites,
            'filters'  => $fuiteService->extractFiltersValues($fuites),
            'modeoccupant'       => true,
        ];

        return $this->render('Occupant/listLeaks.html.twig', $locals);
    }

    //#[Route("/occupant/dysfonctionnements", name: "TechemCoreBundle_Occupant_listdysfunctions")]
    public function listDysfunctionsAction(Dysfonctionnement $dysfonctionnementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $user->FK);
        } else {
            $dysfonctionnements = [];
        }

        $locals = [
            'logement'           => $logement,
            'dysfonctionnements' => $dysfonctionnements,
            'filters'            => $dysfonctionnementService->extractFiltersValues($dysfonctionnements),
            'modeoccupant'       => true,
        ];

        return $this->render('Occupant/listDysfunctions.html.twig', $locals);
    }

    //#[Route("/occupant/anomalies", name: "TechemCoreBundle_Occupant_listanomalies")]
    public function listAnomaliesAction(Request $request, Anomalie $anomalieService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $pkAppareil = $request->get('appareil', null);
            $anomalies  = $client->getAnomaliesImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $pkAppareil, $user->FK);
        } else {
            $anomalies = [];
        }

        $locals = [
            'logement'  => $logement,
            'anomalies' => $anomalies,
            'filters'   => $anomalieService->extractFiltersValues($anomalies),
            'modeoccupant'       => true,
        ];

        return $this->render('Occupant/listAnomalies.html.twig', $locals);
    }

    //#[Route("/occupant/anomalies/export", name: "TechemCoreBundle_Occupant_export_anomalies")]
    public function exportAnomaliesAction(Anomalie $anomalieService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $anomalies = $client->getAnomaliesImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, null, $user->FK);
        } else {
            $anomalies = [];
        }
        $data             = $anomalieService->export($anomalies);
        $helper           = $this->container->get('csv.helper');

        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $handle = fopen('php://output', 'r+');
                $helper->write($handle, $data);
                fclose($handle);
            }
        );
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export-anomalies.csv";');

        return $response;
    }

    //#[Route("/occupant/fuites/export", name: "TechemCoreBundle_Occupant_export_leaks")]
    public function exportLeaksAction(Fuite $fuiteService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $fuites = $client->getFuitesImmeuble(
                $logement->Immeuble->PkImmeuble,
                $logement->Logement->PkLogement,
                null,
                $user->FK
            );
        } else {
            $fuites = [];
        }
        $data          = $fuiteService->export($fuites);
        $helper        = $this->container->get('csv.helper');

        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $handle = fopen('php://output', 'r+');
                $helper->write($handle, $data);
                fclose($handle);
            }
        );
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export-fuites.csv";');

        return $response;
    }

    //#[Route("/occupant/interventions/export", name: "TechemCoreBundle_Occupant_export_interventions")]
    public function exportInterventionsAction(Depannage $depannageService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $depannages = $client->getInterventionsImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $user->FK);
        } else {
            $depannages = [];
        }
        $data              = $depannageService->export($depannages);
        $helper            = $this->container->get('csv.helper');

        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $handle = fopen('php://output', 'r+');
                $helper->write($handle, $data);
                fclose($handle);
            }
        );
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export-depannages.csv";');

        return $response;
    }

    //#[Route("/occupant/dysfonctionnements/export", name: "TechemCoreBundle_Occupant_export_dysfunctions")]
    public function exportDysfunctionsAction(Dysfonctionnement $dysfonctionnementService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $user     = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement = $client->getTableauBordOccupant($user->FK);
        if (isset($logement->Immeuble) && isset($logement->Immeuble->PkImmeuble)) {
            $dysfonctionnements = $client->getDysfonctionnementsImmeuble($logement->Immeuble->PkImmeuble, $logement->Logement->PkLogement, $user->FK);
        } else {
            $dysfonctionnements = [];
        }
        $data                      = $dysfonctionnementService->export($dysfonctionnements);
        $helper                    = $this->container->get('csv.helper');

        $response = new StreamedResponse(
            function () use ($data, $helper) {
                $handle = fopen('php://output', 'r+');
                $helper->write($handle, $data);
                fclose($handle);
            }
        );
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="export-autres-dysfonctionnemnts.csv";');

        return $response;
    }

    //#[Route("/occupant/{pkOccupant}/releve_eau", name: "TechemCoreBundle_Occupant_eau_releve")]
    
	public function showEauReleveAction(Request $request, $pkOccupant)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params             = new GetReportParams();
        $params->PKOCCUPANT = $pkOccupant;

        $report = $client->getReport('RELEVE_EAU_OCCUPANT', $params);
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

    //#[Route("/occupant/{pkOccupant}/releve_repart/{pkImmeuble}", name: "TechemCoreBundle_Occupant_repart_releve")]
    public function showRepartReleveAction(Request $request, $pkImmeuble, $pkOccupant, $energie = false)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params             = new GetReportParams();
        $params->PKIMMEUBLE = $pkImmeuble;
        $params->PKOCCUPANT = $pkOccupant;

        $report = $client->getReport('REPART_OCCUPANT', $params);
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

    //#[Route("/occupant/{pkOccupant}/releve_note/{pkImmeuble}/{energie}", name: "TechemCoreBundle_Occupant_note_releve")]
    public function showNoteReleveAction(Request $request, $pkImmeuble, $pkOccupant, $energie)
    {

        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $params = new GetReportParams();
        if ($energie == 'CHAUFFAGE') {
            $params->PKOCCUPANT = $pkOccupant . '|TYPEERC=CHAUFFAGE';
			$params->PKIMMEUBLE = $pkImmeuble;

        } else {
            $params->PKOCCUPANT = $pkOccupant .'|TYPEERC=EAU';
			$params->PKIMMEUBLE = $pkImmeuble;
        }

        $report = $client->getReport('NOTE_INFO_MENSUELLE', $params);
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
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route("/occupant/myAccount", name: "TechemCoreBundle_Occupant_myAccount")]
    public function myAccountAction(Logement $logementService, Request $request, LoggerInterface $logger )
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

		$data = $request->getContent();

		$rgpdcheckboxvalue = 'false';
		if ($data){
			$rgpdcheckboxvalue = 'true';
		}
		
        $user             = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement         = $client->getTableauBordOccupant($user->FK);


        $locals = [
            'logement'  		=> $logement,
            'consoTabs' 		=> $logementService->generateTabConsos($logement),
			'modeoccupant'  	=> true,
            'compte' 			=> true,
			'rgpdcheckboxvalue'	=> $rgpdcheckboxvalue,
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

        return $this->render('Occupant/myAccount.html.twig', $locals);
    }


    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route("/occupant/alertes", name: "TechemCoreBundle_Occupant_alertes")]
    public function alertesAction(Request $request, Logement $logementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        if ($request->isMethod('post')) {
            $data = $request->request->all();

            if (isset($data['SEUIL_CONSO_ACTIF'])) {
                $data['SEUIL_CONSO_ACTIF'] = 'O';
            } else {
                $data['SEUIL_CONSO_ACTIF'] = 'N';
            }
            $client->setSeuilConso($data);
        }

        $user             = $this->container->get('security.token_storage')->getToken()->getAttribute('soap.user');
        $logement         = $client->getTableauBordOccupant($user->FK);


        $locals = [
            'logement'  => $logement,
            'consoTabs' => $logementService->generateTabConsos($logement),
            'user' => $user,
			'modeoccupant'       => true,
            'alertes' => true
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

        return $this->render('Occupant/alertes.html.twig', $locals);
    }
}
