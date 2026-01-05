<?php

namespace App\Controller;

use App\Service\Anomalie;
use App\Service\Depannage;
use App\Service\Dysfonctionnement;
use App\Service\Fuite;
use DateTime;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\GetImmeublesParams;
use App\Service\GetReportParams;
use App\Service\Immeuble;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Class GestionParcController
 * @package App\Controller
 */
class GestionParcController extends  AbstractTechemController
{

    /**
     * Affiche la liste des immeubles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $client = $this->getClient();

        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $locals = [
            'board'   => $client->getMyTableauBordClient(),
            'filters' => [],
            'gestion' => true,
            'active' => false
        ];

        return $this->render('GestionParc:index.html.twig', $locals);
    }

    /**
     * Partial view
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return string
     */
    //#[Route('/gestionParc/filtre', name: 'TechemCoreBundle_gestionParc_result')]
    public function filterResultAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $locals = [
            'immeubles' => [],
        ];

        $params                       = new GetImmeublesParams();
        $params->NBANOMALIES          = true;
        $params->NBDEPANNAGES         = true;
        $params->NBDYSFONCTIONNEMENTS = true;
        $params->NBFUITES             = true;
        $params->NBCOMPTEURS          = true;

        $requestParams = $request->attributes->get('requestParams', []);

        $ref = $requestParams['ref'] ?? null;
        $refNumero = $requestParams['ref_numero'] ?? null;
        $nom = $requestParams['nom'] ?? null;
        $tout = $requestParams['tout'] ?? null;
        $adresse = $requestParams['adresse'] ?? null;
        $search = $requestParams['search'] ?? false;


        if ($search !== false) {
            if (!is_null($ref) || !is_null($refNumero) || !is_null($nom) || !is_null($tout) || !is_null($adresse)) {
                $params->FIELD_REF              = $ref;
                $params->FIELD_REF_NUMERO       = $refNumero;
                $params->FIELD_NOM              = $nom;
                $params->FIELD_ALLFIELDS        = $tout;
                $params->FIELD_ADRESSE_CP_VILLE = $adresse;

                $immeubles = $client->getMyImmeubles($params);
            } else {
                $immeubles = [];
            }
        } else {
            $immeubles = $client->getMyImmeubles($params);
        }

        foreach ($immeubles as $immeuble) {
            $locals['immeubles'][] = $immeuble;
        }
        $locals['gestion'] = true;

        return $this->render('GestionParc:_list_immeubles.html.twig', $locals);
    }

    /**
     * Affiche un immeuble
     *
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showAction($pkImmeuble, Immeuble $immeubleService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble         = $client->getTableauBordImmeuble($pkImmeuble);


        $tabs_top_consos      = $immeubleService->generateTabTopConsos($immeuble);
        $tabs_evo_consos      = $immeubleService->generateTabEvoConsos($immeuble);
        $evolution_charts_js  = $immeubleService->generateEvolutionChartsDataByTab($immeuble, $tabs_evo_consos);
        $comparative_chart_js = $immeubleService->generateComparativeChartData($immeuble);

        // Variables récupérées du webservice
        $installed = $immeuble->ImmeubleEC->Chantier->NbCompteursPoses;

        $total     = $immeuble->ImmeubleEC->Chantier->NbCompteursCommandes;
        $remaining = $total - $installed;
        if ($total !== 0) {
            $installed_percent = (int) (100 * $installed) / $total;
            $remaining_percent = (int) (100 * $remaining) / $total;
        } else {
            $installed_percent = 100;
            $remaining_percent = 0;
        }
        $date = new \DateTime($immeuble->ImmeubleEC->Chantier->DateEntreeChantier);

        $chantier = [
            'installed'         => $installed,
            'installed_percent' => $installed_percent,
            'remaining'         => $remaining,
            'remaining_percent' => $remaining_percent,
            'total'             => $installed + $remaining,
            'date'              => $date->format('d/m/Y'),
        ];

        $locals = [
            'immeuble'             => $immeuble,
            'evolution_charts_js'  => $evolution_charts_js,
            'comparative_chart_js' => $comparative_chart_js,
            'tabs_top_consos'      => $tabs_top_consos,
            'tabs_evo_consos'      => $tabs_evo_consos,
            'chantier'             => $chantier,
        ];

        return $this->render('GestionParc:show.html.twig', $locals);
    }

    /**
     * Affiche un dépannage
     *
     * @param $pkImmeuble
     * @param $pkIntervention
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function showInterventionAction($pkImmeuble, $pkIntervention)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble  = $client->getTableauBordImmeuble($pkImmeuble);
        $depannage = $client->getDetailDepannage($pkIntervention);

        $locals = [
            'immeuble'  => $immeuble,
            'depannage' => $depannage,
        ];

        return $this->render('GestionParc:showIntervention.html.twig', $locals);
    }

    /**
     * Affiche la liste des dépannages
     *
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listInterventionsAction($pkImmeuble, Depannage $depannageService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble          = $client->getTableauBordImmeuble($pkImmeuble);
        $depannages        = $client->getInterventionsImmeuble($pkImmeuble);

        $locals = [
            'immeuble'   => $immeuble,
            'depannages' => $depannages,
            'filters'    => $depannageService->extractFiltersValues($depannages),
        ];

        return $this->render('GestionParc:listInterventions.html.twig', $locals);
    }

    /**
     * Affiche la liste des fuites
     *
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listLeaksAction($pkImmeuble, Fuite $fuiteService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble      = $client->getTableauBordImmeuble($pkImmeuble);
        $fuites        = $client->getFuitesImmeuble($pkImmeuble);

        $locals = [
            'immeuble' => $immeuble,
            'fuites'   => $fuites,
            'filters'  => $fuiteService->extractFiltersValues($fuites),
        ];

        return $this->render('GestionParc:listLeaks.html.twig', $locals);
    }

    /**
     * Affiche le relevé
     *
     * @param $request
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function reportAction(Request $request, $pkImmeuble, $type, $energie)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $date   = $request->request->get('date');
        $report = $client->getReportImmeuble($pkImmeuble, $type, $energie, $date);
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

    //    /**
    //     * @param \Symfony\Component\HttpFoundation\Request $request
    //     * @return \Symfony\Component\HttpFoundation\Response
    //     */
    //    public function searchAction(Request $request)
    //    {
    //        $client = $this->getClient();
    //        if (is_null($client)) {
    //            return $this->redirectToRoute('logout');
    //        }
    //
    //        $board = $client->getMyTableauBordClient();
    //
    //        $locals = array(
    //            'board' => $board,
    //        );
    //
    //        return $this->render('GestionParc:index.html.twig', $locals);
    //    }

    /**
     * Affiche la liste des anomalies
     *
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listAnomaliesAction($pkImmeuble, Anomalie $anomalieService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble         = $client->getTableauBordImmeuble($pkImmeuble);
        $anomalies        = $client->getAnomaliesImmeuble($pkImmeuble);

        $locals = [
            'immeuble'  => $immeuble,
            'anomalies' => $anomalies,
            'filters'   => $anomalieService->extractFiltersValues($anomalies),
        ];

        return $this->render('GestionParc:listAnomalies.html.twig', $locals);
    }

    /**
     * Affiche la liste des anomalies
     *
     * @param $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function listDysfunctionsAction($pkImmeuble, Dysfonctionnement $dysfonctionnementService)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $immeuble                  = $client->getTableauBordImmeuble($pkImmeuble);
        $dysfonctionnements        = $client->getDysfonctionnementsImmeuble($pkImmeuble);

        $locals = [
            'immeuble'           => $immeuble,
            'dysfonctionnements' => $dysfonctionnements,
            'filters'            => $dysfonctionnementService->extractFiltersValues($dysfonctionnements),
        ];
        return $this->render('GestionParc:listDysfunctions.html.twig', $locals);
    }

    /**
     * Export anomalies
     *
     * @param \Symfony\Component\HttpFoundation\Request $request
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exportAnomaliesAction($pkImmeuble, Anomalie $anomalieService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $anomalies        = $client->getAnomaliesImmeuble($pkImmeuble);
        $data             = $anomalieService->export($anomalies);
        $helper           = $this->container->get('excel.helper');
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
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exportLeaksAction($pkImmeuble, Fuite $fuiteService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $fuites        = $client->getFuitesImmeuble($pkImmeuble);
        $data          = $fuiteService->export($fuites);
        $helper        = $this->container->get('excel.helper');
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
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exportInterventionsAction($pkImmeuble, Depannage $depannageService)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $depannages        = $client->getInterventionsImmeuble($pkImmeuble);
        $data              = $depannageService->export($depannages);

        $helper = $this->container->get('excel.helper');
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
     * @param                                           $pkImmeuble
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function exportDysfunctionsAction(Dysfonctionnement $dysfonctionnementService, $pkImmeuble)
    {
        ini_set('max_execution_time', 120);
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $dysfonctionnements        = $client->getDysfonctionnementsImmeuble($pkImmeuble);
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
     * @param \Symfony\Component\HttpFoundation\Request $request
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function interventionAction(Request $request, $pkImmeuble)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $docType    = $request->query->get('doc-type');
        $dateBegin  = $request->query->get('date-begin');
        $dateEnd    = $request->query->get('date-end');

        if ($this->validateDate($dateBegin, 'd/m/Y') && $this->validateDate($dateEnd, 'd/m/Y')) {
            $params             = new GetReportParams();
            $params->PKIMMEUBLE = $pkImmeuble;
            $params->DATE1      = $dateBegin;
            $params->DATE2      = $dateEnd;

            if ($docType == 'synthese-inte') {
                $report = $client->getReport('LIVRET_INTER_SYNTHESE', $params);
            } elseif ($docType == 'detail-inte') {
                $report = $client->getReport('LIVRET_INTER_DETAIL', $params);
            } elseif ($docType == 'detail-excel-inte') {
                $report = $client->getExcel('LIVRET_INTER_LISTE', $params);
            } else {

                throw new NotFoundHttpException();
            }

            if (empty($report)) {
                throw new NotFoundHttpException();
            }

            $response = new Response($report);
            if ($docType == 'detail-excel-inte') {
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
        } else {
            throw new NotFoundHttpException();
        }
    }

    public function validateDate($date, $format = 'Y-m-d H:i:s')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }

    public function dd($var)
    {
        echo '<pre style="background-color: #2B333F; color: #fff8f8;padding: 15px;" >';
        var_dump($var);
        echo '</pre>';
        die;
    }

    public function vd($var)
    {
        echo '<pre style="background-color: #2B333F; color: #fff8f8;padding: 15px;" >';
        var_dump($var);
        echo '</pre>';
    }
}
