<?php

namespace App\Controller;

use App\Controller\AbstractTechemController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Class FactureController
 * @package App\Controller
 */
class FactureController extends  AbstractTechemController
{
    //#[Route('/factures', name: 'TechemCoreBundle_facture_index', requirements: ['_locale' => 'en|fr'])]
    public function indexAction()
    {
        $client = $this->getClient();

        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $factures = $client->getFactures();
        if (empty($factures)) {
            throw new NotFoundHttpException();
        }
        $listFactures = (array) $factures->ListeFactures;
        if (isset($listFactures['facture'])) {
            $listFactures = $listFactures['facture'];
        }

        foreach ($listFactures as &$facture) {
            $facture->DateEdition = date('d/m/Y', strtotime($facture->DateEdition));
            $facture->MontantTotalHT = number_format($facture->MontantTotalHT, 2, ',', ' ') . ' €';
            $facture->MontantTotalTTC = number_format($facture->MontantTotalTTC, 2, ',', ' ') . ' €';
            $facture->MontantTotalAPayer = number_format($facture->MontantTotalAPayer, 2, ',', ' ') . ' €';
        }

        $locals = [
            'board' => $client->getMyTableauBordClient(),
            'factures' => json_encode($listFactures),
            'lengthFacture' => count($listFactures)
        ];

        return $this->render('Facture/index.html.twig', $locals);
    }


    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    //#[Route('/factures/download/{pkFacture}', name: 'TechemCoreBundle_facture_report')]
    public function reportAction($pkFacture)
    {

        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $report = $client->getReportFacture($pkFacture);

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
}
