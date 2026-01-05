<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Class InterventionController
 * @package App\Controller
 */
class InterventionController extends  AbstractTechemController
{
    //#[Route('/depannage/{pkDepannage}', name: 'TechemCoreBundle_Intervention_report')]
    public function reportAction($pkDepannage)
    {
        $client = $this->getClient();
        if(is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $report = $client->getReportDepannage($pkDepannage);
        if(empty($report)) {
            throw new NotFoundHttpException();
        }
        $response = new Response($report);
        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Disposition', 'inline; filename=relevé-'.date('d-m-Y'));
        $response->headers->set('Content-Transfer-Encoding', 'binary');
        $response->headers->set('Expires', 0);
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Content-Length', strlen($report));

        return $response;
    }
}