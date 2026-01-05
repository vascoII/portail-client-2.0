<?php

namespace App\Controller;

use DateTime;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Service\GetReportParams;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use App\Service\Client;

/**
 * Class TableauBordClientController
 * @package App\Controller
 */
class TableauBordClientController extends  AbstractTechemController
{

    //#[Route('/parc', name: 'TechemCoreBundle_TableauBordClient_index', requirements: ['_locale' => 'en|fr'])]
    public function indexAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }
		

        $board = $client->getMyTableauBordClient();

        // Variables récupérées du webservice
        $installed = $board->NbCompteursPoses;
        $total     = $board->NbCompteursCommandes;
        $remaining = $total - $installed;
        if ($total > 0) {
            $installed_percent = (int) (100 * $installed) / $total;
            $remaining_percent = (int) (100 * $remaining) / $total;
        } else {
            $installed_percent = 100;
            $remaining_percent = 0;
        }

        $date = null;

        $chantier = [
            'installed'         => $installed,
            'installed_percent' => $installed_percent,
            'remaining'         => $remaining,
            'remaining_percent' => $remaining_percent,
            'total'             => $total,
            'date'              => $date,
        ];

        $locals = [
            'board'    => $board,
            'chantier' => $chantier,
        ];
		if (file_exists('./../demo.txt')){
			$locals['demo'] = 'demo';
			$locals['board']->PcImmeublesTransfertFichiers = '100' ;
		}


        return $this->render('TableauBordClient/index.html.twig', $locals);
    }



    public function validateDate($date, $format = 'Y-m-d H:i:s')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) == $date;
    }
}
