<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

class SearchController extends  AbstractTechemController
{

    //#[Route("/recherche", name: "TechemCoreBundle_Search_index")]
    public function indexAction(Request $request)
    {
        $client = $this->getClient();
        if (is_null($client)) {
            return $this->redirectToRoute('logout');
        }

        $filtersMin3 = $this->getValidFilters($request, ['nom', 'tout', 'adresse'], 3);
        $filtersMin1 = $this->getValidFilters($request, ['type', 'ref', 'ref_numero'], 1);

        $extra = ['search' => true];

        $params = array_merge($filtersMin1, $filtersMin3, $extra);

        $type = $request->query->get('type');

        if ($type == 'immeuble') {
            $controller = 'App\Controller\ImmeubleController::indexAction';
            $response = $this->forward($controller, [], $params);
        } elseif ($type == 'occupant') {
            $controller = 'App\Controller\LogementController::searchAction';
            $response = $this->forward($controller, [], $params);
        } else {
            $board = $client->getMyTableauBordClient();
            $locals = [
                'board' => $board,
                'params' => $params,
            ];
            $response = $this->render('Search/index.html.twig', $locals);
        }

        return $response;
    }

    private function getValidFilters(Request $request, array $filters, int $minLength): array
    {
        $validFilters = [];

        foreach ($filters as $filter) {
            $value = trim($request->query->get($filter, ''));
            if (strlen($value) >= $minLength) {
                $validFilters[$filter] = $value;
            }
        }

        return $validFilters;
    }

}